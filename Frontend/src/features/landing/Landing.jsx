import React from 'react'
import { Link } from 'react-router'
import { useAuth } from '../auth/hooks/useAuth'
import './landing.scss'

const Landing = () => {
    const { user } = useAuth()

    return (
        <div className="landing-page">
            {/* Top Navigation */}
            <header className="landing-nav">
                <div className="landing-nav__inner">
                    <div className="landing-brand">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="#ff2d78">
                            <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z" />
                        </svg>
                        <span>InterviewAI</span>
                    </div>

                    <div className="landing-nav__links">
                        <a href="#features">Features</a>
                        <a href="#architecture">Architecture</a>
                        <a href="#scoring">Scoring Model</a>
                    </div>

                    <div className="landing-nav__auth">
                        {user ? (
                            <Link to="/" className="button primary-button nav-btn">
                                Open Dashboard &rarr;
                            </Link>
                        ) : (
                            <>
                                <Link to="/login" className="nav-login-link">Sign In</Link>
                                <Link to="/register" className="button primary-button nav-btn">
                                    Get Started
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </header>

            {/* Hero Section */}
            <section className="hero-section">
                <div className="hero-badge">
                    <span className="sparkle">✨</span> Powered by Google Gemini 2.0 &amp; Structured Output
                </div>

                <h1 className="hero-title">
                    Master Technical Interviews with <span className="highlight">Real-Time AI Evaluation</span>
                </h1>

                <p className="hero-subtitle">
                    Upload your resume, paste any job description, and practice realistic technical &amp; behavioral scenarios. Speak or type your answers to receive evidence-based scoring, criteria breakdowns, and personalized study roadmaps.
                </p>

                <div className="hero-cta-group">
                    <Link to={user ? "/" : "/register"} className="button primary-button cta-primary">
                        Start Mock Session &rarr;
                    </Link>
                    <a href="#architecture" className="button secondary-button cta-secondary">
                        Explore System Architecture
                    </a>
                </div>

                {/* Hero Preview Card */}
                <div className="hero-preview-card">
                    <div className="preview-header">
                        <div className="preview-dots">
                            <span className="dot dot--red" />
                            <span className="dot dot--yellow" />
                            <span className="dot dot--green" />
                        </div>
                        <span className="preview-title">Live Mock Session — Senior Full-Stack Engineer</span>
                        <span className="preview-status">AI Evaluator Active</span>
                    </div>
                    <div className="preview-content">
                        <div className="preview-q">
                            <span className="q-tag">Scenario Q1</span>
                            <p>How do you handle distributed transactional consistency across microservices during a payment checkout workflow?</p>
                        </div>
                        <div className="preview-scores">
                            <div className="preview-score-item">
                                <span className="label">Evaluation Score</span>
                                <span className="val" style={{ color: '#3fb950' }}>88/100</span>
                            </div>
                            <div className="preview-score-item">
                                <span className="label">Correctness</span>
                                <span className="val" style={{ color: '#3fb950' }}>92%</span>
                            </div>
                            <div className="preview-score-item">
                                <span className="label">Architecture Depth</span>
                                <span className="val" style={{ color: '#3fb950' }}>85%</span>
                            </div>
                            <div className="preview-score-item">
                                <span className="label">Communication</span>
                                <span className="val" style={{ color: '#3fb950' }}>90%</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Key Capabilities */}
            <section id="features" className="features-section">
                <div className="section-header">
                    <h2>Engineering-Grade Evaluation Engine</h2>
                    <p>Designed to simulate the rigor of hiring committees at top tier tech companies.</p>
                </div>

                <div className="features-grid">
                    <div className="feature-card">
                        <div className="feature-icon">📄</div>
                        <h3>Resume &amp; JD Skill Gap Extraction</h3>
                        <p>
                            Extracts text from PDF resumes using memory buffers, analyzes competencies against target role requirements, and outputs prioritized skill gaps (Low/Medium/High severity).
                        </p>
                    </div>

                    <div className="feature-card">
                        <div className="feature-icon">🎙️</div>
                        <h3>Interactive Voice &amp; Text Practice</h3>
                        <p>
                            Practice responding out loud using Web Speech API real-time speech recognition or typing structured answers, mimicking live remote technical screening calls.
                        </p>
                    </div>

                    <div className="feature-card">
                        <div className="feature-icon">⚖️</div>
                        <h3>Transparent 5-Dimension Scoring</h3>
                        <p>
                            Answers are evaluated strictly across Technical Correctness, Depth of Understanding, Relevance, Communication Clarity, and Completeness with actionable feedback.
                        </p>
                    </div>

                    <div className="feature-card">
                        <div className="feature-icon">📊</div>
                        <h3>Printable Assessment &amp; Resume PDF</h3>
                        <p>
                            Puppeteer-powered PDF generation exports both an ATS-optimized tailored resume and a comprehensive hiring report detailing candidate evaluation metrics.
                        </p>
                    </div>
                </div>
            </section>

            {/* Architecture Section */}
            <section id="architecture" className="architecture-section">
                <div className="section-header">
                    <h2>End-to-End System Architecture</h2>
                    <p>Clean separation of concerns, secure stateless JWT auth, and structured LLM outputs.</p>
                </div>

                <div className="arch-flow-diagram">
                    <div className="arch-node">
                        <div className="arch-node__badge">Frontend Layer</div>
                        <h4>React 19 + Vite</h4>
                        <p>Interactive Interview Workspace, Web Speech API Voice Dictation, SCSS Design System.</p>
                    </div>

                    <div className="arch-arrow">&rarr;</div>

                    <div className="arch-node">
                        <div className="arch-node__badge">API &amp; Auth</div>
                        <h4>Express 5 + JWT</h4>
                        <p>HTTP-only Cookie Auth, Token Blacklist TTL Invalidation, Multer PDF Upload Memory Stream.</p>
                    </div>

                    <div className="arch-arrow">&rarr;</div>

                    <div className="arch-node">
                        <div className="arch-node__badge">AI &amp; PDF Engine</div>
                        <h4>Gemini 2.0 + Puppeteer</h4>
                        <p>Zod JSON Schema Structured Generation, 5-Criteria Grading Model, Headless PDF Rendering.</p>
                    </div>

                    <div className="arch-arrow">&rarr;</div>

                    <div className="arch-node">
                        <div className="arch-node__badge">Data Store</div>
                        <h4>MongoDB Atlas</h4>
                        <p>Persistent Interview Plans, Candidate Responses, Evaluation History, and Blacklist Tokens.</p>
                    </div>
                </div>
            </section>

            {/* Scoring Methodology */}
            <section id="scoring" className="scoring-section">
                <div className="section-header">
                    <h2>Transparent Evaluation Methodology</h2>
                    <p>Mathematical scoring formulation ensuring objectivity and constructive coaching.</p>
                </div>

                <div className="formula-box">
                    <div className="formula-card">
                        <h4>Technical Scenario Formulation</h4>
                        <code>Overall = 0.30×Correctness + 0.20×Depth + 0.20×Relevance + 0.15×Clarity + 0.15×Completeness</code>
                        <p>Rewards architectural trade-off reasoning, boundary condition mitigation, and quantitative metrics.</p>
                    </div>
                    <div className="formula-card">
                        <h4>Behavioral Scenario Formulation</h4>
                        <code>Overall = 0.30×Relevance + 0.25×STAR Depth + 0.20×Correctness + 0.15×Clarity + 0.10×Completeness</code>
                        <p>Evaluates structured storytelling (Situation, Task, Action, Result) and reflective growth.</p>
                    </div>
                </div>
            </section>

            {/* CTA Banner */}
            <section className="cta-banner">
                <h2>Ready to Ace Your Upcoming Interview?</h2>
                <p>Generate your first personalized interview preparation roadmap in 15 seconds.</p>
                <Link to={user ? "/" : "/register"} className="button primary-button cta-primary">
                    Get Started Free &rarr;
                </Link>
            </section>

            {/* Footer */}
            <footer className="landing-footer">
                <div className="landing-brand">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="#ff2d78">
                        <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z" />
                    </svg>
                    <span>InterviewAI</span>
                </div>
                <p>&copy; 2026 InterviewAI. Engineering Interview Preparation Platform.</p>
            </footer>
        </div>
    )
}

export default Landing
