# 🎯 InterviewAI — Full-Stack AI Interview Evaluation & Preparation Platform

An enterprise-grade, full-stack AI interview preparation and evaluation platform built with **React 19, Node.js, Express 5, MongoDB Atlas**, and **Google Gemini 2.0 Flash**.

Candidates can upload their resume PDF, input any target job description, configure target seniority & rigor, practice taking mock questions (with real-time voice dictation or text), and receive instant evidence-based grading across 5 distinct evaluation criteria, alongside ATS tailored resumes and printable assessment reports.

---

## ✨ System Highlights & Features

### 1. 🔐 Production Authentication & Security
- **JWT-Based Stateless Auth** transmitted via secure `httpOnly`, `sameSite: lax` cookies.
- **Token Blacklisting with Automatic TTL Expiration** in MongoDB upon user logout.
- Strict route-level authorization ensuring candidates only access their own sessions and evaluation reports.

### 2. 🤖 Gemini 2.0 AI Evaluation Engine
- **Zod & JSON Schema Enforcement**: Strict structured outputs with zero hallucinated response structures.
- **5-Dimension Scoring Engine**:
  - `Technical Correctness` (30%)
  - `Depth of Understanding` (20%)
  - `Relevance to Question` (20%)
  - `Communication Clarity` (15%)
  - `Completeness & Structure` (15%)
- **Actionable Feedback Loop**: Detailed strengths, concrete areas to improve, and what a staff-level candidate would highlight.

### 3. 🎙️ Live Interactive Practice (Speech-to-Text)
- Real-time voice answer dictation via **Web Speech API** (`webkitSpeechRecognition`).
- Clean split between **Interactive Practice Mode** and **Benchmark Model Answers**.

### 4. 📄 Double PDF Generation Pipeline (Puppeteer)
- **Tailored ATS Resume PDF**: Converts AI-tailored resume HTML into downloadable PDF.
- **Official Assessment Report PDF**: Full printable report of candidate match score, question-by-question evaluations, and preparation roadmap.

### 5. 📊 Analytics & Preparation Roadmap
- Aggregated dashboard analytics: average match score, practice readiness score, and historical trend chart.
- Day-by-day targeted preparation plan tailored to job requirements.

---

## 🛠️ Technology Stack

| Layer | Technologies | Key Rationale |
|---|---|---|
| **Frontend** | React 19, Vite 7, React Router 7, SCSS | Cutting-edge concurrent React features, sub-second HMR with Vite, modular styling |
| **Backend** | Node.js, Express 5 | Lightweight asynchronous I/O, modern promise-handling middleware in Express 5 |
| **Database** | MongoDB Atlas, Mongoose 9 | Document-oriented model ideal for complex nested question/answer/evaluation schemas |
| **AI / LLM** | Google Gemini 2.0 Flash (`@google/genai`) | Sub-second latency, 1M+ token context window, native JSON schema mode |
| **PDF Engine** | Puppeteer Headless Chrome | Pixel-perfect print-ready PDF compilation from styled HTML templates |
| **Speech** | Web Speech API | Zero external cost, client-side real-time voice-to-text dictation |
| **Testing** | Node.js Test Runner (`node:test`, `node:assert`) | Native zero-dependency unit and integration testing |

---

## 🚀 Quickstart & Setup Guide

### Prerequisites
- Node.js v18+ (tested on v20 and v24)
- MongoDB Atlas cluster URL (or local MongoDB)
- Google AI Studio API Key ([Get free API key](https://aistudio.google.com/app/apikey))

### 1. Backend Setup
```bash
cd Backend
npm install
```

Create a `.env` file in `Backend/` (see `.env.example`):
```env
MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/interview-ai
JWT_SECRET=your_super_secret_jwt_key_here
GOOGLE_GENAI_API_KEY=your_gemini_api_key_here
```

Run test suite:
```bash
npm test
```

Start development server:
```bash
npm run dev
# Server listens on http://localhost:3000
```

### 2. Frontend Setup
```bash
cd ../Frontend
npm install
npm run dev
# Client runs on http://localhost:5173
```

---

## 🔌 API Reference

### Auth Routes (`/api/auth`)
| Method | Endpoint | Description | Access |
|---|---|---|---|
| `POST` | `/api/auth/register` | Register username, email, password | Public |
| `POST` | `/api/auth/login` | Sign in & set secure cookie | Public |
| `GET` | `/api/auth/logout` | Invalidate token in blacklist | Public |
| `GET` | `/api/auth/get-me` | Get authenticated user info | Private |

### Interview Routes (`/api/interview`)
| Method | Endpoint | Description | Access |
|---|---|---|---|
| `POST` | `/api/interview/` | Generate tailored interview plan (Upload resume PDF) | Private |
| `GET` | `/api/interview/` | Get list of user's interview sessions | Private |
| `GET` | `/api/interview/analytics` | Get user readiness trends & session analytics | Private |
| `GET` | `/api/interview/report/:id` | Fetch specific interview session with evaluations | Private |
| `POST` | `/api/interview/:id/evaluate-answer` | Grade candidate's answer with 5-criteria model | Private |
| `POST` | `/api/interview/resume/pdf/:id` | Download Tailored ATS Resume PDF | Private |
| `GET` | `/api/interview/pdf/:id` | Download Comprehensive Assessment Report PDF | Private |
| `DELETE` | `/api/interview/:id` | Delete an interview session | Private |

---

## 🧪 Architecture & Scoring Formula

### Mathematical Evaluation Formula
For technical questions, the overall score ($S \in [0, 100]$) is computed as:
$$S_{\text{tech}} = 0.30 C_{\text{tech}} + 0.20 D + 0.20 R + 0.15 K + 0.15 M$$

Where:
- $C_{\text{tech}}$: Technical Correctness & Logic
- $D$: Depth of Architectural Understanding
- $R$: Relevance to Question Prompt
- $K$: Communication Clarity & Terminology
- $M$: Completeness & Boundary Handling

For behavioral questions:
$$S_{\text{behav}} = 0.30 R + 0.25 D_{\text{STAR}} + 0.20 C_{\text{impact}} + 0.15 K + 0.10 M$$

---

## 📄 License
ISC License.
