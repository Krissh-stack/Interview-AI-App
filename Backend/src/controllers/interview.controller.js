const pdf = require("pdf-parse")
const { 
    generateInterviewReport, 
    evaluateCandidateAnswer, 
    generateResumePdf, 
    generateAssessmentReportPdf 
} = require("../services/ai.service")
const interviewReportModel = require("../models/interviewReport.model")

/**
 * @description Controller to generate interview report based on user self description, resume and job description.
 * @route POST /api/interview/
 * @access Private
 */
async function generateInterViewReportController(req, res) {
    try {
        const { selfDescription, jobDescription, experienceLevel, difficulty } = req.body

        // Validate required fields
        if (!jobDescription || jobDescription.trim().length === 0) {
            return res.status(400).json({
                message: "Job description is required."
            })
        }

        if (!selfDescription && !req.file) {
            return res.status(400).json({
                message: "Either a resume file or a self description is required."
            })
        }

        // Parse resume PDF if uploaded
        let resumeText = selfDescription || ""
        if (req.file) {
            if (req.file.mimetype !== "application/pdf") {
                return res.status(400).json({ message: "Only PDF files are supported for resume upload." })
            }
            try {
                const parsed = await pdf(req.file.buffer)
                resumeText = parsed.text
            } catch (parseError) {
                return res.status(422).json({ 
                    message: "Could not extract text from the uploaded PDF. Please try a different file or enter your details in self-description." 
                })
            }
        }

        // Call AI service
        let interViewReportByAi
        try {
            interViewReportByAi = await generateInterviewReport({
                resume: resumeText,
                selfDescription: selfDescription || "",
                jobDescription
            })
        } catch (aiError) {
            console.error("AI service error:", aiError.message)
            return res.status(502).json({
                message: "The AI service encountered an issue. Please try again."
            })
        }

        // Persist to DB
        const interviewReport = await interviewReportModel.create({
            user: req.user.id,
            resume: resumeText,
            selfDescription: selfDescription || "",
            jobDescription,
            experienceLevel: experienceLevel || "Mid-Level",
            difficulty: difficulty || "Standard",
            ...interViewReportByAi
        })

        res.status(201).json({
            message: "Interview plan generated successfully.",
            interviewReport
        })

    } catch (err) {
        console.error("generateInterViewReportController error:", err)
        res.status(500).json({ message: "An unexpected error occurred. Please try again." })
    }
}

/**
 * @description Controller to get interview report by interviewId.
 * @route GET /api/interview/report/:interviewId
 * @access Private
 */
async function getInterviewReportByIdController(req, res) {
    try {
        const { interviewId } = req.params

        if (!interviewId) {
            return res.status(400).json({ message: "Interview ID is required." })
        }

        const interviewReport = await interviewReportModel.findOne({
            _id: interviewId,
            user: req.user.id
        })

        if (!interviewReport) {
            return res.status(404).json({ message: "Interview report not found." })
        }

        res.status(200).json({
            message: "Interview report fetched successfully.",
            interviewReport
        })

    } catch (err) {
        console.error("getInterviewReportByIdController error:", err)
        if (err.name === "CastError") {
            return res.status(400).json({ message: "Invalid interview ID format." })
        }
        res.status(500).json({ message: "An unexpected error occurred." })
    }
}

/**
 * @description Controller to get all interview reports of logged in user.
 * @route GET /api/interview/
 * @access Private
 */
async function getAllInterviewReportsController(req, res) {
    try {
        const interviewReports = await interviewReportModel
            .find({ user: req.user.id })
            .sort({ createdAt: -1 })
            .select("title matchScore overallPerformanceScore experienceLevel difficulty createdAt")

        res.status(200).json({
            message: "Interview reports fetched successfully.",
            interviewReports
        })

    } catch (err) {
        console.error("getAllInterviewReportsController error:", err)
        res.status(500).json({ message: "An unexpected error occurred." })
    }
}

/**
 * @description Controller to evaluate a candidate's answer to a specific question.
 * @route POST /api/interview/:interviewId/evaluate-answer
 * @access Private
 */
async function evaluateAnswerController(req, res) {
    try {
        const { interviewId } = req.params
        const { questionId, questionType, candidateAnswer } = req.body

        if (!questionId || !candidateAnswer || !candidateAnswer.trim()) {
            return res.status(400).json({ message: "Question ID and candidate answer are required." })
        }

        const report = await interviewReportModel.findOne({
            _id: interviewId,
            user: req.user.id
        })

        if (!report) {
            return res.status(404).json({ message: "Interview session not found." })
        }

        // Search in technical or behavioral questions
        let questionObj = null
        if (questionType === "behavioral") {
            questionObj = report.behavioralQuestions.id(questionId)
        } else {
            questionObj = report.technicalQuestions.id(questionId)
        }

        // Fallback search if type didn't match
        if (!questionObj) {
            questionObj = report.technicalQuestions.id(questionId) || report.behavioralQuestions.id(questionId)
        }

        if (!questionObj) {
            return res.status(404).json({ message: "Question not found in this interview session." })
        }

        // Evaluate using AI
        const evaluation = await evaluateCandidateAnswer({
            question: questionObj.question,
            intention: questionObj.intention,
            modelAnswer: questionObj.answer,
            candidateAnswer: candidateAnswer.trim(),
            questionType: questionType || "technical"
        })

        questionObj.candidateAnswer = candidateAnswer.trim()
        questionObj.evaluation = evaluation
        questionObj.status = "evaluated"

        // Calculate overall performance average
        const allQuestions = [...report.technicalQuestions, ...report.behavioralQuestions]
        const evaluated = allQuestions.filter(q => q.status === "evaluated" && q.evaluation?.overallScore != null)
        if (evaluated.length > 0) {
            const sum = evaluated.reduce((acc, q) => acc + q.evaluation.overallScore, 0)
            report.overallPerformanceScore = Math.round(sum / evaluated.length)
        }

        await report.save()

        res.status(200).json({
            message: "Answer evaluated successfully.",
            evaluation,
            overallPerformanceScore: report.overallPerformanceScore,
            questionId,
            status: "evaluated"
        })

    } catch (err) {
        console.error("evaluateAnswerController error:", err)
        res.status(500).json({ message: "Failed to evaluate answer. Please try again." })
    }
}

/**
 * @description Controller to generate resume PDF based on user report.
 * @route POST /api/interview/resume/pdf/:interviewReportId
 * @access Private
 */
async function generateResumePdfController(req, res) {
    try {
        const { interviewReportId } = req.params

        const interviewReport = await interviewReportModel.findOne({
            _id: interviewReportId,
            user: req.user.id
        })

        if (!interviewReport) {
            return res.status(404).json({ message: "Interview report not found." })
        }

        const { resume, jobDescription, selfDescription } = interviewReport

        const pdfBuffer = await generateResumePdf({ resume, jobDescription, selfDescription })

        res.set({
            "Content-Type": "application/pdf",
            "Content-Disposition": `attachment; filename=resume_${interviewReportId}.pdf`
        })

        res.send(pdfBuffer)

    } catch (err) {
        console.error("generateResumePdfController error:", err)
        res.status(500).json({ message: "Failed to generate resume PDF." })
    }
}

/**
 * @description Controller to download comprehensive interview assessment report PDF.
 * @route GET /api/interview/pdf/:interviewId
 * @access Private
 */
async function getAssessmentPdfController(req, res) {
    try {
        const { interviewId } = req.params

        const interviewReport = await interviewReportModel.findOne({
            _id: interviewId,
            user: req.user.id
        })

        if (!interviewReport) {
            return res.status(404).json({ message: "Interview report not found." })
        }

        const pdfBuffer = await generateAssessmentReportPdf({ report: interviewReport })

        res.set({
            "Content-Type": "application/pdf",
            "Content-Disposition": `attachment; filename=assessment_${interviewId}.pdf`
        })

        res.send(pdfBuffer)

    } catch (err) {
        console.error("getAssessmentPdfController error:", err)
        res.status(500).json({ message: "Failed to generate assessment PDF." })
    }
}

/**
 * @description Controller to get aggregated interview analytics for dashboard.
 * @route GET /api/interview/analytics
 * @access Private
 */
async function getAnalyticsController(req, res) {
    try {
        const reports = await interviewReportModel.find({ user: req.user.id }).sort({ createdAt: 1 })

        const totalInterviews = reports.length
        if (totalInterviews === 0) {
            return res.status(200).json({
                analytics: {
                    totalInterviews: 0,
                    avgMatchScore: 0,
                    avgPerformanceScore: 0,
                    questionsAnswered: 0,
                    history: [],
                    topSkillGaps: []
                }
            })
        }

        let totalMatch = 0
        let totalPerf = 0
        let perfCount = 0
        let questionsAnswered = 0
        const skillGapFreq = {}

        const history = reports.map(r => {
            totalMatch += r.matchScore || 0
            if (r.overallPerformanceScore > 0) {
                totalPerf += r.overallPerformanceScore
                perfCount++
            }

            const allQ = [...(r.technicalQuestions || []), ...(r.behavioralQuestions || [])]
            const answeredInThis = allQ.filter(q => q.status === "evaluated").length
            questionsAnswered += answeredInThis

            ;(r.skillGaps || []).forEach(g => {
                skillGapFreq[g.skill] = (skillGapFreq[g.skill] || 0) + 1
            })

            return {
                id: r._id,
                title: r.title,
                date: r.createdAt,
                matchScore: r.matchScore || 0,
                performanceScore: r.overallPerformanceScore || 0,
                questionsCount: allQ.length,
                answeredCount: answeredInThis
            }
        })

        const topSkillGaps = Object.entries(skillGapFreq)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([skill, count]) => ({ skill, count }))

        res.status(200).json({
            analytics: {
                totalInterviews,
                avgMatchScore: Math.round(totalMatch / totalInterviews),
                avgPerformanceScore: perfCount > 0 ? Math.round(totalPerf / perfCount) : 0,
                questionsAnswered,
                history,
                topSkillGaps
            }
        })

    } catch (err) {
        console.error("getAnalyticsController error:", err)
        res.status(500).json({ message: "Failed to fetch analytics." })
    }
}

/**
 * @description Controller to delete an interview report.
 * @route DELETE /api/interview/:interviewId
 * @access Private
 */
async function deleteInterviewReportController(req, res) {
    try {
        const { interviewId } = req.params

        const deleted = await interviewReportModel.findOneAndDelete({
            _id: interviewId,
            user: req.user.id
        })

        if (!deleted) {
            return res.status(404).json({ message: "Interview report not found." })
        }

        res.status(200).json({ message: "Interview report deleted successfully." })

    } catch (err) {
        console.error("deleteInterviewReportController error:", err)
        res.status(500).json({ message: "Failed to delete interview report." })
    }
}

module.exports = {
    generateInterViewReportController,
    getInterviewReportByIdController,
    getAllInterviewReportsController,
    evaluateAnswerController,
    generateResumePdfController,
    getAssessmentPdfController,
    getAnalyticsController,
    deleteInterviewReportController
}