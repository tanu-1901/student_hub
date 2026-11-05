# StudentPro - Fullstack Academic & Cognitive Tracking Platform

> **A Production-Grade Fullstack Web Application** built with **Node.js, Express, MongoDB Atlas, JWT Authentication, PDFKit Report Generation, Gmail SMTP Dispatch, and Glassmorphic Modern UI**.

---

## Table of Contents

- [Overview](#overview)
- [System Architecture](#system-architecture)
- [Project Directory Structure](#project-directory-structure)
- [Key Features](#key-features)
- [Local Developer Setup](#local-developer-setup)
  - [Prerequisites](#prerequisites)
  - [1. Clone Repository](#1-clone-repository)
  - [2. Environment Configuration (.env)](#2-environment-configuration-env)
  - [3. Install Dependencies & Run](#3-install-dependencies--run)
  - [Demo Accounts](#demo-accounts)
- [Docker Deployment](#docker-deployment)
  - [Build Docker Image](#build-docker-image)
  - [Run Docker Container](#run-docker-container)
- [Render Cloud Deployment Guide](#render-cloud-deployment-guide)
  - [Method 1: Docker Web Service (Recommended)](#method-1-docker-web-service-recommended)
  - [Method 2: Render Blueprint (render.yaml)](#method-2-render-blueprint-renderyaml)
  - [Method 3: Native Node.js Web Service](#method-3-native-nodejs-web-service)
  - [Required Render Environment Variables](#required-render-environment-variables)
  - [Render Deployment CLI Commands](#render-deployment-cli-commands)
- [REST API Endpoints](#rest-api-endpoints)
- [Contributing & License](#contributing--license)

---

## Overview

**StudentPro** is an end-to-end fullstack platform designed for schools, universities, and coaching institutes. It connects academic test preparation, study discipline logging, cognitive brain training, and automated parental reporting into a unified system.

The application features:
1. **Academic Mock Test Arena:** 12 curated subject modules (HTML5, CSS3, JavaScript, React, Node.js, Express.js, MongoDB, Python, Quantitative Aptitude, Logical Reasoning, Verbal Ability, General Knowledge) with completely unique question banks per subject.
2. **Live Examination Room:** Sleek countdown timer, glass option cards with letter badges (A, B, C, D), floating question palette, and real-time score calculation.
3. **Cognitive Mind Gym:** Interactive brain-training modules including Pattern IQ, Stroop color-word conflict reaction, mental math sprint, grid memory, speed IQ, and spatial sliding puzzle.
4. **Teacher Control Center:** Stream-wise directory of students (Computer Science, IT, ECE, Mechanical, Civil), drill-down academic scorecards, and one-click parental report dispatch.
5. **Parental Reporting:** Automated vector A4 PDF reports dispatched directly to both the student's email and their parents' email via Gmail SMTP, with instant WhatsApp sharing.
6. **Glassmorphism Design System:** Professional, modern UI with frosted glass cards, subtle borders, ambient gradients, and zero emojis (100% SVG Lucide-style vector icons).

---

## System Architecture

```
                                +----------------------------+
                                |       Browser Client       |
                                |  (Vanilla HTML5 / CSS / JS)|
                                +--------------+-------------+
                                               |
                          JWT Bearer Token / REST API Requests
                                               |
                                               v
+------------------------------------------------------------------------------------------+
|                                 Node.js & Express Server                                 |
|                                                                                          |
|  [Middleware]                                                                            |
|  - CORS / Morgan Logging / Body Parser                                                   |
|  - JWT Authentication Guard (authenticateToken)                                          |
|  - Role Guard (requireRole('student' | 'teacher'))                                       |
|  - Static Frontend File Server (serves frontend seamlessly on root /)                     |
|                                                                                          |
|  [Modular Controllers & Routes]                                                          |
|  - auth.controller.js     -> POST /register, POST /login, GET /me                        |
|  - test.controller.js     -> GET /subjects, GET /subjects/:sub, POST /submit             |
|  - study.controller.js    -> POST /log, GET /analytics                                   |
|  - teacher.controller.js  -> GET /streams, GET /streams/:name/students                   |
|  - report.controller.js   -> GET /download-pdf, POST /send-email                         |
|                                                                                          |
|  [Engines & Data]                                                                        |
|  - pdfGenerator.util.js  -> PDFKit Vector Document Engine (Printable A4)                 |
|  - emailService.util.js  -> Nodemailer Transporter (Dual Student + Parent SMTP Dispatch) |
|  - seedQuestions.data.js -> 12 Unique Subject Question Banks                             |
+-------------------------------+----------------------------+-----------------------------+
                                |                            |
                  (Cloud Database Connection)   (Notification Gateway)
                                v                            v
                    +-----------------------+    +-----------------------+
                    |     MongoDB Atlas     |    |   Gmail SMTP Server   |
                    |   (Cloud Database)    |    |  (Parent & Student)   |
                    +-----------------------+    +-----------------------+
```

---

## Project Directory Structure

```
student_hub/
├── Dockerfile                      # Production multi-stage Dockerfile
├── .dockerignore                   # Docker build exclusion rules
├── render.yaml                     # Render Blueprint deployment specification
├── package.json                    # Root scripts for build and start
├── .gitignore                      # Git ignore rules
├── README.md                       # Complete setup and deployment documentation
│
├── frontend/                       # Static Frontend Client (Vanilla HTML/CSS/JS)
│   ├── index.html                  # Student & Teacher Login portal
│   ├── register.html               # Registration page with stream selection
│   ├── dashboard.html              # Student Dashboard with live metrics
│   ├── mock-tests.html             # Mock Test Arena & 30-Question Live Engine
│   ├── papers.html                 # Practice Papers directory with study links
│   ├── test.html                   # Live Exam Room with question palette & timer
│   ├── progress.html               # Progress analytics with Chart.js
│   ├── teacher-dashboard.html      # Teacher control center & student management
│   ├── parent-view.html            # Parent portal view & WhatsApp sharing
│   ├── puzzles.html                # Mind Gym 5-in-1 cognitive mini-games
│   ├── sliding-puzzle.html         # Number sliding puzzle game
│   ├── iq_quize.html               # Speed logic & IQ quiz
│   │
│   ├── css/
│   │   ├── dashboard.css           # Global design system & glassmorphism variables
│   │   ├── login.css               # Auth portal styling
│   │   ├── mock-tests.css          # Test arena and filter styling
│   │   ├── papers.css              # Practice papers grid styling
│   │   └── test.css                # Exam room and question palette styling
│   │
│   └── js/
│       ├── api.js                  # Central API client & session manager
│       ├── questionBanks.js        # 12 Curated subject question banks
│       ├── dashboard.js            # Dashboard metrics & history controller
│       ├── mock-tests.js           # Catalog & full-stack test controller
│       ├── papers.js               # Practice papers controller
│       └── test.js                 # Live exam engine controller
│
└── backend/                        # Node.js & Express REST API
    ├── .env                        # Local environment variables (git-ignored)
    ├── .env.example                # Sample environment template
    ├── package.json                # Backend dependencies and scripts
    ├── server.js                   # Application entry point & static server
    │
    ├── config/
    │   ├── database.config.js      # Mongoose Atlas connection + offline memory mode
    │   └── mailer.config.js        # Nodemailer SMTP configuration
    │
    ├── controllers/
    │   ├── auth.controller.js      # Register, Login, Profile
    │   ├── test.controller.js      # Question banks & test submission
    │   ├── study.controller.js     # Study session tracking & analytics
    │   ├── teacher.controller.js   # Stream management & student records
    │   └── report.controller.js    # PDF generation & email dispatch
    │
    ├── middleware/
    │   ├── auth.middleware.js      # JWT authentication and role validation
    │   └── error.middleware.js     # Centralized error handler
    │
    ├── models/
    │   ├── user.model.js           # Student & Teacher schema
    │   ├── testResult.model.js     # Mock test submissions schema
    │   └── studySession.model.js   # Study hour logs schema
    │
    ├── routes/                     # Express REST routes
    └── utils/
        ├── pdfGenerator.util.js    # PDFKit report generator
        ├── emailService.util.js    # Nodemailer email sender
        └── seedQuestions.data.js   # Curated questions database
```

---

## Key Features

- **Subject-Specific Tests:** HTML5 tests only show HTML questions, CSS tests only show CSS questions, Python tests only show Python questions, etc.
- **Interactive Option Badges:** Modern letter circles (A, B, C, D) with hover states, active indigo glow, and vector check indicators.
- **No Invisible Options:** Options rendered via safe DOM text methods so HTML tags like `<footer>`, `<!DOCTYPE html>`, `<canvas>`, and `<svg>` always render visibly.
- **Dual Offline & Online Architecture:** If MongoDB Atlas or SMTP credentials are not yet configured, the system gracefully falls back to in-memory mode without crashing.
- **Official PDF Generation:** Generates vector-based academic report cards on A4 format with student details, stream, accuracy breakdown, and teacher signature box.

---

## Local Developer Setup

### Prerequisites

- [Node.js](https://nodejs.org/) (v18.x or v20.x recommended)
- [Git](https://git-scm.com/)
- [npm](https://www.npmjs.com/) (bundled with Node.js)
- *(Optional)* Free [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) cluster account

---

### 1. Clone Repository

```bash
git clone https://github.com/your-username/student_hub.git
cd student_hub
```

---

### 2. Environment Configuration (.env)

Create a `.env` file inside the `backend/` directory:

```bash
# On Linux / macOS
cp backend/.env.example backend/.env

# On Windows PowerShell
copy backend\.env.example backend\.env
```

Open `backend/.env` in your code editor and fill in your values:

```env
# Server Port & Mode
PORT=8000
NODE_ENV=development

# MongoDB Atlas Connection URI
# Replace with your Atlas connection string (or leave empty to run in offline in-memory mode):
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/student_hub?retryWrites=true&w=majority

# JWT Token Secret (use any secure string)
JWT_SECRET=studentpro_super_secure_jwt_secret_key_2026

# Nodemailer Gmail SMTP Configuration
# Generate a 16-character App Password at: https://myaccount.google.com/apppasswords
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your_email@gmail.com
SMTP_PASS=xxxx xxxx xxxx xxxx
SMTP_FROM_NAME="StudentPro Academic Portal"
SMTP_FROM_EMAIL=your_email@gmail.com

# Client Origin
FRONTEND_URL=http://localhost:8000
```

> **Note on Gmail SMTP:** Do NOT use your regular Google account password. Go to Google Account > Security > 2-Step Verification > App Passwords, generate a 16-character password for "Mail", and paste it into `SMTP_PASS`.

---

### 3. Install Dependencies & Run

#### Option A: Running from Root (Convenience Script)
```bash
# Install backend dependencies
npm run install:backend

# Start the application
npm start
```

#### Option B: Running from the `backend/` Folder Directly
```bash
cd backend
npm install
npm start
```

For live reloading during development:
```bash
npm run dev
```

Open your browser and navigate to:
```
http://localhost:8000
```

---

### Demo Accounts

The database auto-seeds default demo credentials on first startup:

| Role | Email | Password | Features Accessible |
|---|---|---|---|
| **Student** | `student@gmail.com` | `password123` | Dashboard, 12 Mock Tests, Practice Papers, Mind Gym, Progress Tracker |
| **Teacher** | `teacher@gmail.com` | `password123` | Stream Directory (CS/IT/ECE/Mech/Civil), Student Scorecards, Send PDF Email |

---

## Docker Deployment

The repository includes an optimized multi-stage `Dockerfile` based on `node:20-alpine`.

### Build Docker Image

From the project root:

```bash
docker build -t studentpro:latest .
```

### Run Docker Container

```bash
# Using environment variables directly:
docker run -d \
  --name studentpro_app \
  -p 8000:8000 \
  -e PORT=8000 \
  -e NODE_ENV=production \
  -e MONGODB_URI="mongodb+srv://<user>:<pass>@cluster0.mongodb.net/student_hub" \
  -e JWT_SECRET="your_production_secret" \
  -e SMTP_USER="your_email@gmail.com" \
  -e SMTP_PASS="your_gmail_app_password" \
  -e SMTP_FROM_EMAIL="your_email@gmail.com" \
  studentpro:latest

# Or using an env file:
docker run -d --name studentpro_app -p 8000:8000 --env-file backend/.env studentpro:latest
```

Access the containerized app at `http://localhost:8000`.

---

## Render Cloud Deployment Guide

[Render](https://render.com) is the recommended deployment platform. It can deploy StudentPro as a **Docker Web Service** or as a **Native Node Service**.

---

### Method 1: Docker Web Service (Recommended)

1. **Push your code to GitHub**:
   ```bash
   git add .
   git commit -m "feat: complete studentpro deployment setup"
   git push origin main
   ```
2. **Log into [Render Dashboard](https://dashboard.render.com/)**.
3. Click **New +** > **Web Service**.
4. Select **Build and deploy from a Git repository** and connect your GitHub repo.
5. In the service setup form:
   - **Name:** `studentpro` (or any chosen name)
   - **Region:** Choose the region closest to you (e.g., Singapore, Frankfurt, Oregon)
   - **Branch:** `main`
   - **Runtime:** Select **Docker**
   - **Dockerfile Path:** `./Dockerfile`
   - **Instance Type:** Free (or Starter)
6. Scroll down to **Environment Variables** and add:
   - `PORT`: `8000`
   - `NODE_ENV`: `production`
   - `MONGODB_URI`: *Your MongoDB Atlas connection URI*
   - `JWT_SECRET`: *A secure random string*
   - `SMTP_USER`: *Your Gmail address*
   - `SMTP_PASS`: *Your 16-character Gmail App Password*
   - `SMTP_FROM_EMAIL`: *Your Gmail address*
7. Click **Create Web Service**. Render will automatically build the Docker container and deploy the app.

---

### Method 2: Render Blueprint (render.yaml)

The repository includes a ready-to-use `render.yaml` specification:

1. In Render Dashboard, click **New +** > **Blueprint**.
2. Select your connected repository.
3. Render reads `render.yaml` automatically and configures the web service, ports, and health checks.
4. Fill in the prompted secret variables (`MONGODB_URI`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM_EMAIL`).
5. Click **Apply**.

---

### Method 3: Native Node.js Web Service

If you prefer deploying without Docker:

1. Click **New +** > **Web Service**.
2. Connect your repo and set:
   - **Runtime:** `Node`
   - **Build Command:** `cd backend && npm install`
   - **Start Command:** `cd backend && npm start`
3. Add the environment variables specified below.
4. Click **Create Web Service**.

---

### Required Render Environment Variables

| Variable Name | Required | Example / Description |
|---|---|---|
| `PORT` | Yes | `8000` (Render will bind its external router to this port) |
| `NODE_ENV` | Yes | `production` |
| `MONGODB_URI` | Recommended | `mongodb+srv://user:pass@cluster0.mongodb.net/student_hub` |
| `JWT_SECRET` | Yes | Secure random string (e.g. `prod_secret_studentpro_2026`) |
| `SMTP_HOST` | Optional | `smtp.gmail.com` (defaults to gmail) |
| `SMTP_PORT` | Optional | `587` |
| `SMTP_USER` | For Emails | `your_email@gmail.com` |
| `SMTP_PASS` | For Emails | 16-character Google App Password (`xxxx xxxx xxxx xxxx`) |
| `SMTP_FROM_NAME` | Optional | `StudentPro Academic Portal` |
| `SMTP_FROM_EMAIL` | For Emails | `your_email@gmail.com` |

---

### Render Deployment CLI Commands

You can also deploy directly using the [Render CLI](https://render.com/docs/cli):

```bash
# 1. Install Render CLI
npm install -g @render/cli

# 2. Authenticate
render login

# 3. Deploy Blueprint
render blueprints launch

# Or trigger manual deploy on an existing service:
render deploys create <service-id>
```

---

## REST API Endpoints

### Health Check
- `GET /api/health` — Verifies API uptime, node version, and system status.

### Authentication
- `POST /api/auth/register` — Register a student or teacher account.
- `POST /api/auth/login` — Login and receive JWT access token.
- `GET /api/auth/me` — Retrieve authenticated user profile (Bearer Token).

### Mock Tests & Question Banks
- `GET /api/tests/subjects` — List all 12 available test tracks.
- `GET /api/tests/subjects/:subject` — Get sanitized questions for a subject.
- `POST /api/tests/submit` — Submit test answers, compute score, and log history.
- `GET /api/tests/history` — Get student's completed test history.

### Study Hours Tracking
- `POST /api/study/log` — Record a completed study session in minutes.
- `GET /api/study/analytics` — Get weekly breakdown and chart data.

### Teacher Management
- `GET /api/teacher/streams` — Get student counts by department stream.
- `GET /api/teacher/streams/:streamName/students` — List students in a stream.
- `GET /api/teacher/students/:studentId/progress` — Drill down into student records.

### Official Reports & SMTP Dispatch
- `GET /api/reports/download-pdf?studentId=...` — Generate and stream A4 PDF.
- `POST /api/reports/send-email` — Dispatch PDF report to student and parent emails.

---

## Contributing & License

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

Distributed under the **ISC License**. See `LICENSE` for more information.
