# 🎓 Technical Interview Guide: InterviewAI Platform
> **Scheduled Interview Date:** 27 October 2026  
> **Candidate Preparation Guide & Technical Deep-Dive**

---

## 1. 60–90 Second Elevator Pitch

> *"InterviewAI is a full-stack, AI-powered interview preparation and evaluation platform designed to bridge the gap between static studying and high-stakes technical interviews. 
> 
> Instead of just reading generic LeetCode problems or predefined questions, candidates upload their real resume PDF and paste a specific job description. Our backend extracts candidate competencies, identifies skill gaps, and uses Google Gemini 2.0 with strict Zod schema validation to generate tailored technical problem scenarios, behavioral prompts, and day-by-day preparation roadmaps.
> 
> Crucially, it's not just a question bank: candidates can take live mock interviews by speaking into their microphone using the Web Speech API or typing responses. Our scoring engine evaluates their answers across five objective criteria—technical correctness, architectural depth, relevance, communication clarity, and completeness—providing quantitative scores, strengths, constructive feedback, and exportable PDF assessment reports.
> 
> I built this using React 19, Node.js and Express 5, MongoDB Atlas, and Puppeteer for PDF generation, with stateless JWT cookie authentication and automatic token blacklisting."*

---

## 2. Problem Statement & Motivation

Traditional interview preparation has two extremes:
1. **LeetCode/HackerRank**: Tests algorithmic puzzles in isolation, but ignores system architecture, trade-off reasoning, and behavioral competencies.
2. **Generic mock interviews or static flashcards**: Not customized to the candidate's actual background or the specific role they are interviewing for.

**InterviewAI solves this** by personalizing both question generation and answer evaluation to the exact delta between a candidate's resume and a target job description.

---

## 3. System Architecture & Request Data Flow

```
[Candidate Browser (React 19)]
       │
       │ 1. Multipart Form (Resume PDF + JD)
       ▼
[Express 5 Server (Node.js)] ───► [Multer Memory Storage]
       │                                  │
       │                                  ▼
       │                          [pdf-parse v2 Stream] (Extracts raw text)
       │                                  │
       ▼                                  ▼
[ai.service.js] ───────────────► [Google Gemini 2.0 Flash]
       │                          (Enforced by Zod & JSON Schema)
       │                                  │
       │ 2. Validated Structured JSON ◄───┘
       ▼
[Mongoose ODM] ────────────────► [MongoDB Atlas Database]
       │                          - Users collection
       │                          - InterviewReports collection
       │                          - BlacklistTokens collection (TTL 24h)
       ▼
[Client State (React 19)]
       │
       │ 3. Candidate answers scenario (Web Speech API / Text)
       ▼
[POST /api/interview/:id/evaluate-answer]
       │
       ▼
[5-Criteria Evaluation Engine] ──► [Instant JSON Feedback + DB Save]
       │
       ▼
[Puppeteer Headless Engine] ────► [Downloadable Assessment Report PDF]
```

---

## 4. Technology Stack & Trade-Off Decisions

| Technology | Why Chosen Over Alternatives |
|---|---|
| **React 19 + Vite** | Vite provides sub-second HMR and optimized ES modules bundling compared to legacy Webpack. React 19 provides modern concurrent rendering and ref handling. |
| **Express 5** | Express 5 has native rejected promise handling in middleware, eliminating verbose unhandled exception boilerplate compared to Express 4. |
| **MongoDB + Mongoose** | Interview reports have dynamic, hierarchical schemas (nested questions, criteria scores, arrays of tasks). A document database avoids complex multi-table relational joins. |
| **Google Gemini 2.0 Flash** | Sub-second latency, low API cost, native Zod JSON schema constraint mode (`responseSchema`), and 1M+ token context window. |
| **Puppeteer** | Direct headless Chrome rendering allows styling reports with standard HTML/CSS and printing pixel-perfect PDFs, avoiding restrictive PDF canvas coordinate libraries like pdfkit. |
| **Web Speech API** | Native browser API requiring zero backend audio streaming servers or paid third-party STT services like Whisper, minimizing latency and infrastructure cost. |

---

## 5. Architectural Responsibilities

- **Frontend (`/Frontend`)**:
  - State management via React Context (`AuthContext`, `InterviewContext`).
  - Audio capture and streaming transcriptions via Web Speech API.
  - Route guards (`Protected.jsx`) redirecting unauthenticated users to `/welcome`.
  - Responsive dark-mode SaaS UI written in modular SASS/SCSS.
- **Backend (`/Backend`)**:
  - REST API endpoint handling and rate/payload validation.
  - Multipart stream buffering (3MB PDF upload ceiling).
  - In-memory PDF text extraction.
  - JWT verification and blacklist token queries on every private request.
  - Puppeteer process lifecycle management (launching, setting content, closing).
- **Database (`MongoDB`)**:
  - User document persistence with bcrypt password hashing (cost factor 10).
  - InterviewReport documents with nested question and evaluation sub-documents.
  - Self-purging token blacklist using MongoDB TTL index (`expires: 86400`).

---

## 6. How the AI Model Generates and Evaluates

### Question Generation
1. In `ai.service.js`, the extracted resume text, self-description, and job description are merged into an engineering prompt.
2. The prompt instructs Gemini to act as a **Staff Principal Technical Interviewer**.
3. We supply `zodToJsonSchema(interviewReportSchema)` to Gemini's `config.responseSchema`. This forces Gemini's decoder to strictly emit JSON matching our Zod schema.

### Answer Evaluation
1. When a candidate submits an answer, we send the **original question**, the **interviewer's intention**, the **benchmark model answer**, and the **candidate's raw answer**.
2. Gemini evaluates the response across 5 criteria on a 0–100 scale:
   - `Technical Correctness` (30%)
   - `Depth of Understanding` (20%)
   - `Relevance to Question` (20%)
   - `Communication Clarity` (15%)
   - `Completeness & Structure` (15%)
3. Returns strengths, areas to improve, specific coaching advice, stronger answer elements, and next topics to review.

---

## 7. Scoring Formula Documentation

### Technical Scenario Formula
$$\text{OverallScore} = 0.30 C + 0.20 D + 0.20 R + 0.15 K + 0.15 M$$
- $C$: Technical Correctness (Accuracy of concepts, algorithms, syntax)
- $D$: Depth (Trade-off awareness, memory vs compute, operational bottlenecks)
- $R$: Relevance (Direct answer to prompt without irrelevant tangents)
- $K$: Communication Clarity (Conciseness, structured nomenclature)
- $M$: Completeness (Addressing edge cases and failure modes)

### Behavioral Scenario Formula
$$\text{OverallScore} = 0.30 R + 0.25 D_{\text{STAR}} + 0.20 C + 0.15 K + 0.10 M$$
- $D_{\text{STAR}}$: Execution depth using Situation, Task, Action, and Result framing.

---

## 8. Authentication, Authorization & Secrets

- **JWT in HTTP-Only Cookies**: Tokens are never stored in `localStorage` or `sessionStorage` (preventing XSS exfiltration). Cookies have `httpOnly: true`, `sameSite: "lax"`, and conditional `secure: true` in production.
- **Logout with Token Blacklist**: On logout, the token is recorded in `blacklistTokens` collection with a 24-hour MongoDB TTL index matching the JWT token lifespan.
- **Resource Authorization**: Every interview query filters by both `_id` and `user: req.user.id`. Even if a user guesses another report's ObjectId, the query returns 404.

---

## 9. API Failure & Resilience Engineering

1. **Lazy AI Initialization & Graceful Fallback**:
   If `GOOGLE_GENAI_API_KEY` is missing or hits a quota/rate-limit, `ai.service.js` catches the error and switches to an offline fallback generator, preventing server 500 crashes during demonstrations.
2. **PDF Parsing Safeguards**:
   Validates file mimetype before parsing. Corrupt or unparsable PDFs return a clean `422 Unprocessable Entity` rather than terminating the process.
3. **Database Availability Safeguards**:
   Missing `MONGO_URI` logs a clear warning without crashing the Express listener.

---

## 10. Top 20 Technical Interview Questions & Answers

### Q1: Why did you use HTTP-only cookies instead of storing JWT in localStorage?
**Answer:** Storing JWT in `localStorage` exposes it to Cross-Site Scripting (XSS) attacks—any injected script can read `window.localStorage`. By setting `httpOnly: true`, browser JavaScript cannot access the cookie. We also set `sameSite: "lax"` to defend against Cross-Site Request Forgery (CSRF).

### Q2: How does the MongoDB TTL index work for token blacklisting?
**Answer:** In `blacklist.model.js`, the `createdAt` field has `expires: 86400` (24 hours). MongoDB's background TTL thread scans the index every 60 seconds and automatically purges expired documents. Since our JWTs expire in 24 hours, any blacklisted token older than 24 hours is already expired cryptographically, so keeping it in the database longer would waste storage.

### Q3: What happens if an uploaded resume PDF is 50MB or malicious?
**Answer:** Our `file.middleware.js` uses Multer with an explicit `fileSize: 3 * 1024 * 1024` (3MB) limit and memory storage. Files exceeding 3MB are rejected at the stream level before buffering into memory, protecting against Denial of Service (DoS) and memory exhaustion.

### Q4: How do you guarantee the AI returns valid JSON instead of markdown or conversational text?
**Answer:** We leverage `@google/genai` with `responseMimeType: "application/json"` and pass our Zod schema converted via `zod-to-json-schema` into `config.responseSchema`. This constrains the LLM decoder at the token sampling level to only output tokens that conform to the JSON schema.

### Q5: How do you prevent one candidate from accessing another candidate's assessment report?
**Answer:** In `interview.controller.js`, queries always include `{ _id: interviewId, user: req.user.id }`. We never rely on the URL parameter alone; the user ID is cryptographically extracted from the verified JWT in the cookie.

### Q6: Why did you choose React 19 over older versions?
**Answer:** React 19 simplifies state logic by treating `ref` as a standard prop, offers improved form actions and pending states, and provides superior concurrent rendering optimizations.

### Q7: Why use Web Speech API rather than sending audio to an Express backend for Whisper transcription?
**Answer:** Web Speech API operates directly in the browser's speech synthesis engine. It provides zero server bandwidth consumption, zero network latency, and zero API costs. For a real-time mock interview practice tool, real-time client-side transcription provides an immediate feedback loop.

### Q8: What is the Expand-and-Contract migration pattern?
**Answer:** In high-traffic databases, changing a schema in-place causes downtime. Expand-and-Contract involves: 1) Adding new fields as optional (Expand); 2) Dual-writing from code; 3) Asynchronously backfilling old records; 4) Reading from new fields; 5) Deleting deprecated fields (Contract).

### Q9: How do you handle Puppeteer memory leaks?
**Answer:** In `generatePdfFromHtml`, Puppeteer browser instances are wrapped in a `try...finally` block that guarantees `await browser.close()` executes even if PDF generation throws an exception, ensuring orphan Chrome processes never accumulate.

### Q10: How does Vite achieve faster build and development times than Webpack?
**Answer:** Vite serves source code over native ES Modules (ESM) during development, offloading bundling to the browser. It pre-bundles dependencies with esbuild (written in Go, 10–100x faster than JavaScript bundlers) and only compiles code requested by the active page.

### Q11: Explain your answer evaluation scoring formula.
**Answer:** We assign weights: Technical Correctness (30%), Depth (20%), Relevance (20%), Communication Clarity (15%), and Completeness (15%). This prevents answers that are verbose but technically inaccurate from receiving inflated scores.

### Q12: How does the application handle double-submissions or race conditions during report generation?
**Answer:** The frontend sets submitting/loading state immediately upon form submission, disabling input buttons and rendering an animated progress overlay until the API resolves.

### Q13: What is the difference between SQL and NoSQL for this use case?
**Answer:** NoSQL (MongoDB) fits this use case because each interview report contains dynamic nested structures (varying number of technical questions, behavioral questions, criteria breakdowns, roadmap days). In SQL, this would require 5 normalized tables and complex JOIN operations for each report view.

### Q14: How are passwords hashed? Why not SHA-256?
**Answer:** We use `bcryptjs` with salt rounds = 10. Plain SHA-256 is a fast cryptographic hash, making it vulnerable to brute-force attacks via GPU-accelerated rainbow tables. Bcrypt is a slow, salted, key-derivation function with configurable work factor specifically designed for password storage.

### Q15: How did you test the application?
**Answer:** We implemented an automated integration and unit test suite in `Backend/tests/api.test.js` using Node.js's native test runner (`node:test`, `node:assert`). It tests API health, auth input validation, authentication guards, and the AI evaluation functions.

### Q16: How would you scale this application to 100,000 daily active users?
**Answer:**
1. Offload Puppeteer PDF generation and heavy AI calls to an asynchronous task queue (BullMQ + Redis) with background worker instances.
2. Put Express behind an NGINX reverse proxy or AWS ALB with autoscaling groups.
3. Cache static interview templates and common questions in Redis.
4. Enable MongoDB replica sets with read preference directed to secondaries.

### Q17: What security headers would you add in production?
**Answer:** Add `helmet` middleware to set `Content-Security-Policy`, `X-Content-Type-Options: nosniff`, `Strict-Transport-Security` (HSTS), and disable `X-Powered-By: Express`.

### Q18: What is the purpose of the Zod library here?
**Answer:** Zod defines TypeScript-first schemas that validate both data types and semantic constraints (e.g. min/max scores). We use it both for data contract validation and to generate the JSON Schema fed into Gemini.

### Q19: Why do you have both a Resume PDF and Assessment Report PDF?
**Answer:** They serve different user needs: the Tailored Resume PDF is an ATS-optimized document the candidate can submit to employers, while the Assessment Report PDF is an internal feedback document detailing their interview evaluation scores, strengths, and study plan.

### Q20: What was the single most difficult technical challenge you solved in this project?
**Answer:** Resolving the synchronization between unhandled asynchronous LLM responses and client state, alongside converting streaming speech transcripts into a structured 5-criteria grading model that executes reliably without failing when third-party API quotas are constrained.

---

## 11. Live Project Demonstration Script (3–5 Minutes)

1. **Introduction (30s)**: Open `http://localhost:5173/welcome`. Show the SaaS Landing Page, explaining the problem statement, system architecture diagram, and 5-criteria scoring model.
2. **Registration / Login (30s)**: Click "Get Started", register a test user, show secure cookie issuance.
3. **Dashboard & Plan Setup (60s)**: Open Dashboard (`/`). Point out historical performance analytics cards. Select "Senior Engineer" + "Advanced Rigor", paste a job description (e.g. Senior Full Stack Engineer), upload a resume PDF (or type skills), click "Generate My Interview Plan".
4. **Live Interactive Practice & Voice (90s)**:
   - Click "Interactive Practice" tab.
   - Click "Speak Answer" microphone button, dictate a technical answer out loud. Show the live transcription.
   - Click "Submit & Evaluate Answer". Watch the AI grading populate: show the overall score, the 5 criteria progress bars, strengths, areas to improve, and coach's advice.
5. **PDF Export & Completion (30s)**:
   - Click "Export Assessment PDF" and show the formatted report.
   - Click "Tailored ATS Resume" and show the tailored resume.
   - Conclude by returning to Dashboard to show the session added to history.
