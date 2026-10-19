import { 
    getAllInterviewReports, 
    generateInterviewReport, 
    getInterviewReportById, 
    generateResumePdf, 
    getAssessmentPdf, 
    evaluateAnswer, 
    getAnalytics, 
    deleteInterviewReport 
} from "../services/interview.api"
import { useContext, useEffect, useCallback } from "react"
import { InterviewContext } from "../interview.context"
import { useParams } from "react-router"

export const useInterview = () => {
    const context = useContext(InterviewContext)
    const { interviewId } = useParams()

    if (!context) {
        throw new Error("useInterview must be used within an InterviewProvider")
    }

    const { 
        loading, 
        setLoading, 
        evaluatingQuestionId, 
        setEvaluatingQuestionId, 
        report, 
        setReport, 
        reports, 
        setReports, 
        analytics, 
        setAnalytics, 
        error, 
        setError 
    } = context

    const generateReport = async ({ jobDescription, selfDescription, resumeFile, experienceLevel, difficulty }) => {
        setLoading(true)
        setError(null)
        let interviewReport = null
        try {
            const response = await generateInterviewReport({ 
                jobDescription, 
                selfDescription, 
                resumeFile, 
                experienceLevel, 
                difficulty 
            })
            interviewReport = response?.interviewReport ?? null
            setReport(interviewReport)
        } catch (err) {
            const message = err?.response?.data?.message || "Failed to generate interview plan. Please check inputs and try again."
            setError(message)
            console.error("generateReport error:", err)
        } finally {
            setLoading(false)
        }

        return interviewReport
    }

    const getReportById = useCallback(async (id) => {
        setLoading(true)
        setError(null)
        let interviewReport = null
        try {
            const response = await getInterviewReportById(id)
            interviewReport = response?.interviewReport ?? null
            setReport(interviewReport)
        } catch (err) {
            const message = err?.response?.data?.message || "Could not load the interview report."
            setError(message)
            console.error("getReportById error:", err)
        } finally {
            setLoading(false)
        }
        return interviewReport
    }, [setLoading, setError, setReport])

    const getReports = useCallback(async () => {
        setLoading(true)
        setError(null)
        let interviewReports = []
        try {
            const response = await getAllInterviewReports()
            interviewReports = response?.interviewReports ?? []
            setReports(interviewReports)
        } catch (err) {
            const message = err?.response?.data?.message || "Could not load your interview history."
            setError(message)
            console.error("getReports error:", err)
        } finally {
            setLoading(false)
        }

        return interviewReports
    }, [setLoading, setError, setReports])

    const fetchAnalytics = useCallback(async () => {
        try {
            const data = await getAnalytics()
            if (data?.analytics) {
                setAnalytics(data.analytics)
            }
        } catch (err) {
            console.error("fetchAnalytics error:", err)
        }
    }, [setAnalytics])

    const submitAnswer = async ({ questionId, questionType, candidateAnswer }) => {
        if (!report?._id) return null
        setEvaluatingQuestionId(questionId)
        setError(null)

        try {
            const data = await evaluateAnswer({
                interviewId: report._id,
                questionId,
                questionType,
                candidateAnswer
            })

            if (data?.evaluation) {
                // Update local state in-place for seamless UX
                setReport(prev => {
                    if (!prev) return prev
                    const updateQuestion = q => {
                        if (q._id === questionId) {
                            return {
                                ...q,
                                candidateAnswer,
                                evaluation: data.evaluation,
                                status: "evaluated"
                            }
                        }
                        return q
                    }

                    return {
                        ...prev,
                        overallPerformanceScore: data.overallPerformanceScore ?? prev.overallPerformanceScore,
                        technicalQuestions: (prev.technicalQuestions || []).map(updateQuestion),
                        behavioralQuestions: (prev.behavioralQuestions || []).map(updateQuestion)
                    }
                })
                return data.evaluation
            }
        } catch (err) {
            const message = err?.response?.data?.message || "Failed to evaluate answer. Please try again."
            setError(message)
            console.error("submitAnswer error:", err)
        } finally {
            setEvaluatingQuestionId(null)
        }
        return null
    }

    const downloadResumePdf = async (reportId) => {
        const targetId = reportId || report?._id
        if (!targetId) return
        setLoading(true)
        setError(null)
        try {
            const data = await generateResumePdf({ interviewReportId: targetId })
            const url = window.URL.createObjectURL(new Blob([ data ], { type: "application/pdf" }))
            const link = document.createElement("a")
            link.href = url
            link.setAttribute("download", `Tailored_Resume_${targetId}.pdf`)
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)
            window.URL.revokeObjectURL(url)
        } catch (err) {
            const message = err?.response?.data?.message || "Could not generate resume PDF."
            setError(message)
            console.error("downloadResumePdf error:", err)
        } finally {
            setLoading(false)
        }
    }

    const downloadAssessmentReportPdf = async (reportId) => {
        const targetId = reportId || report?._id
        if (!targetId) return
        setLoading(true)
        setError(null)
        try {
            const data = await getAssessmentPdf(targetId)
            const url = window.URL.createObjectURL(new Blob([ data ], { type: "application/pdf" }))
            const link = document.createElement("a")
            link.href = url
            link.setAttribute("download", `Interview_Assessment_Report_${targetId}.pdf`)
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)
            window.URL.revokeObjectURL(url)
        } catch (err) {
            const message = err?.response?.data?.message || "Could not download assessment report PDF."
            setError(message)
            console.error("downloadAssessmentReportPdf error:", err)
        } finally {
            setLoading(false)
        }
    }

    const removeReport = async (targetId) => {
        try {
            await deleteInterviewReport(targetId)
            setReports(prev => prev.filter(r => r._id !== targetId))
            if (report?._id === targetId) {
                setReport(null)
            }
            fetchAnalytics()
        } catch (err) {
            console.error("removeReport error:", err)
        }
    }

    // Auto-fetch on route change
    useEffect(() => {
        if (interviewId) {
            getReportById(interviewId)
        } else {
            getReports()
            fetchAnalytics()
        }
    }, [interviewId, getReportById, getReports, fetchAnalytics])

    return { 
        loading, 
        evaluatingQuestionId, 
        report, 
        reports, 
        analytics, 
        error, 
        generateReport, 
        getReportById, 
        getReports, 
        fetchAnalytics, 
        submitAnswer, 
        downloadResumePdf, 
        downloadAssessmentReportPdf, 
        removeReport 
    }
}