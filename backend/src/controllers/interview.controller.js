const pdfParse = require("pdf-parse")
const { generateInterviewReport, generateResumePdf, TruncatedResponseError } = require("../services/ai.service")
const interviewReportModel = require("../models/interviewReport.model")

// ─── Constants ────────────────────────────────────────────────────────────────

/** Maximum questions per category on the first attempt. */
const INITIAL_MAX_QUESTIONS = 5;

/**
 * Reduced question count for the automatic retry when the first attempt is
 * truncated.  Keeping it at 2 gives the model much more headroom for the
 * detailed answer text without hitting the token cap.
 */
const RETRY_MAX_QUESTIONS = 2;

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Call generateInterviewReport and, on TruncatedResponseError, automatically
 * retry once with a lower maxQuestions value.
 *
 * Returns: { report, wasRetried }
 * Throws:  TruncatedResponseError  – if even the retry is truncated (caller
 *                                    should respond with 422).
 *          Error                   – for any other failure (caller → 500).
 */
async function attemptGenerateWithRetry({ resume, selfDescription, jobDescription }) {
    // ── Attempt 1: full question count ────────────────────────────────────────
    try {
        const report = await generateInterviewReport({
            resume,
            selfDescription,
            jobDescription,
            options: { maxQuestions: INITIAL_MAX_QUESTIONS }
        });
        return { report, wasRetried: false };
    } catch (err) {
        if (!(err instanceof TruncatedResponseError)) {
            // Not a truncation – surface immediately, don't retry.
            throw err;
        }
        console.warn(
            `[Interview] Initial attempt truncated (maxQuestions=${INITIAL_MAX_QUESTIONS}). ` +
            `Retrying with maxQuestions=${RETRY_MAX_QUESTIONS}…`
        );
    }

    // ── Attempt 2: reduced question count ─────────────────────────────────────
    // TruncatedResponseError is intentionally NOT caught here; if the retry
    // also fails the caller's catch block will send the 422.
    const report = await generateInterviewReport({
        resume,
        selfDescription,
        jobDescription,
        options: { maxQuestions: RETRY_MAX_QUESTIONS }
    });

    return { report, wasRetried: true };
}

// ─── Controllers ──────────────────────────────────────────────────────────────

async function generateInterViewReportController(req, res) {
    // 1. Parse the uploaded PDF (if any)
    let resumeText = "";
    if (req.file) {
        try {
            const resumeContent = await (new pdfParse.PDFParse(Uint8Array.from(req.file.buffer))).getText();
            resumeText = resumeContent.text || "";
        } catch (err) {
            console.error("PDF parse error:", err);
            return res.status(400).json({ message: "Failed to parse uploaded PDF resume." });
        }
    }

    const { selfDescription, jobDescription } = req.body;

    // 2. Basic input validation
    if (!jobDescription) {
        return res.status(400).json({ message: "Job description is required." });
    }
    if (!resumeText && !selfDescription) {
        return res.status(400).json({ message: "Either a Resume or a Self Description is required." });
    }

    // 3. Generate with automatic retry on truncation
    try {
        const { report: interViewReportByAi, wasRetried } = await attemptGenerateWithRetry({
            resume: resumeText,
            selfDescription,
            jobDescription
        });

        if (wasRetried) {
            console.info(
                "[Interview] Report generated on retry with reduced question count " +
                `(maxQuestions=${RETRY_MAX_QUESTIONS}).`
            );
        }

        const interviewReport = await interviewReportModel.create({
            user: req.user.id,
            resume: resumeText,
            selfDescription,
            jobDescription,
            ...interViewReportByAi
        });

        return res.status(201).json({
            message: "Interview report generated successfully" +
                     (wasRetried ? " (reduced question count due to length constraints)" : ""),
            interviewReport
        });

    } catch (err) {
        // Truncation survived both attempts → inform the client with a 422
        if (err instanceof TruncatedResponseError) {
            console.error("[Interview] Both attempts truncated:", err.message);
            return res.status(422).json({
                code: "RESPONSE_TRUNCATED",
                message:
                    "The AI could not generate a complete plan because your inputs are too long " +
                    "for the model's output limit. Please try shortening your job description or " +
                    "resume, or reduce the amount of detail in your self-description.",
                detail: err.message
            });
        }

        // Any other error (network, OpenRouter API, DB, etc.) → 500
        console.error("Report generation error:", err);
        return res.status(500).json({
            message: "Failed to generate interview plan due to an AI service error.",
            error: err.message || String(err)
        });
    }
}

async function generateResumePdfController(req, res) {
    const { interviewReportId } = req.params

    const interviewReport = await interviewReportModel.findById(interviewReportId)

    if (!interviewReport) {
        return res.status(404).json({
            message: "Interview report not found."
        })
    }

    const { resume, jobDescription, selfDescription } = interviewReport

    const pdfBuffer = await generateResumePdf({ resume, jobDescription, selfDescription })

    res.set({
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename=resume_${interviewReportId}.pdf`
    })

    res.send(pdfBuffer)
}

async function getInterviewReportByIdController(req, res) {

    const { interviewId } = req.params

    const interviewReport = await interviewReportModel.findOne({ _id: interviewId, user: req.user.id })

    if (!interviewReport) {
        return res.status(404).json({
            message: "Interview report not found."
        })
    }

    res.status(200).json({
        message: "Interview report fetched successfully.",
        interviewReport
    })
}

async function getAllInterviewReportsController(req, res) {
    const interviewReports = await interviewReportModel
        .find({ user: req.user.id })
        .sort({ createdAt: -1 })
        .select("-resume -selfDescription -jobDescription -__v -technicalQuestions -behavioralQuestions -skillGaps -preparationPlan")

    res.status(200).json({
        message: "Interview reports fetched successfully.",
        interviewReports
    })
}


module.exports = {
    generateInterViewReportController,
    getInterviewReportByIdController,
    getAllInterviewReportsController,
    generateResumePdfController
}