import React from 'react'
import { Link } from 'react-router'

const NotFound = () => (
    <main style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '1rem',
        background: '#0d1117',
        color: '#e6edf3',
        textAlign: 'center',
        padding: '2rem'
    }}>
        <span style={{ fontSize: '4rem' }}>404</span>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Page not found</h1>
        <p style={{ color: '#7d8590', maxWidth: '400px' }}>
            The page you're looking for doesn't exist or has been moved.
        </p>
        <Link
            to="/"
            style={{
                marginTop: '0.5rem',
                padding: '0.65rem 1.5rem',
                background: '#ff2d78',
                color: '#fff',
                borderRadius: '0.5rem',
                textDecoration: 'none',
                fontWeight: 600,
                fontSize: '0.9rem'
            }}
        >
            Go to Dashboard
        </Link>
    </main>
)

export default NotFound
