# 🎯 Interview AI App

An AI-powered full-stack web application that helps candidates prepare for job interviews. Upload your resume, describe yourself, and paste a job description — the app uses **Google Gemini AI** to generate a personalized interview report with technical & behavioral questions, skill gap analysis, a day-wise preparation plan, and an ATS-optimized resume PDF.

---

## ✨ Features

- 🔐 **User Authentication** — Register, login, and logout with JWT-based auth using HTTP-only cookies
- 📄 **AI Interview Report** — Upload your resume PDF + job description to get:
  - Match score (0–100) between your profile and the job
  - Technical interview questions with intentions & model answers
  - Behavioral interview questions with intentions & model answers
  - Skill gap analysis with severity levels (low / medium / high)
  - Day-wise interview preparation plan
- 📝 **AI Resume Generator** — Generate a tailored, ATS-friendly resume PDF for the given job description
- 📁 **Report History** — View all your previously generated interview reports

---

## 🛠️ Tech Stack

### Backend
| Technology | Purpose |
|---|---|
| Node.js + Express 5 | REST API server |
| MongoDB + Mongoose | Database & ODM |
| Google Gemini AI (`@google/genai`) | AI report & resume generation |
| Multer | Resume PDF file upload handling |
| pdf-parse | Extract text from uploaded PDF resumes |
| Puppeteer | Convert AI-generated HTML resume to PDF |
| JWT + bcryptjs | Authentication & password hashing |
| Zod + zod-to-json-schema | Structured AI response schema validation |
| dotenv | Environment variable management |

### Frontend
| Technology | Purpose |
|---|---|
| React 19 + Vite | UI framework & build tool |
| React Router 7 | Client-side routing |
| Axios | HTTP client for API calls |
| SASS/SCSS | Styling |

---

## 📁 Project Structure

```
Interview-AI-App/
│
├── Backend/
│   ├── server.js                  # Entry point — starts Express server
│   ├── package.json
│   ├── .env                       # Environment variables (not committed)
│   └── src/
│       ├── app.js                 # Express app setup, middleware, route mounting
│       ├── config/
│       │   └── database.js        # MongoDB connection
│       ├── models/
│       │   ├── user.model.js      # User schema
│       │   ├── interviewReport.model.js  # Interview report schema
│       │   └── blacklist.model.js # JWT token blacklist (for logout)
│       ├── controllers/
│       │   ├── auth.controller.js      # Register, login, logout, get-me
│       │   └── interview.controller.js # Generate report, get reports, generate resume PDF
│       ├── routes/
│       │   ├── auth.routes.js          # /api/auth/*
│       │   └── interview.routes.js     # /api/interview/*
│       ├── middlewares/
│       │   ├── auth.middleware.js      # JWT verification middleware
│       │   └── file.middleware.js      # Multer file upload config
│       └── services/
│           └── ai.service.js           # Gemini AI — report generation & resume PDF
│
└── Frontend/
    ├── index.html
    ├── vite.config.js
    ├── package.json
    └── src/
        ├── main.jsx               # React entry point
        ├── App.jsx                # Root component
        ├── app.routes.jsx         # Route definitions
        ├── style.scss             # Global styles
        ├── style/
        │   └── button.scss
        └── features/
            ├── auth/
            │   ├── auth.context.jsx        # Auth state context
            │   ├── hooks/useAuth.js        # Auth hook
            │   ├── services/auth.api.js    # Auth API calls
            │   ├── auth.form.scss
            │   ├── pages/
            │   │   ├── Login.jsx
            │   │   └── Register.jsx
            │   └── components/
            │       └── Protected.jsx       # Protected route wrapper
            └── interview/
                ├── interview.context.jsx   # Interview state context
                ├── hooks/useInterview.js   # Interview hook
                ├── services/interview.api.js  # Interview API calls
                ├── style/
                │   ├── home.scss
                │   └── interview.scss
                └── pages/
                    ├── Home.jsx            # Dashboard / report list
                    └── Interview.jsx       # Report generation page
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js v18+
- MongoDB Atlas account
- Google Cloud account (for Gemini API key)

### 1. Clone the Repository

```bash
git clone https://github.com/Krissh-stack/Interview-AI-App.git
cd Interview-AI-App
```

### 2. Backend Setup

```bash
cd Backend
npm install
```

Create a `.env` file in the `Backend/` directory:

```env
MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/interview-ai
JWT_SECRET=your_jwt_secret_key
GOOGLE_GENAI_API_KEY=your_google_gemini_api_key
```

> **Getting your Gemini API Key:**
> Visit [Google AI Studio](https://aistudio.google.com/app/apikey) → Create API Key → Copy it into `.env`

Start the backend server:

```bash
npm run dev      # Development (nodemon)
# or
node server.js   # Production
```

The backend runs on **http://localhost:3000**

### 3. Frontend Setup

```bash
cd ../Frontend
npm install
npm run dev
```

The frontend runs on **http://localhost:5173**

---

## 🔌 API Reference

### Auth Routes — `/api/auth`

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | `/register` | Register a new user | Public |
| POST | `/login` | Login with email & password | Public |
| GET | `/logout` | Logout and blacklist token | Public |
| GET | `/get-me` | Get current logged-in user | Private |

### Interview Routes — `/api/interview`

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | `/` | Generate interview report (upload resume PDF) | Private |
| GET | `/` | Get all interview reports for logged-in user | Private |
| GET | `/report/:interviewId` | Get a specific interview report by ID | Private |
| POST | `/resume/pdf/:interviewReportId` | Generate ATS resume PDF for a report | Private |

> **Note:** All private routes require a valid JWT token sent via HTTP-only cookie.

---

## 🤖 How the AI Works

1. **Resume Parsing** — The uploaded PDF is parsed to plain text using `pdf-parse`
2. **Prompt Construction** — Resume text, self-description, and job description are combined into a structured prompt
3. **Gemini AI Generation** — The app calls `gemini-3-flash-preview` with a strict **Zod schema** to ensure structured JSON output
4. **Report Fields:**
   - `matchScore` — 0–100 profile-to-job match score
   - `technicalQuestions` — Questions, interviewer intention, and how to answer
   - `behavioralQuestions` — Questions, interviewer intention, and how to answer
   - `skillGaps` — Missing skills with severity: `low | medium | high`
   - `preparationPlan` — Day-by-day study plan with focus area and tasks
5. **Resume PDF** — Gemini generates ATS-optimized HTML, which Puppeteer converts to a downloadable PDF

---

## 🔐 Environment Variables

| Variable | Description |
|---|---|
| `MONGO_URI` | MongoDB Atlas connection string |
| `JWT_SECRET` | Secret key for signing JWT tokens |
| `GOOGLE_GENAI_API_KEY` | Google Gemini API key from AI Studio |

---

## 📦 Scripts

### Backend
```bash
npm run dev     # Start with nodemon (auto-restart on file changes)
node server.js  # Start in production mode
```

### Frontend
```bash
npm run dev     # Start Vite dev server
npm run build   # Build for production
npm run preview # Preview production build
npm run lint    # Run ESLint
```

---

## 🙌 Contributing

Pull requests are welcome! For major changes, please open an issue first to discuss what you'd like to change.

---

## 📄 License

This project is licensed under the ISC License.
