const mongoose = require("mongoose")

async function connectToDB() {
    if (!process.env.MONGO_URI) {
        console.warn("⚠️ [database] MONGO_URI is not set in .env. Please configure MONGO_URI in Backend/.env to persist interviews.")
        return
    }

    try {
        await mongoose.connect(process.env.MONGO_URI)
        console.log("✅ [database] Successfully connected to MongoDB")
    } catch (err) {
        console.error("❌ [database] Failed to connect to MongoDB:", err.message)
    }
}

module.exports = connectToDB