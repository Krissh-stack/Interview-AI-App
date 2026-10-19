import axios from "axios";

const api = axios.create({
    baseURL: "http://localhost:3000",
    withCredentials: true,
})

/**
 * Service to generate interview plan based on user self description, resume and job description.
 */
export const generateInterviewReport = async ({ 
    jobDescription, 
    selfDescription, 
    resumeFile, 
    experienceLevel = "Mid-Level", 
    difficulty = "Standard" 
}) => {
    const formData = new FormData()
    formData.append("jobDescription", jobDescription)
    if (selfDescription) formData.append("selfDescription", selfDescription)
    if (resumeFile) formData.append("resume", resumeFile)
    formData.append("experienceLevel", experienceLevel)
    formData.append("difficulty", difficulty)

    const response = await api.post("/api/interview/", formData, {
        headers: {
            "Content-Type": "multipart/form-data"
        }
    })

    return response.data
}

/**
 * Service to get interview report by interviewId.
 */
export const getInterviewReportById = async (interviewId) => {
    const response = await api.get(`/api/interview/report/${interviewId}`)
    return response.data
}

/**
 * Service to get all interview reports of logged in user.
 */
export const getAllInterviewReports = async () => {
    const response = await api.get("/api/interview/")
    return response.data
}

/**
 * Service to evaluate a candidate's answer for a specific question.
 */
export const evaluateAnswer = async ({ interviewId, questionId, questionType, candidateAnswer }) => {
    const response = await api.post(`/api/interview/${interviewId}/evaluate-answer`, {
        questionId,
        questionType,
        candidateAnswer
    })
    return response.data
}

/**
 * Service to generate resume PDF based on user report.
 */
export const generateResumePdf = async ({ interviewReportId }) => {
    const response = await api.post(`/api/interview/resume/pdf/${interviewReportId}`, null, {
        responseType: "blob"
    })
    return response.data
}

/**
 * Service to download full interview assessment PDF report.
 */
export const getAssessmentPdf = async (interviewId) => {
    const response = await api.get(`/api/interview/pdf/${interviewId}`, {
        responseType: "blob"
    })
    return response.data
}

/**
 * Service to fetch user's interview preparation analytics.
 */
export const getAnalytics = async () => {
    const response = await api.get("/api/interview/analytics")
    return response.data
}

/**
 * Service to delete an interview report.
 */
export const deleteInterviewReport = async (interviewId) => {
    const response = await api.delete(`/api/interview/${interviewId}`)
    return response.data
}