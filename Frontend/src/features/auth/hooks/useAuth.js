import { useContext, useEffect } from "react";
import { AuthContext } from "../auth.context";
import { login, register, logout, getMe } from "../services/auth.api";



export const useAuth = () => {

    const context = useContext(AuthContext)
    const { user, setUser, loading, setLoading } = context


    const handleLogin = async ({ email, password }) => {
        setLoading(true)
        let data = null
        try {
            data = await login({ email, password })
            if (data?.user) setUser(data.user)
        } catch (err) {
            console.error("Login error:", err)
        } finally {
            setLoading(false)
        }
        return data
    }

    const handleRegister = async ({ username, email, password }) => {
        setLoading(true)
        let data = null
        try {
            data = await register({ username, email, password })
            if (data?.user) setUser(data.user)
        } catch (err) {
            console.error("Register error:", err)
        } finally {
            setLoading(false)
        }
        return data
    }

    const handleLogout = async () => {
        setLoading(true)
        try {
            const data = await logout()
            setUser(null)
        } catch (err) {

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
                }
            } catch (err) {
                console.error("Failed to fetch user:", err)
            } finally {
                setLoading(false)
            }
        }

        getAndSetUser()

    }, [])

    return { user, loading, handleRegister, handleLogin, handleLogout }
}