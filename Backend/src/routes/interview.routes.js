const express = require("express")
const authMiddleware = require("../middlewares/auth.middleware")
const interviewController = require("../controllers/interview.controller")
const upload = require("../middlewares/file.middleware")

const interviewRouter = express.Router()

/**
 * @route POST /api/interview/
 * @description generate new interview report based on user self description, resume pdf and job description.
 * @access private
 */
interviewRouter.post("/", authMiddleware.authUser, upload.single("resume"), interviewController.generateInterViewReportController)

/**
 * @route GET /api/interview/analytics
 * @description get aggregated performance analytics and trends for logged-in user.
 * @access private
 */
interviewRouter.get("/analytics", authMiddleware.authUser, interviewController.getAnalyticsController)

/**
 * @route GET /api/interview/report/:interviewId
 * @description get interview report by interviewId.
 * @access private
 */
interviewRouter.get("/report/:interviewId", authMiddleware.authUser, interviewController.getInterviewReportByIdController)

/**
 * @route GET /api/interview/
 * @description get all interview reports of logged in user.
 * @access private
 */
interviewRouter.get("/", authMiddleware.authUser, interviewController.getAllInterviewReportsController)

/**
 * @route POST /api/interview/:interviewId/evaluate-answer
 * @description evaluate a candidate's answer to a technical or behavioral question.
 * @access private
 */
interviewRouter.post("/:interviewId/evaluate-answer", authMiddleware.authUser, interviewController.evaluateAnswerController)

/**
 * @route POST /api/interview/resume/pdf/:interviewReportId
 * @description generate resume pdf based on user self description, resume content and job description.
 * @access private
 */
interviewRouter.post("/resume/pdf/:interviewReportId", authMiddleware.authUser, interviewController.generateResumePdfController)

/**
 * @route GET /api/interview/pdf/:interviewId
 * @description download comprehensive assessment report PDF.
 * @access private
 */
interviewRouter.get("/pdf/:interviewId", authMiddleware.authUser, interviewController.getAssessmentPdfController)

/**
 * @route DELETE /api/interview/:interviewId
 * @description delete an interview report.
 * @access private
 */
interviewRouter.delete("/:interviewId", authMiddleware.authUser, interviewController.deleteInterviewReportController)

module.exports = interviewRouter