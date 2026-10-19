import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router'
import "../auth.form.scss"
import { useAuth } from '../hooks/useAuth'

const Login = () => {
    const { handleLogin } = useAuth()
    const navigate = useNavigate()

    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [submitting, setSubmitting] = useState(false)
    const [error, setError] = useState("")

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError("")

        if (!email.trim() || !password.trim()) {
            setError("Please enter your email and password.")
            return
        }

        setSubmitting(true)
        try {
            const result = await handleLogin({ email: email.trim(), password })
            if (result.success && result.user) {
                navigate('/')
            } else {
                setError(result.error || "Invalid email or password.")
            }
        } catch (err) {
            setError("Login failed. Please check your credentials.")
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <main>
            <div className="form-container">
                <div className="form-header">
                    <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="#ff2d78">
                        <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z" />
                    </svg>
                    <h1>Welcome Back</h1>
                    <p>Sign in to your InterviewAI dashboard</p>
                </div>

                {error && (
                    <div className="form-error" role="alert">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                            <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" stroke="#0d1117" strokeWidth="2" /><line x1="12" y1="16" x2="12.01" y2="16" stroke="#0d1117" strokeWidth="2" />
                        </svg>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="input-group">
                        <label htmlFor="email">Email address</label>
                        <input
                            onChange={(e) => { setEmail(e.target.value) }}
                            value={email}
                            type="email"
                            id="email"
                            name='email'
                            placeholder='you@example.com'
                            disabled={submitting}
                            autoComplete="email"
                            required
                        />
                    </div>
                    <div className="input-group">
                        <label htmlFor="password">Password</label>
                        <input
                            onChange={(e) => { setPassword(e.target.value) }}
                            value={password}
                            type="password"
                            id="password"
                            name='password'
                            placeholder='Enter your password'
                            disabled={submitting}
                            autoComplete="current-password"
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        className='button primary-button'
                        disabled={submitting}
                    >
                        {submitting ? (
                            <>
                                <span className="btn-spinner" />
                                Signing in...
                            </>
                        ) : 'Sign in'}
                    </button>
                </form>

                <p className="form-footer">
                    Don't have an account? <Link to={"/register"}>Create one</Link>
                </p>
            </div>
        </main>
    )
}

export default Login