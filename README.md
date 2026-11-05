# 🎓 StudentPro - Fullstack AI-Powered Performance & Cognitive Tracking Platform

> **A Production-Grade Fullstack Web Application** built with **Node.js, Express, MongoDB Atlas, JWT Role-Based Authentication, PDFKit Report Generation, Nodemailer SMTP Email Dispatch, Canvas Analytics, and Cognitive Brain Gym**.

---

## 📌 Table of Contents

- [Overview](#-overview)
- [New Fullstack Architecture](#-new-fullstack-architecture)
- [Project Directory Structure](#-project-directory-structure)
- [Key Features](#-key-features)
- [Role-Based Access & User Flows](#-role-based-access--user-flows)
  - [Student Experience](#student-experience)
  - [Teacher Experience & Administration](#teacher-experience--administration)
- [Database Models & Schemas](#-database-models--schemas)
- [REST API Endpoints Specification](#-rest-api-endpoints-specification)
- [Official PDF Academic Report & SMTP Dispatch](#-official-pdf-academic-report--smtp-dispatch)
- [Environment Configuration (.env)](#-environment-configuration-env)
- [Getting Started & Local Setup](#-getting-started--local-setup)
- [Demo Credentials](#-demo-credentials)

---

## 🌟 Overview

**StudentPro** is a modern, modular fullstack learning and cognitive tracking platform. It bridges the gap between academic examination preparation, real-time study discipline, and parental accountability.

The system features:
1. **Academic Mastery:** 12 curated subject tracks (HTML5, CSS3, JavaScript ES6+, React, Node.js, Express.js, MongoDB, Python, Quantitative Aptitude, Logical Reasoning, Verbal Ability, General Knowledge) with completely unique question banks per subject.
2. **Real-Time Study Hour Tracking:** Interactive student-controlled stopwatch with pause/resume and subject session logging.
3. **Cognitive Brain Gym (Mind Gym):** Pattern IQ, Stroop color-word conflict reaction, mental math, grid memory, speed IQ, and spatial sliding puzzle.
4. **Teacher Control Center:** Stream-wise directory of students (Computer Science, IT, ECE, Mechanical, Civil), drill-down into individual progress boards, and parental contact access.
5. **Parental Reporting:** Automated computer-generated A4 PDF reports dispatched directly to both the student's email and their parents' email via Gmail SMTP, with instant WhatsApp sharing.
6. **Graceful Offline Fallback:** Fully functional in-memory demo data mode if MongoDB Atlas or SMTP credentials are not yet configured.

---

## 🛠 New Fullstack Architecture

```
                                +---------------------------+
                                |      Browser Client       |
                                | (Vanilla HTML5 / CSS3 / JS)|
                                +-------------+-------------+
                                              |
                         JWT Bearer Token / REST API Requests
                                              |
                                              v
+-----------------------------------------------------------------------------------------+
|                                Node.js & Express Server                                 |
|                                                                                         |
|  [Middleware]                                                                           |
|  - CORS / Morgan Logging / Body Parser                                                  |
|  - JWT Authentication Guard (authenticateToken)                                          |
|  - Role Guard (requireRole('student' | 'teacher' | 'admin'))                             |
|  - Static Frontend File Server (Connects frontend & backend seamlessly)                 |
|                                                                                         |
|  [Modular Controllers & Routes]                                                         |
|  - auth.controller.js     -> POST /register, POST /login, GET /me                       |
|  - test.controller.js     -> GET /subjects, GET /subjects/:sub, POST /submit            |
|  - study.controller.js    -> POST /log, GET /analytics                                  |
|  - teacher.controller.js  -> GET /streams, GET /streams/:name/students, GET /student/...|
|  - report.controller.js   -> GET /download-pdf, POST /send-email                        |
|                                                                                         |
|  [Utilities & Engines]                                                                  |
|  - pdfGenerator.util.js  -> PDFKit Vector Document Engine (A4 Printable Format)         |
|  - emailService.util.js  -> Nodemailer Transporter (Dual Student + Parent SMTP Dispatch)|
|  - seedQuestions.data.js -> 12 Unique Subject Question Banks (60+ Unique Questions)     |
+------------------------------+---------------------------+------------------------------+
                               |                           |
                 (Production DB Connection)   (Notification Gateway)
                               v                           v
                   +-----------------------+   +-----------------------+
                   |     MongoDB Atlas     |   |   Gmail SMTP Server   |
                   |   (Cloud Database)    |   |  (Parent & Student)   |
                   +-----------------------+   +-----------------------+
```

---

## 📂 Project Directory Structure

Strictly organized into only two clean top-level directories: `frontend/` and `backend/`.

```
student_hub/
├── .gitignore                      # Global gitignore (node_modules, .env, logs)
├── README.md                       # Comprehensive system documentation
│
├── backend/                        # Node.js + Express Modular Backend
│   ├── .env                        # Environment variables (MongoDB URI, JWT secret, SMTP)
│   ├── .env.example                # Example environment template
│   ├── .gitignore                  # Backend-specific ignore rules
│   ├── package.json                # Dependencies and npm run scripts
│   ├── server.js                   # Main application entry point & static server
│   │
│   ├── config/
│   │   ├── database.config.js      # Mongoose Atlas connection + offline fallback
│   │   └── mailer.config.js        # Nodemailer SMTP transporter
│   │
│   ├── controllers/
│   │   ├── auth.controller.js      # User registration, login, JWT issuance
│   │   ├── test.controller.js      # Subject tests catalog & result submission
│   │   ├── study.controller.js     # Real-time study hour logging & chart metrics
│   │   ├── teacher.controller.js   # Streams overview & student drill-down
│   │   └── report.controller.js    # PDF download & dual email dispatch
│   │
│   ├── middleware/
│   │   ├── auth.middleware.js      # Bearer token verification & user population
│   │   ├── role.middleware.js      # Role-based endpoint guards
│   │   └── error.middleware.js     # Centralized error handler
│   │
│   ├── models/
│   │   ├── user.model.js           # Student & Teacher schemas with parent contacts
│   │   ├── testResult.model.js     # Academic & Mock test scoring records
│   │   ├── studySession.model.js   # Real-time stopwatch session logs
│   │   └── questionBank.model.js   # Subject-specific test questions
│   │
│   ├── routes/
│   │   ├── auth.routes.js          # Authentication routing
│   │   ├── test.routes.js          # Subject examination routing
│   │   ├── study.routes.js         # Study session tracking routing
│   │   ├── teacher.routes.js       # Teacher administration routing
│   │   └── report.routes.js        # PDF generation & email reporting routing
│   │
│   └── utils/
│       ├── emailService.util.js    # Nodemailer email sender with PDF attachments
│       ├── pdfGenerator.util.js    # PDFKit vector report document builder
│       └── seedQuestions.data.js   # 12 Unique subject question repositories
│
└── frontend/                       # Client-Side Application
    ├── index.html                  # Role-based login (Student / Teacher toggle)
    ├── register.html               # Registration with parent email & mobile collection
    ├── dashboard.html              # Student central hub & recent activities
    ├── teacher-dashboard.html      # Teacher control panel (Streams -> Students -> Modal)
    ├── mock-tests.html             # Categorized test catalog & 30Q full-stack exam
    ├── test.html                   # Timed interactive live exam test engine
    ├── papers.html                 # Practice papers + free study documentation links
    ├── progress.html               # Bar/Pie charts & real-time study stopwatch
    ├── parent-view.html            # Parent performance summary & PDF report export
    ├── puzzles.html                # Mind Gym: Pattern, Stroop, Math, Memory
    ├── sliding-puzzle.html         # Spatial tile reordering puzzle
    ├── iq_quize.html               # Speed IQ cognitive 10-question evaluation
    │
    ├── css/                        # Responsive stylesheets
    │   ├── dashboard.css           # Global layout & component styles
    │   ├── mock-tests.css          # Exam cards & catalog styles
    │   ├── papers.css              # Technology cards & filter bar
    │   └── test.css                # Question workspace & palette sidebar
    │
    └── js/
        ├── api.js                  # Central API client, token handling & auth guards
        ├── login.js                # Login authentication & role-based redirection
        ├── register.js             # Registration submission & validation
        ├── dashboard.js            # Student metrics & recent test history
        ├── mock-tests.js           # Subject-specific test launch & 30Q engine
        ├── test.js                 # Question palette, timer & test submission
        └── papers.js               # Practice papers & external study links
```

---

## 🎯 Key Features

### 1. Unique Subject-Specific Question Banks
- Tests are **not identical**: Each of the 12 subjects has its own dedicated question bank with unique questions, options, correct answers, and explanations:
  - **Frontend:** HTML5, CSS3, JavaScript ES6+, React JS.
  - **Backend:** Node.js, Express.js, MongoDB, Python.
  - **Aptitude & Cognitive:** Quantitative Aptitude, Logical Reasoning, Verbal Ability, General Knowledge.

### 2. Free Study Resource Documentation Links
- In the **Practice Papers** section, each technology card features:
  - `📖 Study Notes →` opening official free learning documentation (MDN Web Docs, React Docs, Node.js Guide, Express.js Guide, MongoDB Manual, Python Docs).
  - `🚀 Start Mock Test` dynamically loading the subject's unique test questions.

### 3. Student Study Timer (Real-Time Stopwatch)
- Built directly into the **Progress** page (`progress.html`).
- Students select their study subject, click **Start**, pause/resume as needed, and click **Log Session**.
- Sessions are saved to the backend database (`POST /api/study/log`) and immediately update the weekly study hours and charts.

### 4. Interactive Canvas Visualizations
- **Bar Chart:** Weekly study hours distribution (Monday through Sunday).
- **Donut / Pie Chart:** Subject-wise time investment with dynamic legend.
- Built with standard HTML5 Canvas API (no external heavy libraries required).

### 5. Teacher Command Dashboard
- Dedicated view for teachers (`teacher-dashboard.html`) guarded by JWT role verification.
- **Streams Grid:** Shows student counts and average performance across Computer Science, Information Technology, Electronics, Mechanical, and Civil streams.
- **Drill-Down Directory:** Clicking any stream reveals all registered students in that stream.
- **Student Progress Board Modal:** Clicking any student opens their detailed progress report with:
  - Parent contact information (Name, Mobile, Email).
  - Test history table and average accuracy.
  - One-click **"Send PDF Report to Parent"** button via SMTP.
  - One-click **"Download Official PDF"** button.

---

## 👥 Role-Based Access & User Flows

| Page | Target Role | Access Level |
|---|---|---|
| `index.html` | Public | Role switcher (Student / Teacher) |
| `register.html` | Public | Captures parent mobile & email for students |
| `dashboard.html` | Student | Personal metrics & learning modules (Parent View hidden) |
| `mock-tests.html` | Student | 12 Subject tests + 30Q Fullstack test |
| `test.html` | Student | Timed live exam workspace |
| `papers.html` | Student | Practice papers + free study documentation hyperlinks |
| `progress.html` | Student | Personal study stopwatch + Bar chart + Pie chart |
| `puzzles.html` | Student | Mind Gym cognitive training |
| `sliding-puzzle.html` | Student | Spatial logic puzzle |
| `iq_quize.html` | Student | 10-Question speed IQ test |
| `teacher-dashboard.html` | Teacher / Admin | Streams overview, student directory, modal reports |
| `parent-view.html` | Teacher / Parent / Student | Official 7-day academic summary & PDF/WhatsApp export |

---

## 🗄 Database Models & Schemas

### 1. User Model (`backend/models/user.model.js`)
- `name`, `email` (unique), `password` (bcrypt hashed), `role` (`'student' | 'teacher' | 'admin'`).
- **Student fields:** `stream`, `classOrYear`, `section`, `rollNumber`, `parentName`, `parentMobile`, `parentEmail`, `totalStudyMinutes`, `activeStreakDays`, `lastStudyDate`.
- **Teacher fields:** `department`, `designation`, `employeeId`.

### 2. TestResult Model (`backend/models/testResult.model.js`)
- `student` (ObjectId ref User), `studentName`, `stream`, `subject`, `testTitle`, `score`, `totalQuestions`, `wrongCount`, `accuracy`, `durationMinutes`, `timeTakenSeconds`, `status` (`'Pass' | 'Fail'`), `date`.

### 3. StudySession Model (`backend/models/studySession.model.js`)
- `student` (ObjectId ref User), `subject`, `durationMinutes`, `topicCovered`, `sessionDate`.

### 4. QuestionBank Model (`backend/models/questionBank.model.js`)
- `subject`, `category`, `title`, `defaultDurationMinutes`, `questions` array of `{ question, options, answer, explanation }`.

---

## 📡 REST API Endpoints Specification

### Authentication (`/api/auth`)
- `POST /api/auth/register` — Register student (with parent info) or teacher.
- `POST /api/auth/login` — Login with email, password, and role. Returns JWT token.
- `GET  /api/auth/me` — Get current authenticated user profile (`Bearer <token>`).

### Test Center (`/api/tests`)
- `GET  /api/tests/subjects` — List all 12 available subject exam tracks.
- `GET  /api/tests/subjects/:subject` — Retrieve unique 5 questions for a subject.
- `POST /api/tests/submit` — Submit test score, duration, and accuracy.
- `GET  /api/tests/history` — Get student's historical test attempts.

### Study Hour Tracking (`/api/study`)
- `POST /api/study/log` — Log minutes studied for a specific subject.
- `GET  /api/study/analytics` — Get weekly breakdown and subject pie distribution.

### Teacher Administration (`/api/teacher`) *(Requires teacher/admin role)*
- `GET  /api/teacher/streams` — Get streams overview and student counts.
- `GET  /api/teacher/streams/:streamName/students` — Get students within a stream.
- `GET  /api/teacher/students/:studentId/progress` — Get detailed progress and parent view.

### PDF & Parental Reports (`/api/reports`)
- `GET  /api/reports/download-pdf?token=<jwt>` — Streams generated A4 PDF file.
- `POST /api/reports/send-email` — Generates PDF and dispatches via SMTP to student and parent.

---

## 📄 Official PDF Academic Report & SMTP Dispatch

Reports are generated dynamically as binary vector PDF documents using **PDFKit**:
- **Format:** Official A4 format (`595.28 x 841.89 pt`).
- **Structure:**
  1. Header banner with StudentPro credentials and date.
  2. Student identity block with stream, roll number, and parent contact details.
  3. Key performance indicator (KPI) metric cards (Tests, Accuracy, Hours, Rating).
  4. Detailed mock test history table with subject, score, and status.
  5. AI Counselor & Academic Recommendations section.
  6. Official footer with computer-generated report verification.
- **SMTP Dual Dispatch:** When triggered, the PDF is attached to an email sent simultaneously to:
  1. The student's email address.
  2. The registered parent's email address.

---

## ⚙ Environment Configuration (.env)

Configuration is managed in `backend/.env`. A template is provided in `backend/.env.example`:

```env
# Server Port
PORT=5000
NODE_ENV=development

# MongoDB Atlas Connection URI
# Replace with your actual MongoDB Atlas cluster connection string:
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/studentpro?retryWrites=true&w=majority

# JWT Authentication Secret
JWT_SECRET=studentpro_super_secret_jwt_key_2026_xyz987

# SMTP Email Configuration (Gmail App Password)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_16_digit_app_password
SMTP_FROM_NAME=StudentPro Academic Portal
SMTP_FROM_EMAIL=your_email@gmail.com

# Frontend Application Origin
FRONTEND_URL=http://localhost:5000
```

> **Note on Gmail SMTP:** In Google Account Security settings, enable 2-Step Verification, generate an **App Password** for "Mail", and paste the 16-character string into `SMTP_PASS`.

---

## 🚀 Getting Started & Local Setup

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- [npm](https://www.npmjs.com/)

### 1. Install Backend Dependencies
```bash
cd backend
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env` and adjust your MongoDB and SMTP settings:
```bash
cp .env.example .env
```
*(If MongoDB is not yet set up, the application will automatically run in in-memory demo mode with zero downtime).*

### 3. Start the Server
```bash
# In backend/ directory:
npm start

# Or with automatic reload during development:
npm run dev
```

### 4. Access the Platform
Open your browser and navigate to:
```
http://localhost:5000
```
The backend serves the frontend files directly.

---

## 🔑 Demo Credentials

Quick 1-click test credentials available directly on the login page:

| Role | Email | Password | Access Capabilities |
|---|---|---|---|
| **Student** | `student@gmail.com` | `123456` | Dashboard, Practice Papers, Mock Tests, Mind Gym, Personal Progress & Stopwatch |
| **Teacher** | `teacher@gmail.com` | `123456` | Teacher Dashboard, Stream Directory, Student Progress Modals, Parent PDF & Email Dispatch |

---

*StudentPro Academic Platform — Designed for academic excellence and cognitive mastery.*
