const OpenAI = require("openai");
const puppeteer=require("puppeteer")

const openai = new OpenAI({
    baseURL: "https://openrouter.ai/api/v1",
    apiKey: process.env.OPENROUTER_API_KEY,
});

// Free model with structured output support on OpenRouter
const FREE_MODEL = "nvidia/nemotron-3-super-120b-a12b:free";

/**
 * Sentinel error thrown when the AI response is cut off due to hitting the
 * token limit. The controller catches this specifically to trigger a retry
 * with a reduced question count instead of returning a generic 500.
 */
class TruncatedResponseError extends Error {
    constructor(message = "AI response was truncated (token limit hit)") {
        super(message);
        this.name = "TruncatedResponseError";
    }
}

/**
 * Safely parse JSON from a model response.
 * - Strips markdown code fences if the model wrapped its output.
 * - Throws TruncatedResponseError on SyntaxError so callers can distinguish
 *   a truncated/malformed response from a completely different failure.
 */
function safeParseJson(content) {
    if (!content) throw new TruncatedResponseError("Empty response from model");
    const stripped = content.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();
    try {
        return JSON.parse(stripped);
    } catch (err) {
        if (err instanceof SyntaxError) {
            throw new TruncatedResponseError(
                `JSON parse failed — response is likely truncated. Raw snippet: "${stripped.slice(0, 120)}..."`
            );
        }
        throw err;
    }
}

const interviewReportSchema = {
    type: "object",
    properties: {
        matchScore: {
            type: "number",
            description: "A score between 0 and 100 indicating how well the candidate's profile matches the job description"
        },
        technicalQuestions: {
            type: "array",
            description: "Technical questions that can be asked in the interview along with their intention and how to answer them",
            items: {
                type: "object",
                properties: {
                    question: { type: "string", description: "The technical question can be asked in the interview" },
                    intention: { type: "string", description: "The intention of interviewer behind asking this question" },
                    answer: { type: "string", description: "How to answer this question, what points to cover, what approach to take etc." }
                },
                required: ["question", "intention", "answer"],
                additionalProperties: false
            }
        },
        behavioralQuestions: {
            type: "array",
            description: "Behavioral questions that can be asked in the interview along with their intention and how to answer them",
            items: {
                type: "object",
                properties: {
                    question: { type: "string", description: "The behavioral question can be asked in the interview" },
                    intention: { type: "string", description: "The intention of interviewer behind asking this question" },
                    answer: { type: "string", description: "How to answer this question, what points to cover, what approach to take etc." }
                },
                required: ["question", "intention", "answer"],
                additionalProperties: false
            }
        },
        skillGaps: {
            type: "array",
            description: "List of skill gaps in the candidate's profile along with their severity",
            items: {
                type: "object",
                properties: {
                    skill: { type: "string", description: "The skill which the candidate is lacking" },
                    severity: { type: "string", enum: ["low", "medium", "high"], description: "The severity of this skill gap" }
                },
                required: ["skill", "severity"],
                additionalProperties: false
            }
        },
        preparationPlan: {
            type: "array",
            description: "A day-wise preparation plan for the candidate to follow in order to prepare for the interview effectively",
            items: {
                type: "object",
                properties: {
                    day: { type: "number", description: "The day number in the preparation plan, starting from 1" },
                    focus: { type: "string", description: "The main focus of this day in the preparation plan, e.g. data structures, system design, mock interviews etc." },
                    tasks: {
                        type: "array",
                        description: "List of tasks to be done on this day",
                        items: { type: "string" }
                    }
                },
                required: ["day", "focus", "tasks"],
                additionalProperties: false
            }
        },
        title: {
            type: "string",
            description: "The title of the job for which the interview report is generated"
        }
    },
    required: ["matchScore", "technicalQuestions", "behavioralQuestions", "skillGaps", "preparationPlan", "title"],
    additionalProperties: false
}

const SYSTEM_PROMPT = `You are an expert interview preparation assistant. You MUST respond with valid JSON matching the exact structure shown below.

EXAMPLE OUTPUT FORMAT (follow this structure exactly):
{
  "matchScore": 75,
  "title": "Senior Software Engineer",
  "technicalQuestions": [
    {
      "question": "Explain the difference between REST and GraphQL.",
      "intention": "To evaluate the candidate's understanding of API design paradigms.",
      "answer": "Start by explaining that REST uses resource-based URLs with HTTP methods, while GraphQL uses a single endpoint with a query language. Highlight that REST can lead to over-fetching/under-fetching while GraphQL lets clients request exactly what they need. Mention trade-offs: REST is simpler and more cacheable, GraphQL is more flexible. Give a real example from your experience where you chose one over the other and explain why."
    }
  ],
  "behavioralQuestions": [
    {
      "question": "Tell me about a time you had a conflict with a teammate.",
      "intention": "To assess the candidate's conflict resolution and communication skills.",
      "answer": "Use the STAR method. Describe the Situation briefly, explain the Task at hand, detail the Action you took to resolve the conflict (e.g., initiated a 1-on-1 conversation, proposed a compromise), and share the Result. Emphasize empathy, active listening, and a focus on the team's shared goals rather than personal differences."
    }
  ],
  "skillGaps": [
    { "skill": "Kubernetes", "severity": "medium" }
  ],
  "preparationPlan": [
    { "day": 1, "focus": "Core Concepts Review", "tasks": ["Review data structures", "Practice coding problems"] }
  ]
}

CRITICAL RULES:
1. Every object in "technicalQuestions" MUST have exactly 3 fields: "question", "intention", "answer"
2. Every object in "behavioralQuestions" MUST have exactly 3 fields: "question", "intention", "answer"
3. The "answer" field MUST be a detailed, multi-sentence guide explaining HOW to answer the question
4. NEVER omit the "answer" field - it is the most important field for the candidate`;

/**
 * Generate a comprehensive interview preparation report via the AI model.
 *
 * @param {object} params
 * @param {string} params.resume          - Extracted plain text from the uploaded PDF (may be empty).
 * @param {string} params.selfDescription - Free-text profile the user typed.
 * @param {string} params.jobDescription  - The target job description.
 * @param {object} [params.options]       - Optional generation controls.
 * @param {number} [params.options.maxQuestions=5] - Max questions per category to request.
 *                                                   Lower values reduce token usage on retries.
 *
 * @throws {TruncatedResponseError} When the model hits its token cap before
 *         finishing the JSON payload. The controller uses this to trigger a
 *         retry with fewer questions.
 * @throws {Error} For any other AI or network failure.
 */
async function generateInterviewReport({ resume, selfDescription, jobDescription, options = {} }) {
    const { maxQuestions = 5 } = options;

    const questionCountHint = maxQuestions < 5
        ? `IMPORTANT: Due to length constraints, generate at most ${maxQuestions} technical questions and ${maxQuestions} behavioral questions.`
        : `Generate 5 technical questions and 5 behavioral questions.`;

    const prompt = `Generate a comprehensive interview report for this candidate.

Resume: ${resume}
Self Description: ${selfDescription}
Job Description: ${jobDescription}

${questionCountHint}
Remember: Each question in technicalQuestions and behavioralQuestions MUST include "question", "intention", AND "answer" fields. The "answer" must be a detailed guide on how to answer.`;

    const response = await openai.chat.completions.create({
        model: FREE_MODEL,
        max_tokens: 8000,
        messages: [
            { role: "system", content: SYSTEM_PROMPT },
            { role: "user",   content: prompt }
        ],
        response_format: {
            type: "json_schema",
            json_schema: {
                name: "interview_report",
                strict: true,
                schema: interviewReportSchema
            }
        }
    });

    const choice = response.choices[0];

    // If the model ran out of tokens before closing the JSON, throw immediately
    // so the caller can decide whether to retry rather than hitting a SyntaxError
    // deep inside safeParseJson with no context.
    if (choice.finish_reason === "length") {
        throw new TruncatedResponseError(
            `Model stopped at token limit (finish_reason=length). maxQuestions was ${maxQuestions}.`
        );
    }

    // safeParseJson also throws TruncatedResponseError on SyntaxError in case
    // the finish_reason wasn't reported accurately by the provider.
    const report = safeParseJson(choice.message.content);

    // Post-processing: guarantee every question has an answer field
    const ensureAnswers = (questions) => {
        if (!Array.isArray(questions)) return questions;
        return questions.map(q => {
            if (!q.answer || q.answer.trim() === "") {
                q.answer = `To answer "${q.question}", prepare key points related to the topic, use concrete examples from your experience, and structure your response clearly. Focus on demonstrating both theoretical knowledge and practical application.`;
            }
            return q;
        });
    };

    if (report.technicalQuestions) report.technicalQuestions = ensureAnswers(report.technicalQuestions);
    if (report.behavioralQuestions) report.behavioralQuestions = ensureAnswers(report.behavioralQuestions);

    return report;
}

// --- Resume PDF Generation ---

const resumeHtmlSchema = {
    type: "object",
    properties: {
        html: {
            type: "string",
            description: "The complete HTML content of the resume, including inline CSS styles. This HTML will be rendered to PDF using puppeteer."
        }
    },
    required: ["html"],
    additionalProperties: false
}

const RESUME_SYSTEM_PROMPT = `You are an expert resume writer. You create professional, ATS-friendly resumes in HTML format.

CRITICAL RULES:
1. The resume HTML must include ALL styles inline or in a <style> tag within the HTML — no external stylesheets.
2. The design should be clean, professional, and simple — use subtle colors and modern fonts (e.g. Arial, Calibri, Helvetica).
3. The resume must be ATS-friendly: use standard section headings (Experience, Education, Skills, etc.), avoid tables for layout, use semantic HTML.
4. Keep the resume concise — ideally 1-2 pages when rendered as A4 PDF.
5. The content must sound natural and human-written, NOT AI-generated.
6. Tailor the resume specifically to the job description, highlighting relevant skills and experience.
7. Use proper spacing, margins, and font sizes for readability.
8. You may use subtle color accents for headings or dividers, but keep the overall design professional.
9. Respond with a JSON object containing a single "html" field with the complete HTML content.`;

async function generatePdfFromHtml(htmlContent) {
    const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();
    await page.setContent(htmlContent, { waitUntil: "networkidle0" });

    const pdfBuffer = await page.pdf({
        format: "A4",
        margin: {
            top: "20mm",
            bottom: "20mm",
            left: "15mm",
            right: "15mm"
        },
        printBackground: true
    });

    await browser.close();

    return pdfBuffer;
}

async function generateResumePdf({ resume, selfDescription, jobDescription }) {

    const prompt = `Generate a professional resume in HTML format for a candidate with the following details:

Resume: ${resume}
Self Description: ${selfDescription}
Job Description: ${jobDescription}

Tailor the resume for the given job description. Highlight the candidate's strengths and relevant experience. The HTML should include inline/embedded CSS and be ready to convert to PDF. Keep it to 1-2 pages, ATS-friendly, and natural-sounding.`;

    const response = await openai.chat.completions.create({
        model: FREE_MODEL,
        max_tokens: 3000,
        messages: [
            {
                role: "system",
                content: RESUME_SYSTEM_PROMPT
            },
            {
                role: "user",
                content: prompt
            }
        ],
        response_format: {
            type: "json_schema",
            json_schema: {
                name: "resume_html",
                strict: true,
                schema: resumeHtmlSchema
            }
        }
    });

    const jsonContent = safeParseJson(response.choices[0].message.content);

    const pdfBuffer = await generatePdfFromHtml(jsonContent.html);

    return pdfBuffer;
}

module.exports = { generateInterviewReport, generateResumePdf, TruncatedResponseError }