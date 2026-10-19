import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router'
import "../auth.form.scss"
import { useAuth } from '../hooks/useAuth'

const Register = () => {
    const navigate = useNavigate()
    const [username, setUsername] = useState("")
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [submitting, setSubmitting] = useState(false)
    const [error, setError] = useState("")

    const { handleRegister } = useAuth()

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError("")

        if (!username.trim() || !email.trim() || !password.trim()) {
            setError("All fields are required.")
            return
        }

        if (password.length < 6) {
            setError("Password must be at least 6 characters.")
            return
        }

        setSubmitting(true)
        try {
            const result = await handleRegister({ 
                username: username.trim(), 
                email: email.trim(), 
                password 
            })
            if (result.success && result.user) {
                navigate("/")
            } else {
                setError(result.error || "Registration failed. Please try a different username or email.")
            }
        } catch (err) {
            setError("Registration failed. Please try again.")
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
                    <h1>Create Your Account</h1>
                    <p>Start your AI-powered interview prep today</p>
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
                        <label htmlFor="username">Username</label>
                        <input
                            onChange={(e) => { setUsername(e.target.value) }}
                            value={username}
                            type="text"
                            id="username"
                            name='username'
                            placeholder='e.g. john_doe'
                            disabled={submitting}
                            autoComplete="username"
                            required
                        />
                    </div>
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
                            placeholder='Min. 6 characters'
                            disabled={submitting}
                            autoComplete="new-password"
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
                                Creating account...
                            </>
                        ) : 'Create account'}
                    </button>
                </form>

                <p className="form-footer">
                    Already have an account? <Link to={"/login"}>Sign in</Link>
                </p>
            </div>
        </main>
    )
}

export default Register