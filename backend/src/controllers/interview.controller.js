const pdfParse=require("pdf-parse")
const { generateInterviewReport, generateResumePdf }=require("../services/ai.service")
const interviewReportModel=require("../models/interviewReport.model")

async function generateInterViewReportController(req, res) {
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

    if (!jobDescription) {
        return res.status(400).json({ message: "Job description is required." });
    }
    if (!resumeText && !selfDescription) {
        return res.status(400).json({ message: "Either a Resume or a Self Description is required." });
    }

    const interViewReportByAi = await generateInterviewReport({
        resume: resumeText,
        selfDescription,
        jobDescription
    });

    const interviewReport = await interviewReportModel.create({
        user: req.user.id,
        resume: resumeText,
        selfDescription,
        jobDescription,
        ...interViewReportByAi
    });

    res.status(201).json({
        message: "interview report generated successfully",
        interviewReport
    });
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
    const interviewReports = await interviewReportModel.find({ user: req.user.id }).sort({ createdAt: -1 }).select("-resume -selfDescription -jobDescription -__v -technicalQuestions -behavioralQuestions -skillGaps -preparationPlan")

    res.status(200).json({
        message: "Interview reports fetched successfully.",
        interviewReports
    })
}


module.exports={generateInterViewReportController, getInterviewReportByIdController, getAllInterviewReportsController, generateResumePdfController}