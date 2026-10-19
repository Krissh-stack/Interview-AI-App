const { test, describe } = require("node:test")
const assert = require("node:assert")
const http = require("node:http")
const app = require("../src/app")
const { 
    evaluateCandidateAnswer, 
    generateInterviewReport 
} = require("../src/services/ai.service")

let server
let baseUrl

describe("InterviewAI Backend & Engine Test Suite", () => {
    test("Start in-memory HTTP test server", async () => {
        await new Promise((resolve) => {
            server = http.createServer(app)
            server.listen(0, () => {
                const port = server.address().port
                baseUrl = `http://127.0.0.1:${port}`
                resolve()
            })
        })
        assert.ok(baseUrl, "Server should have a valid port")
    })

    test("GET /api/health returns 200 OK and status", async () => {
        const res = await fetch(`${baseUrl}/api/health`)
        assert.strictEqual(res.status, 200)
        const data = await res.json()
        assert.strictEqual(data.status, "ok")
        assert.strictEqual(data.service, "InterviewAI API")
    })

    test("POST /api/auth/register fails with 400 when fields are missing", async () => {
        const res = await fetch(`${baseUrl}/api/auth/register`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username: "test" })
        })
        assert.strictEqual(res.status, 400)
        const data = await res.json()
        assert.match(data.message, /provide username, email and password/i)
    })

    test("POST /api/auth/login fails with 400 when credentials are missing", async () => {
        const res = await fetch(`${baseUrl}/api/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({})
        })
        assert.strictEqual(res.status, 400)
        const data = await res.json()
        assert.match(data.message, /required/i)
    })

    test("GET /api/interview/ requires authentication (401)", async () => {
        const res = await fetch(`${baseUrl}/api/interview/`)
        assert.strictEqual(res.status, 401)
        const data = await res.json()
        assert.match(data.message, /Authentication required/i)
    })

    test("GET /api/interview/analytics requires authentication (401)", async () => {
        const res = await fetch(`${baseUrl}/api/interview/analytics`)
        assert.strictEqual(res.status, 401)
    })

    test("POST /api/interview/123/evaluate-answer requires authentication (401)", async () => {
        const res = await fetch(`${baseUrl}/api/interview/123/evaluate-answer`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ questionId: "q1", candidateAnswer: "test" })
        })
        assert.strictEqual(res.status, 401)
    })

    test("AI Service: generateInterviewReport produces structured roadmap & questions", async () => {
        const report = await generateInterviewReport({
            jobDescription: "Senior Backend Engineer with Node.js and distributed systems",
            selfDescription: "5 years building Node.js microservices and Redis caching"
        })

        assert.ok(report.title, "Report must include title")
        assert.ok(report.matchScore >= 0 && report.matchScore <= 100, "Match score must be between 0 and 100")
        assert.ok(Array.isArray(report.technicalQuestions) && report.technicalQuestions.length > 0, "Must have technical questions")
        assert.ok(Array.isArray(report.behavioralQuestions) && report.behavioralQuestions.length > 0, "Must have behavioral questions")
        assert.ok(Array.isArray(report.skillGaps) && report.skillGaps.length > 0, "Must have skill gaps")
        assert.ok(Array.isArray(report.preparationPlan) && report.preparationPlan.length > 0, "Must have preparation plan")
        assert.ok(report.technicalQuestions[0].intention, "Technical questions must have interviewer intentions")
        assert.ok(report.technicalQuestions[0].answer, "Technical questions must have model answers")
    })

    test("AI Service: evaluateCandidateAnswer correctly grades across all 5 criteria", async () => {
        const evaluation = await evaluateCandidateAnswer({
            question: "How do you handle microservices database consistency?",
            intention: "Test understanding of distributed data patterns",
            modelAnswer: "Use Saga pattern or 2-Phase Commit with event sourcing",
            candidateAnswer: "In our payment processing system, we utilized the Saga pattern with compensating transactions and RabbitMQ event streaming to maintain eventual consistency without locking distributed tables.",
            questionType: "technical"
        })

        assert.ok(evaluation.overallScore >= 0 && evaluation.overallScore <= 100, "Overall score must be 0-100")
        assert.ok(evaluation.criteria, "Evaluation must have criteria breakdown")
        assert.ok(evaluation.criteria.technicalCorrectness >= 0, "Technical correctness score required")
        assert.ok(evaluation.criteria.depthOfUnderstanding >= 0, "Depth of understanding score required")
        assert.ok(evaluation.criteria.relevance >= 0, "Relevance score required")
        assert.ok(evaluation.criteria.communicationClarity >= 0, "Communication clarity score required")
        assert.ok(evaluation.criteria.completeness >= 0, "Completeness score required")
        assert.ok(Array.isArray(evaluation.strengths) && evaluation.strengths.length > 0, "Must list strengths")
        assert.ok(Array.isArray(evaluation.areasToImprove) && evaluation.areasToImprove.length > 0, "Must list areas to improve")
        assert.ok(evaluation.feedback, "Must provide detailed feedback")
    })

    test("Shutdown test server", async () => {
        await new Promise((resolve) => server.close(resolve))
        assert.ok(true)
    })
})
