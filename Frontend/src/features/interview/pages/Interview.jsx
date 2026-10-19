import React, { useState, useEffect, useRef } from 'react'
import '../style/interview.scss'
import { useInterview } from '../hooks/useInterview.js'
import { useParams, Link } from 'react-router'

const NAV_ITEMS = [
    { 
        id: 'practice', 
        label: 'Interactive Practice', 
        icon: (
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <polygon points="10 8 16 12 10 16 10 8" />
            </svg>
        ) 
    },
    { 
        id: 'technical', 
        label: 'Technical Benchmark', 
        icon: (
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="16 18 22 12 16 6" />
                <polyline points="8 6 2 12 8 18" />
            </svg>
        ) 
    },
    { 
        id: 'behavioral', 
        label: 'Behavioral Benchmark', 
        icon: (
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
        ) 
    },
    { 
        id: 'roadmap', 
        label: 'Preparation Roadmap', 
        icon: (
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="3 11 22 2 13 21 11 13 3 11" />
            </svg>
        ) 
    },
]

// ── Criteria Bar Sub-component ────────────────────────────────────────────────
const CriteriaBar = ({ label, score }) => {
    const color = score >= 80 ? '#3fb950' : score >= 60 ? '#f5a623' : '#ff4d4d'
    return (
        <div className="criteria-item">
            <div className="criteria-item__header">
                <span className="criteria-label">{label}</span>
                <span className="criteria-score" style={{ color }}>{score}/100</span>
            </div>
            <div className="criteria-bar-bg">
                <div 
                    className="criteria-bar-fill" 
                    style={{ width: `${Math.min(100, Math.max(5, score))}%`, backgroundColor: color }} 
                />
            </div>
        </div>
    )
}

// ── Interactive Practice Card with Speech-to-Text & Live AI Evaluation ─────────
const PracticeQuestionCard = ({ item, index, questionType, onSubmitAnswer, isEvaluating }) => {
    const [answerText, setAnswerText] = useState(item.candidateAnswer || "")
    const [isListening, setIsListening] = useState(false)
    const [speechSupported, setSpeechSupported] = useState(false)
    const [showModelAnswer, setShowModelAnswer] = useState(false)
    const recognitionRef = useRef(null)

    useEffect(() => {
        setAnswerText(item.candidateAnswer || "")
    }, [item.candidateAnswer])

    // Initialize Web Speech API for voice answer support
    useEffect(() => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
        if (SpeechRecognition) {
            setSpeechSupported(true)
            const recognition = new SpeechRecognition()
            recognition.continuous = true
            recognition.interimResults = true
            recognition.lang = 'en-US'

            recognition.onresult = (event) => {
                let transcript = ''
                for (let i = event.resultIndex; i < event.results.length; ++i) {
                    transcript += event.results[i][0].transcript
                }
                setAnswerText(prev => prev ? `${prev} ${transcript}` : transcript)
            }

            recognition.onerror = (e) => {
                console.warn("Speech recognition error:", e.error)
                setIsListening(false)
            }

            recognition.onend = () => {
                setIsListening(false)
            }

            recognitionRef.current = recognition
        }
    }, [])

    const toggleListening = () => {
        if (!recognitionRef.current) return
        if (isListening) {
            recognitionRef.current.stop()
            setIsListening(false)
        } else {
            try {
                recognitionRef.current.start()
                setIsListening(true)
            } catch (err) {
                console.warn(err)
            }
        }
    }

    const handleFormSubmit = (e) => {
        e.preventDefault()
        if (!answerText.trim() || isEvaluating) return
        if (isListening && recognitionRef.current) {
            recognitionRef.current.stop()
            setIsListening(false)
        }
        onSubmitAnswer({
            questionId: item._id,
            questionType,
            candidateAnswer: answerText
        })
    }

    const evaluation = item.evaluation
    const isEvaluated = item.status === "evaluated" && evaluation

    return (
        <div className={`practice-card ${isEvaluated ? 'practice-card--evaluated' : ''}`}>
            <div className="practice-card__header">
                <span className="q-badge">Question {index + 1}</span>
                <span className="q-type-badge">{questionType}</span>
                {isEvaluated && (
                    <span className={`eval-score-badge ${evaluation.overallScore >= 75 ? 'badge-high' : evaluation.overallScore >= 55 ? 'badge-mid' : 'badge-low'}`}>
                        Score: {evaluation.overallScore}/100
                    </span>
                )}
            </div>

            <h3 className="practice-card__question">{item.question}</h3>

            <div className="practice-card__intention">
                <span className="intention-tag">🎯 Evaluator Focus:</span>
                <p>{item.intention}</p>
            </div>

            {/* Answer Input Area */}
            <form onSubmit={handleFormSubmit} className="answer-form">
                <div className="answer-form__header">
                    <label htmlFor={`answer-${item._id}`}>Your Answer:</label>
                    <div className="answer-controls">
                        {speechSupported && (
                            <button
                                type="button"
                                onClick={toggleListening}
                                className={`mic-button ${isListening ? 'mic-button--active' : ''}`}
                                title={isListening ? "Stop listening" : "Speak your answer"}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
                                    <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                                    <line x1="12" y1="19" x2="12" y2="22" />
                                </svg>
                                {isListening ? 'Listening... (Click to stop)' : 'Speak Answer'}
                            </button>
                        )}
                        <span className="char-count">{answerText.length} characters</span>
                    </div>
                </div>

                <textarea
                    id={`answer-${item._id}`}
                    value={answerText}
                    onChange={(e) => setAnswerText(e.target.value)}
                    placeholder="Type or dictate your response as you would in a live interview... Explain your technical approach, trade-offs, and examples."
                    rows={6}
                    disabled={isEvaluating}
                    className="answer-textarea"
                />

                <div className="answer-form__actions">
                    <button
                        type="submit"
                        disabled={!answerText.trim() || isEvaluating}
                        className="button primary-button evaluate-btn"
                    >
                        {isEvaluating ? (
                            <>
                                <span className="btn-spinner" />
                                Evaluating with AI...
                            </>
                        ) : (
                            <>
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z" />
                                </svg>
                                {isEvaluated ? 'Re-evaluate Answer' : 'Submit & Evaluate Answer'}
                            </>
                        )}
                    </button>

                    <button
                        type="button"
                        onClick={() => setShowModelAnswer(s => !s)}
                        className="toggle-model-btn"
                    >
                        {showModelAnswer ? 'Hide Benchmark Answer' : 'View Benchmark Answer'}
                    </button>
                </div>
            </form>

            {/* Model Answer Preview */}
            {showModelAnswer && (
                <div className="benchmark-reveal">
                    <h4>💡 Staff Engineer Benchmark Answer</h4>
                    <p>{item.answer}</p>
                </div>
            )}

            {/* AI Evaluation Output */}
            {isEvaluated && (
                <div className="eval-results">
                    <div className="eval-results__header">
                        <h4>AI Evaluation & Detailed Feedback</h4>
                        <div className="eval-overall">
                            <span className="eval-overall__num">{evaluation.overallScore}</span>
                            <span className="eval-overall__denom">/100</span>
                        </div>
                    </div>

                    <p className="eval-feedback">{evaluation.feedback}</p>

                    {/* Criteria Breakdown */}
                    {evaluation.criteria && (
                        <div className="criteria-grid">
                            <CriteriaBar 
                                label={questionType === "behavioral" ? "Role Relevance & Situation" : "Technical Correctness"} 
                                score={evaluation.criteria.technicalCorrectness || 0} 
                            />
                            <CriteriaBar 
                                label="Depth of Understanding" 
                                score={evaluation.criteria.depthOfUnderstanding || 0} 
                            />
                            <CriteriaBar 
                                label="Relevance to Question" 
                                score={evaluation.criteria.relevance || 0} 
                            />
                            <CriteriaBar 
                                label="Communication Clarity" 
                                score={evaluation.criteria.communicationClarity || 0} 
                            />
                            <CriteriaBar 
                                label="Completeness & Structure" 
                                score={evaluation.criteria.completeness || 0} 
                            />
                        </div>
                    )}

                    {/* Strengths & Improvements */}
                    <div className="feedback-columns">
                        {evaluation.strengths && evaluation.strengths.length > 0 && (
                            <div className="feedback-col feedback-col--strengths">
                                <h5>✅ Key Strengths</h5>
                                <ul>
                                    {evaluation.strengths.map((str, sIdx) => (
                                        <li key={sIdx}>{str}</li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {evaluation.areasToImprove && evaluation.areasToImprove.length > 0 && (
                            <div className="feedback-col feedback-col--areas">
                                <h5>⚠️ Areas to Improve</h5>
                                <ul>
                                    {evaluation.areasToImprove.map((area, aIdx) => (
                                        <li key={aIdx}>{area}</li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>

                    {/* Actionable Coach Advice */}
                    {evaluation.suggestedImprovement && (
                        <div className="coach-advice">
                            <strong>Coach's Advice:</strong> {evaluation.suggestedImprovement}
                        </div>
                    )}

                    {/* Next Topics */}
                    {evaluation.nextTopicsToStudy && evaluation.nextTopicsToStudy.length > 0 && (
                        <div className="study-topics">
                            <span className="study-topics__label">Recommended Review:</span>
                            <div className="study-topics__list">
                                {evaluation.nextTopicsToStudy.map((top, tIdx) => (
                                    <span key={tIdx} className="topic-tag">{top}</span>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}

// ── Read-only Benchmark Card ──────────────────────────────────────────────────
const BenchmarkQuestionCard = ({ item, index }) => {
    const [open, setOpen] = useState(false)
    return (
        <div className='q-card'>
            <div className='q-card__header' onClick={() => setOpen(o => !o)}>
                <span className='q-card__index'>Q{index + 1}</span>
                <p className='q-card__question'>{item.question}</p>
                <span className={`q-card__chevron ${open ? 'q-card__chevron--open' : ''}`}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9" /></svg>
                </span>
            </div>
            {open && (
                <div className='q-card__body'>
                    <div className='q-card__section'>
                        <span className='q-card__tag q-card__tag--intention'>Interviewer Intention</span>
                        <p>{item.intention}</p>
                    </div>
                    <div className='q-card__section'>
                        <span className='q-card__tag q-card__tag--answer'>Staff Engineer Model Answer</span>
                        <p>{item.answer}</p>
                    </div>
                </div>
            )}
        </div>
    )
}

const RoadMapDay = ({ day }) => (
    <div className='roadmap-day'>
        <div className='roadmap-day__header'>
            <span className='roadmap-day__badge'>Day {day.day}</span>
            <h3 className='roadmap-day__focus'>{day.focus}</h3>
        </div>
        <ul className='roadmap-day__tasks'>
            {day.tasks.map((task, i) => (
                <li key={i}>
                    <span className='roadmap-day__bullet' />
                    {task}
                </li>
            ))}
        </ul>
    </div>
)

// ── Main Page Component ───────────────────────────────────────────────────────
const Interview = () => {
    const [activeNav, setActiveNav] = useState('practice')
    const { 
        report, 
        loading, 
        evaluatingQuestionId, 
        error, 
        submitAnswer, 
        downloadResumePdf, 
        downloadAssessmentReportPdf 
    } = useInterview()
    const { interviewId } = useParams()

    if (loading) {
        return (
            <main className='loading-screen'>
                <div className="loading-spinner" />
                <h1>Loading your interview plan...</h1>
            </main>
        )
    }

    if (error) {
        return (
            <main className='loading-screen'>
                <p className="error-text">⚠ {error}</p>
                <Link to="/" style={{ color: '#ff2d78', marginTop: '1rem', textDecoration: 'none' }}>
                    Return to Dashboard
                </Link>
            </main>
        )
    }

    if (!report) {
        return (
            <main className='loading-screen'>
                <p className="muted-text">No interview session found.</p>
                <Link to="/" style={{ color: '#ff2d78', marginTop: '1rem', textDecoration: 'none' }}>
                    Return to Dashboard
                </Link>
            </main>
        )
    }

    const techQuestions = report.technicalQuestions || []
    const behavQuestions = report.behavioralQuestions || []
    const allQuestions = [...techQuestions, ...behavQuestions]
    const evaluatedQuestions = allQuestions.filter(q => q.status === "evaluated")
    const totalQuestions = allQuestions.length
    const answeredCount = evaluatedQuestions.length

    const matchColor = report.matchScore >= 80 ? 'score--high' : report.matchScore >= 60 ? 'score--mid' : 'score--low'
    const perfColor = (report.overallPerformanceScore || 0) >= 75 ? 'score--high' : (report.overallPerformanceScore || 0) >= 55 ? 'score--mid' : 'score--low'

    return (
        <div className='interview-page'>
            <div className='interview-layout'>

                {/* ── Left Navigation Bar ── */}
                <nav className='interview-nav'>
                    <div className="nav-content">
                        <div className="session-title">
                            <span className="session-tag">{report.experienceLevel || 'Mid-Level'} • {report.difficulty || 'Standard'}</span>
                            <h2>{report.title}</h2>
                        </div>

                        <p className='interview-nav__label'>Modes & Views</p>
                        {NAV_ITEMS.map(item => (
                            <button
                                key={item.id}
                                className={`interview-nav__item ${activeNav === item.id ? 'interview-nav__item--active' : ''}`}
                                onClick={() => setActiveNav(item.id)}
                            >
                                <span className='interview-nav__icon'>{item.icon}</span>
                                {item.label}
                                {item.id === 'practice' && answeredCount > 0 && (
                                    <span className="nav-badge">{answeredCount}/{totalQuestions}</span>
                                )}
                            </button>
                        ))}
                    </div>

                    {/* PDF Export Actions */}
                    <div className="nav-actions">
                        <button
                            onClick={() => downloadAssessmentReportPdf(interviewId)}
                            className='button secondary-button action-btn'
                            title="Export official assessment report with all evaluations and feedback"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                <polyline points="7 10 12 15 17 10" />
                                <line x1="12" y1="15" x2="12" y2="3" />
                            </svg>
                            Export Assessment PDF
                        </button>

                        <button
                            onClick={() => downloadResumePdf(interviewId)}
                            className='button primary-button action-btn'
                            title="Generate ATS-optimized resume tailored to this role"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M10.6 17.8 11.5 15.8C12.3 14 13.7 12.6 15.4 11.8L17.8 10.7C18.6 10.4 18.6 9.3 17.8 8.9L15.5 7.9C13.7 7.1 12.3 5.6 11.5 3.8L10.6 1.6C10.3.8 9.2.8 8.9 1.6L8 3.8C7.2 5.6 5.8 7.1 4 7.9L1.6 8.9C.9 9.3.9 10.4 1.6 10.7L4.1 11.8C5.8 12.6 7.2 14 8 15.8L8.9 17.8C9.2 18.6 10.3 18.6 10.6 17.8Z" />
                            </svg>
                            Tailored ATS Resume
                        </button>
                    </div>
                </nav>

                <div className='interview-divider' />

                {/* ── Main Workspace Content ── */}
                <main className='interview-content'>
                    {/* Mode 1: Interactive Live Practice */}
                    {activeNav === 'practice' && (
                        <section className="practice-section">
                            <div className='content-header'>
                                <div>
                                    <h2>Interactive Mock Practice & AI Evaluation</h2>
                                    <p className="content-sub">
                                        Type or dictate your answers out loud. Our AI models evaluate technical depth, structure, and clarity in real time.
                                    </p>
                                </div>
                                <span className='content-header__count'>
                                    {answeredCount} of {totalQuestions} evaluated
                                </span>
                            </div>

                            <div className="practice-list">
                                <h3 className="section-divider-title">Technical Problem Scenarios</h3>
                                {techQuestions.map((q, idx) => (
                                    <PracticeQuestionCard
                                        key={q._id || `tech-${idx}`}
                                        item={q}
                                        index={idx}
                                        questionType="technical"
                                        onSubmitAnswer={submitAnswer}
                                        isEvaluating={evaluatingQuestionId === q._id}
                                    />
                                ))}

                                <h3 className="section-divider-title" style={{ marginTop: '2.5rem' }}>Behavioral & Situational Scenarios</h3>
                                {behavQuestions.map((q, idx) => (
                                    <PracticeQuestionCard
                                        key={q._id || `beh-${idx}`}
                                        item={q}
                                        index={techQuestions.length + idx}
                                        questionType="behavioral"
                                        onSubmitAnswer={submitAnswer}
                                        isEvaluating={evaluatingQuestionId === q._id}
                                    />
                                ))}
                            </div>
                        </section>
                    )}

                    {/* Mode 2: Technical Benchmark */}
                    {activeNav === 'technical' && (
                        <section>
                            <div className='content-header'>
                                <div>
                                    <h2>Technical Questions & Benchmarks</h2>
                                    <p className="content-sub">Examine model answers and interviewer evaluation criteria.</p>
                                </div>
                                <span className='content-header__count'>{techQuestions.length} questions</span>
                            </div>
                            <div className='q-list'>
                                {techQuestions.map((q, i) => (
                                    <BenchmarkQuestionCard key={i} item={q} index={i} />
                                ))}
                            </div>
                        </section>
                    )}

                    {/* Mode 3: Behavioral Benchmark */}
                    {activeNav === 'behavioral' && (
                        <section>
                            <div className='content-header'>
                                <div>
                                    <h2>Behavioral Scenarios & Frameworks</h2>
                                    <p className="content-sub">Review competency indicators and recommended STAR storytelling structures.</p>
                                </div>
                                <span className='content-header__count'>{behavQuestions.length} questions</span>
                            </div>
                            <div className='q-list'>
                                {behavQuestions.map((q, i) => (
                                    <BenchmarkQuestionCard key={i} item={q} index={i} />
                                ))}
                            </div>
                        </section>
                    )}

                    {/* Mode 4: Roadmap */}
                    {activeNav === 'roadmap' && (
                        <section>
                            <div className='content-header'>
                                <div>
                                    <h2>Targeted Preparation Roadmap</h2>
                                    <p className="content-sub">Day-by-day study roadmap tailored to your target job description.</p>
                                </div>
                                <span className='content-header__count'>{(report.preparationPlan || []).length}-day plan</span>
                            </div>
                            <div className='roadmap-list'>
                                {(report.preparationPlan || []).map((day) => (
                                    <RoadMapDay key={day.day} day={day} />
                                ))}
                            </div>
                        </section>
                    )}
                </main>

                <div className='interview-divider' />

                {/* ── Right Metrics Sidebar ── */}
                <aside className='interview-sidebar'>
                    {/* Live Practice Score */}
                    <div className='match-score'>
                        <p className='match-score__label'>Evaluation Score</p>
                        <div className={`match-score__ring ${perfColor}`}>
                            <span className='match-score__value'>{report.overallPerformanceScore || 0}</span>
                            <span className='match-score__pct'>/100</span>
                        </div>
                        <p className='match-score__sub'>
                            {answeredCount === 0 ? 'No answers submitted yet' : `${answeredCount} of ${totalQuestions} evaluated`}
                        </p>
                    </div>

                    <div className='sidebar-divider' />

                    {/* Match Score */}
                    <div className='match-score'>
                        <p className='match-score__label'>Resume Match Score</p>
                        <div className={`match-score__ring ${matchColor}`}>
                            <span className='match-score__value'>{report.matchScore}</span>
                            <span className='match-score__pct'>%</span>
                        </div>
                        <p className='match-score__sub'>
                            {report.matchScore >= 80 ? 'Strong Match' : report.matchScore >= 60 ? 'Moderate Match' : 'Gap Areas Identified'}
                        </p>
                    </div>

                    <div className='sidebar-divider' />

                    {/* Skill Gaps */}
                    <div className='skill-gaps'>
                        <p className='skill-gaps__label'>Identified Skill Gaps</p>
                        <div className='skill-gaps__list'>
                            {(report.skillGaps || []).map((gap, i) => (
                                <span key={i} className={`skill-tag skill-tag--${gap.severity}`}>
                                    {gap.skill}
                                </span>
                            ))}
                        </div>
                    </div>
                </aside>
            </div>
        </div>
    )
}

export default Interview