import { createContext, useState } from "react";

export const InterviewContext = createContext()

export const InterviewProvider = ({ children }) => {
    const [loading, setLoading] = useState(false)
    const [evaluatingQuestionId, setEvaluatingQuestionId] = useState(null)
    const [report, setReport] = useState(null)
    const [reports, setReports] = useState([])
    const [analytics, setAnalytics] = useState(null)
    const [error, setError] = useState(null)

    return (
        <InterviewContext.Provider value={{ 
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
        }}>
            {children}
        </InterviewContext.Provider>
    )
}