const mongoose = require('mongoose')


const blacklistTokenSchema = new mongoose.Schema({
    token: {
        type: String,
        required: [ true, "token is required to be added in blacklist" ]
    },
    // TTL: MongoDB automatically removes documents after 24 hours
    createdAt: {
        type: Date,
        default: Date.now,
        expires: 86400  // 24 hours in seconds
    }
}, {
    timestamps: false // We handle createdAt manually for TTL
})

const tokenBlacklistModel = mongoose.model("blacklistTokens", blacklistTokenSchema)


module.exports = tokenBlacklistModel