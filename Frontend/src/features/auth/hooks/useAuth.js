import { useContext, useEffect } from "react";
import { AuthContext } from "../auth.context";
import { login, register, logout, getMe } from "../services/auth.api";

export const useAuth = () => {
    const context = useContext(AuthContext)
    const { user, setUser, loading, setLoading } = context

    const handleLogin = async ({ email, password }) => {
        setLoading(true)
        try {
            const data = await login({ email, password })
            if (data?.user) {
                setUser(data.user)
                return { success: true, user: data.user }
            }
            return { success: false, error: data?.message || "Login failed" }
        } catch (err) {
            const errorMsg = err?.response?.data?.message || err.message || "Invalid email or password."
            return { success: false, error: errorMsg }
        } finally {
            setLoading(false)
        }
    }

    const handleRegister = async ({ username, email, password }) => {
        setLoading(true)
        try {
            const data = await register({ username, email, password })
            if (data?.user) {
                setUser(data.user)
                return { success: true, user: data.user }
            }
            return { success: false, error: data?.message || "Registration failed" }
        } catch (err) {
            const errorMsg = err?.response?.data?.message || err.message || "Registration failed."
            return { success: false, error: errorMsg }
        } finally {
            setLoading(false)
        }
    }

    const handleLogout = async () => {
        setLoading(true)
        try {
            await logout()
            setUser(null)
        } catch (err) {
            console.error("Logout error:", err)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        const getAndSetUser = async () => {
            try {
                const data = await getMe()
                if (data?.user) {
                    setUser(data.user)
                } else {
                    setUser(null)
                }
            } catch (err) {
                console.error("Failed to fetch user:", err)
                setUser(null)
            } finally {
                setLoading(false)
            }
        }

        getAndSetUser()
    }, [setUser, setLoading])

    return { user, loading, handleRegister, handleLogin, handleLogout }
}