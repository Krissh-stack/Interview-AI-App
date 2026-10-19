const mongoose = require("mongoose")

async function connectToDB() {
    const uri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/interview-ai"

    try {
        await mongoose.connect(uri)
        console.log(`✅ [database] Successfully connected to MongoDB at ${uri}`)
    } catch (err) {
        console.error("❌ [database] Failed to connect to MongoDB:", err.message)
    }
}

module.exports = connectToDB