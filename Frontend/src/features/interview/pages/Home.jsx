import React, { useState, useRef } from 'react'
import "../style/home.scss"
import { useInterview } from '../hooks/useInterview.js'
import { useNavigate } from 'react-router'

const Home = () => {
    const { 
        loading, 
        generateReport, 
        reports, 
        analytics, 
        error, 
        removeReport 
    } = useInterview()
    
    const [jobDescription, setJobDescription] = useState("")
    const [selfDescription, setSelfDescription] = useState("")
    const [experienceLevel, setExperienceLevel] = useState("Mid-Level")
    const [difficulty, setDifficulty] = useState("Standard")
    const [selectedFileName, setSelectedFileName] = useState("")
    const resumeInputRef = useRef()

    const navigate = useNavigate()

    const handleFileChange = (e) => {
        const file = e.target.files?.[0]
        if (file) {
            setSelectedFileName(file.name)
        } else {
            setSelectedFileName("")
        }
    }

    const clearSelectedFile = (e) => {
        e.preventDefault()
        e.stopPropagation()
        if (resumeInputRef.current) {
            resumeInputRef.current.value = ""
        }
        setSelectedFileName("")
    }

    const handleGenerateReport = async () => {
        const resumeFile = resumeInputRef.current?.files?.[0]

        if (!jobDescription.trim()) {
            alert("Please paste a target job description before generating your plan.")
            return
        }

        if (!resumeFile && !selfDescription.trim()) {
            alert("Please either upload a resume PDF or enter a brief self-description of your experience.")
            return
        }

        const data = await generateReport({ 
            jobDescription, 
            selfDescription, 
            resumeFile, 
            experienceLevel, 
            difficulty 
        })
        if (data?._id) {
            navigate(`/interview/${data._id}`)
        }
    }

    if (loading) {
        return (
            <main className='loading-screen'>
                <div className="loading-spinner" />
                <h1>Architecting your tailored interview roadmap with AI...</h1>
                <p className="muted-text">Analyzing job requirements, parsing experience, and compiling questions (~15s)</p>
            </main>
        )
    }

    const totalSessions = analytics?.totalInterviews || reports.length || 0
    const avgMatch = analytics?.avgMatchScore || 0
    const questionsAnswered = analytics?.questionsAnswered || 0
    const avgPerf = analytics?.avgPerformanceScore || 0

    return (
        <div className='home-page'>
            {error && (
                <div className="home-error" role="alert">
                    <span>⚠ {error}</span>
                </div>
            )}

            {/* Dashboard Analytics Bar */}
            {totalSessions > 0 && (
                <section className="dashboard-stats">
                    <div className="stat-card">
                        <div className="stat-label">Total Sessions</div>
                        <div className="stat-value">{totalSessions}</div>
                        <div className="stat-sub">Interview plans created</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-label">Avg. Match Score</div>
                        <div className="stat-value">{avgMatch > 0 ? `${avgMatch}%` : 'N/A'}</div>
                        <div className="stat-sub">Profile alignment to roles</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-label">Questions Evaluated</div>
                        <div className="stat-value">{questionsAnswered}</div>
                        <div className="stat-sub">Practice responses graded</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-label">Readiness Score</div>
                        <div className="stat-value" style={{ color: avgPerf >= 70 ? '#3fb950' : '#ff2d78' }}>
                            {avgPerf > 0 ? `${avgPerf}/100` : 'Pending'}
                        </div>
                        <div className="stat-sub">Average response quality</div>
                    </div>
                </section>
            )}

            {/* Performance Trend Chart (if multiple sessions) */}
            {analytics?.history && analytics.history.length > 1 && (
                <section className="analytics-card">
                    <div className="analytics-header">
                        <h3>📈 Historical Performance Trends</h3>
                        <span className="trend-badge">Scores across your interview sessions</span>
                    </div>
                    <div className="trend-chart-container">
                        <svg className="trend-svg" viewBox="0 0 600 120" preserveAspectRatio="none">
                            {/* Gridlines */}
                            <line x1="0" y1="30" x2="600" y2="30" stroke="#2a3348" strokeDasharray="3 3" />
                            <line x1="0" y1="70" x2="600" y2="70" stroke="#2a3348" strokeDasharray="3 3" />
                            <line x1="0" y1="110" x2="600" y2="110" stroke="#2a3348" strokeDasharray="3 3" />

                            {/* Match score line */}
                            <polyline
                                fill="none"
                                stroke="#ff2d78"
                                strokeWidth="3"
                                points={analytics.history.map((h, i) => {
                                    const x = (i / (analytics.history.length - 1)) * 560 + 20
                                    const y = 110 - ((h.matchScore || 50) / 100) * 90
                                    return `${x},${y}`
                                }).join(' ')}
                            />

                            {/* Data points */}
                            {analytics.history.map((h, i) => {
                                const x = (i / (analytics.history.length - 1)) * 560 + 20
                                const y = 110 - ((h.matchScore || 50) / 100) * 90
                                return (
                                    <circle key={i} cx={x} cy={y} r="4" fill="#ff2d78" stroke="#161b22" strokeWidth="2" />
                                )
                            })}
                        </svg>
                    </div>
                </section>
            )}

            {/* Page Header */}
            <header className='page-header'>
                <h1>Create Your Custom <span className='highlight'>Interview Plan</span></h1>
                <p>Provide your target job description and profile to generate tailored technical scenarios, behavioral questions, and practice sessions.</p>
            </header>

            {/* Configuration Options */}
            <div className="setup-options-bar">
                <div className="setup-option">
                    <label>Target Level:</label>
                    <select 
                        value={experienceLevel} 
                        onChange={(e) => setExperienceLevel(e.target.value)}
                        className="setup-select"
                    >
                        <option value="Entry">Entry-Level / Graduate</option>
                        <option value="Mid-Level">Mid-Level Engineer</option>
                        <option value="Senior">Senior Engineer</option>
                        <option value="Lead/Staff">Lead / Staff Architect</option>
                    </select>
                </div>
                <div className="setup-option">
                    <label>Interview Rigor:</label>
                    <select 
                        value={difficulty} 
                        onChange={(e) => setDifficulty(e.target.value)}
                        className="setup-select"
                    >
                        <option value="Standard">Standard (Realistic)</option>
                        <option value="Advanced">Advanced (FAANG / Tier-1)</option>
                        <option value="Rigorous">Rigorous (Deep Architecture & Edge Cases)</option>
                    </select>
                </div>
            </div>

            {/* Main Workspace Card */}
            <div className='interview-card'>
                <div className='interview-card__body'>

                    {/* Left Panel - Job Description */}
                    <div className='panel panel--left'>
                        <div className='panel__header'>
                            <span className='panel__icon'>
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2" /><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" /></svg>
                            </span>
                            <h2>Target Job Description</h2>
                            <span className='badge badge--required'>Required</span>
                        </div>
                        <textarea
                            value={jobDescription}
                            onChange={(e) => { setJobDescription(e.target.value) }}
                            className='panel__textarea'
                            placeholder={`Paste the job description or role requirements here...\ne.g. 'Senior Full Stack Engineer at Stripe. Requirements: React, Node.js, distributed microservices, idempotency, high availability, and REST API design...'`}
                            maxLength={5000}
                        />
                        <div className='char-counter'>{jobDescription.length} / 5000 chars</div>
                    </div>

                    {/* Vertical Divider */}
                    <div className='panel-divider' />

                    {/* Right Panel - Candidate Profile */}
                    <div className='panel panel--right'>
                        <div className='panel__header'>
                            <span className='panel__icon'>
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
                            </span>
                            <h2>Your Background & Experience</h2>
                        </div>

                        {/* Upload Resume */}
                        <div className='upload-section'>
                            <label className='section-label'>
                                Upload Resume PDF
                                <span className='badge badge--best'>Recommended</span>
                            </label>
                            <label className='dropzone' htmlFor='resume'>
                                <span className='dropzone__icon'>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 16 12 12 8 16" /><line x1="12" y1="12" x2="12" y2="21" /><path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3" /></svg>
                                </span>
                                {selectedFileName ? (
                                    <div className="file-selected-box">
                                        <p className='dropzone__title' style={{ color: '#ff2d78' }}>📄 {selectedFileName}</p>
                                        <button onClick={clearSelectedFile} className="clear-file-btn">Remove file</button>
                                    </div>
                                ) : (
                                    <>
                                        <p className='dropzone__title'>Click to choose file or drag &amp; drop</p>
                                        <p className='dropzone__subtitle'>PDF Document (Up to 3MB)</p>
                                    </>
                                )}
                                <input 
                                    ref={resumeInputRef} 
                                    onChange={handleFileChange} 
                                    hidden 
                                    type='file' 
                                    id='resume' 
                                    name='resume' 
                                    accept='.pdf' 
                                />
                            </label>
                        </div>

                        {/* OR Divider */}
                        <div className='or-divider'><span>OR ENTER PROFILE SUMMARY</span></div>

                        {/* Quick Self-Description */}
                        <div className='self-description'>
                            <label className='section-label' htmlFor='selfDescription'>Quick Self-Description / Key Skills</label>
                            <textarea
                                value={selfDescription}
                                onChange={(e) => { setSelfDescription(e.target.value) }}
                                id='selfDescription'
                                name='selfDescription'
                                className='panel__textarea panel__textarea--short'
                                placeholder="Describe your stack, years of experience, or project accomplishments if you don't have a PDF ready..."
                            />
                        </div>

                        {/* Info Note */}
                        <div className='info-box'>
                            <span className='info-box__icon'>
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" stroke="#1a1f27" strokeWidth="2" /><line x1="12" y1="16" x2="12.01" y2="16" stroke="#1a1f27" strokeWidth="2" /></svg>
                            </span>
                            <p>Either a <strong>Resume PDF</strong> or a <strong>Self Description</strong> is required to customize the assessment.</p>
                        </div>
                    </div>
                </div>

                {/* Card Footer */}
                <div className='interview-card__footer'>
                    <span className='footer-info'>AI-Powered Strategy &bull; ~15s generation &bull; Structured Evaluation Engine</span>
                    <button
                        onClick={handleGenerateReport}
                        className='generate-btn'
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z" /></svg>
                        Generate My Interview Plan
                    </button>
                </div>
            </div>

            {/* Recent Reports List */}
            {reports.length > 0 ? (
                <section className='recent-reports'>
                    <div className="section-title-row">
                        <h2>Your Previous Interview Sessions</h2>
                        <span className="reports-count">{reports.length} sessions saved</span>
                    </div>

                    <div className='reports-grid'>
                        {reports.map(report => (
                            <div key={report._id} className='report-card'>
                                <div className="report-card__header">
                                    <span className="report-role-tag">{report.experienceLevel || "Mid-Level"}</span>
                                    <button 
                                        onClick={(e) => {
                                            e.stopPropagation()
                                            if (confirm("Delete this interview session?")) {
                                                removeReport(report._id)
                                            }
                                        }}
                                        className="delete-report-btn"
                                        title="Delete session"
                                    >
                                        &times;
                                    </button>
                                </div>
                                
                                <h3 className="report-title">{report.title || 'Target Role'}</h3>
                                <p className='report-meta'>Created {new Date(report.createdAt).toLocaleDateString()}</p>
                                
                                <div className="report-scores">
                                    <div className="score-pill">
                                        <span className="score-label">Match:</span>
                                        <span className={`score-value ${report.matchScore >= 80 ? 'score--high' : report.matchScore >= 60 ? 'score--mid' : 'score--low'}`}>
                                            {report.matchScore}%
                                        </span>
                                    </div>
                                    {report.overallPerformanceScore > 0 && (
                                        <div className="score-pill">
                                            <span className="score-label">Readiness:</span>
                                            <span className="score-value score--high">
                                                {report.overallPerformanceScore}/100
                                            </span>
                                        </div>
                                    )}
                                </div>

                                <button 
                                    onClick={() => navigate(`/interview/${report._id}`)} 
                                    className="resume-session-btn"
                                >
                                    Resume Practice &rarr;
                                </button>
                            </div>
                        ))}
                    </div>
                </section>
            ) : (
                <section className="empty-state">
                    <h3>No practice sessions yet</h3>
                    <p>Paste a job description above to generate your first AI mock interview and roadmap.</p>
                </section>
            )}

            {/* Page Footer */}
            <footer className='page-footer'>
                <span>InterviewAI Platform &bull; Built with Express, MongoDB & Google Gemini</span>
            </footer>
        </div>
    )
}

export default Home