const mongoose = require('mongoose');

const evaluationSchema = new mongoose.Schema({
    overallScore: { type: Number, min: 0, max: 100 },
    criteria: {
        technicalCorrectness: { type: Number, default: 0 },
        depthOfUnderstanding: { type: Number, default: 0 },
        relevance: { type: Number, default: 0 },
        communicationClarity: { type: Number, default: 0 },
        completeness: { type: Number, default: 0 }
    },
    feedback: { type: String },
    strengths: [{ type: String }],
    areasToImprove: [{ type: String }],
    suggestedImprovement: { type: String },
    strongerAnswerElements: [{ type: String }],
    nextTopicsToStudy: [{ type: String }],
    evaluatedAt: { type: Date, default: Date.now }
}, { _id: false })

const technicalQuestionSchema = new mongoose.Schema({
    question: {
        type: String,
        required: [ true, "Technical question is required" ]
    },
    intention: {
        type: String,
        required: [ true, "Intention is required" ]
    },
    answer: {
        type: String,
        required: [ true, "Answer is required" ]
    },
    candidateAnswer: {
        type: String,
        default: ""
    },
    evaluation: {
        type: evaluationSchema,
        default: null
    },
    status: {
        type: String,
        enum: ["unanswered", "submitted", "evaluated"],
        default: "unanswered"
    }
}, {
    _id: true
})

const behavioralQuestionSchema = new mongoose.Schema({
    question: {
        type: String,
        required: [ true, "Behavioral question is required" ]
    },
    intention: {
        type: String,
        required: [ true, "Intention is required" ]
    },
    answer: {
        type: String,
        required: [ true, "Answer is required" ]
    },
    candidateAnswer: {
        type: String,
        default: ""
    },
    evaluation: {
        type: evaluationSchema,
        default: null
    },
    status: {
        type: String,
        enum: ["unanswered", "submitted", "evaluated"],
        default: "unanswered"
    }
}, {
    _id: true
})

const skillGapSchema = new mongoose.Schema({
    skill: {
        type: String,
        required: [ true, "Skill is required" ]
    },
    severity: {
        type: String,
        enum: [ "low", "medium", "high" ],
        required: [ true, "Severity is required" ]
    }
}, {
    _id: false
})

const preparationPlanSchema = new mongoose.Schema({
    day: {
        type: Number,
        required: [ true, "Day is required" ]
    },
    focus: {
        type: String,
        required: [ true, "Focus is required" ]
    },
    tasks: [ {
        type: String,
        required: [ true, "Task is required" ]
    } ]
})

const interviewReportSchema = new mongoose.Schema({
    jobDescription: {
        type: String,
        required: [ true, "Job description is required" ]
    },
    resume: {
        type: String,
    },
    selfDescription: {
        type: String,
    },
    matchScore: {
        type: Number,
        min: 0,
        max: 100,
    },
    overallPerformanceScore: {
        type: Number,
        min: 0,
        max: 100,
        default: 0
    },
    experienceLevel: {
        type: String,
        enum: ["Entry", "Mid-Level", "Senior", "Lead/Staff"],
        default: "Mid-Level"
    },
    difficulty: {
        type: String,
        enum: ["Standard", "Advanced", "Rigorous"],
        default: "Standard"
    },
    technicalQuestions: [ technicalQuestionSchema ],
    behavioralQuestions: [ behavioralQuestionSchema ],
    skillGaps: [ skillGapSchema ],
    preparationPlan: [ preparationPlanSchema ],
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users"
    },
    title: {
        type: String,
        required: [ true, "Job title is required" ]
    }
}, {
    timestamps: true
})

const interviewReportModel = mongoose.model("InterviewReport", interviewReportSchema);

module.exports = interviewReportModel;