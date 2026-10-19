import { useAuth } from "../hooks/useAuth";
import { Navigate } from "react-router";
import React from 'react'
import Navbar from "../../shared/Navbar";

const Protected = ({ children }) => {
    const { loading, user } = useAuth()

    if (loading) {
        return (
            <main className="loading-screen">
                <div className="loading-spinner" />
                <p>Checking authentication...</p>
            </main>
        )
    }

    if (!user) {
        return <Navigate to={'/welcome'} />
    }

    return (
        <>
            <Navbar />
            {children}
        </>
    )
}

export default Protected