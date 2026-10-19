const jwt = require("jsonwebtoken")
const tokenBlacklistModel = require("../models/blacklist.model")

const JWT_SECRET = process.env.JWT_SECRET || "interview_ai_dev_secret_key_change_in_production"

async function authUser(req, res, next) {
    const token = req.cookies.token

    if (!token) {
        return res.status(401).json({
            message: "Authentication required. Please sign in."
        })
    }

    try {
        const isTokenBlacklisted = await tokenBlacklistModel.findOne({ token })

        if (isTokenBlacklisted) {
            return res.status(401).json({
                message: "Session has expired or was logged out. Please sign in again."
            })
        }

        const decoded = jwt.verify(token, JWT_SECRET)
        req.user = decoded
        next()
    } catch (err) {
        return res.status(401).json({
            message: "Invalid or expired session. Please sign in again."
        })
    }
}

module.exports = { authUser }