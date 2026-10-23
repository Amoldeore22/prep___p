import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import multer from "multer";
import dotenv from "dotenv";
import path from "path";

// Load environment variables from .env
dotenv.config();

import { adaptRoute } from "@/lib/http";

// Route modules
import * as authLogin from "@/api/auth/login/route";
import * as authRegister from "@/api/auth/register/route";
import * as authLogout from "@/api/auth/logout/route";
import * as authMe from "@/api/auth/me/route";
import * as authForgotPassword from "@/api/auth/forgot-password/route";
import * as authResetPassword from "@/api/auth/reset-password/route";

import * as analyticsStudent from "@/api/analytics/student/route";

import * as aptitudeDaily from "@/api/aptitude/daily/route";
import * as aptitudeDailySubmit from "@/api/aptitude/daily/submit/route";
import * as aptitudePractice from "@/api/aptitude/practice/route";

import * as companiesReq from "@/api/companies/requirements/route";

import * as dsaPatterns from "@/api/dsa/patterns/route";
import * as dsaPatternBySlug from "@/api/dsa/patterns/[slug]/route";
import * as dsaProblemStatus from "@/api/dsa/problems/[id]/status/route";

import * as interviewsVideos from "@/api/interviews/videos/route";
import * as interviewsExperiences from "@/api/interviews/experiences/route";
import * as interviewsSubmissions from "@/api/interviews/submissions/route";

import * as notesRoute from "@/api/notes/route";
import * as notesByIdRoute from "@/api/notes/[id]/route";

import * as prephubVideos from "@/api/prephub/videos/route";

import * as adminAnalytics from "@/api/admin/analytics/route";
import * as adminDailyQuiz from "@/api/admin/aptitude/daily-quiz/route";
import * as adminQuestions from "@/api/admin/aptitude/questions/route";
import * as adminQuestionById from "@/api/admin/aptitude/questions/[id]/route";
import * as adminUpload from "@/api/admin/aptitude/upload/route";
import * as adminAuditLogs from "@/api/admin/audit-logs/route";
import * as adminCompanies from "@/api/admin/companies/route";
import * as adminCompanyReqById from "@/api/admin/companies/requirements/[id]/route";
import * as adminDsaImport from "@/api/admin/dsa/import/route";
import * as adminDsaPatterns from "@/api/admin/dsa/patterns/route";
import * as adminDsaPatternById from "@/api/admin/dsa/patterns/[id]/route";
import * as adminDsaProblems from "@/api/admin/dsa/problems/route";
import * as adminInterviewSubmissions from "@/api/admin/interviews/submissions/route";
import * as adminInterviewModerate from "@/api/admin/interviews/submissions/[id]/moderate/route";
import * as adminInterviewVideos from "@/api/admin/interviews/videos/route";
import * as adminInterviewVideoById from "@/api/admin/interviews/videos/[id]/route";
import * as adminStudents from "@/api/admin/students/route";
import * as adminStudentById from "@/api/admin/students/[id]/route";
import * as adminUsers from "@/api/admin/users/route";

const app = express();
const PORT = process.env.PORT || 5000;
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:3000";

// Multer memory storage for uploads
const upload = multer({ storage: multer.memoryStorage() });

// Middleware
app.use(
  cors({
    origin: [
      FRONTEND_URL,
      "http://localhost:3000",
      "http://127.0.0.1:3000",
      "http://localhost:3001",
    ],
    credentials: true,
  })
);
app.use(cookieParser());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Auth Routes
app.all("/api/auth/login", adaptRoute(authLogin));
app.all("/api/auth/register", adaptRoute(authRegister));
app.all("/api/auth/logout", adaptRoute(authLogout));
app.all("/api/auth/me", adaptRoute(authMe));
app.all("/api/auth/forgot-password", adaptRoute(authForgotPassword));
app.all("/api/auth/reset-password", adaptRoute(authResetPassword));

// Analytics Routes
app.all("/api/analytics/student", adaptRoute(analyticsStudent));

// Aptitude Routes
app.all("/api/aptitude/daily/submit", adaptRoute(aptitudeDailySubmit));
app.all("/api/aptitude/daily", adaptRoute(aptitudeDaily));
app.all("/api/aptitude/practice", adaptRoute(aptitudePractice));

// Companies Routes
app.all("/api/companies/requirements", adaptRoute(companiesReq));

// DSA Routes
app.all("/api/dsa/patterns/:slug", adaptRoute(dsaPatternBySlug));
app.all("/api/dsa/patterns", adaptRoute(dsaPatterns));
app.all("/api/dsa/problems/:id/status", adaptRoute(dsaProblemStatus));

// Interviews Routes
app.all("/api/interviews/videos", adaptRoute(interviewsVideos));
app.all("/api/interviews/experiences", adaptRoute(interviewsExperiences));
app.all("/api/interviews/submissions", adaptRoute(interviewsSubmissions));

// Notes Routes
app.all("/api/notes/:id", adaptRoute(notesByIdRoute));
app.all("/api/notes", adaptRoute(notesRoute));

// PrepHub Routes
app.all("/api/prephub/videos", adaptRoute(prephubVideos));

// Admin Routes
app.all("/api/admin/analytics", adaptRoute(adminAnalytics));
app.all("/api/admin/aptitude/daily-quiz", adaptRoute(adminDailyQuiz));
app.all("/api/admin/aptitude/upload", upload.single("file"), adaptRoute(adminUpload));
app.all("/api/admin/aptitude/questions/:id", adaptRoute(adminQuestionById));
app.all("/api/admin/aptitude/questions", adaptRoute(adminQuestions));
app.all("/api/admin/audit-logs", adaptRoute(adminAuditLogs));
app.all("/api/admin/companies/requirements/:id", adaptRoute(adminCompanyReqById));
app.all("/api/admin/companies", adaptRoute(adminCompanies));
app.all("/api/admin/dsa/import", adaptRoute(adminDsaImport));
app.all("/api/admin/dsa/patterns/:id", adaptRoute(adminDsaPatternById));
app.all("/api/admin/dsa/patterns", adaptRoute(adminDsaPatterns));
app.all("/api/admin/dsa/problems", adaptRoute(adminDsaProblems));
app.all("/api/admin/interviews/submissions/:id/moderate", adaptRoute(adminInterviewModerate));
app.all("/api/admin/interviews/submissions", adaptRoute(adminInterviewSubmissions));
app.all("/api/admin/interviews/videos/:id", adaptRoute(adminInterviewVideoById));
app.all("/api/admin/interviews/videos", adaptRoute(adminInterviewVideos));
app.all("/api/admin/students/:id", adaptRoute(adminStudentById));
app.all("/api/admin/students", adaptRoute(adminStudents));
app.all("/api/admin/users", adaptRoute(adminUsers));

// Global Error Handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error("Unhandled Backend Server Error:", err);
  res.status(500).json({ error: "Internal Server Error", message: err?.message || String(err) });
});

app.listen(PORT, () => {
  console.log(`🚀 Placement Prep Backend Server running independently on http://localhost:${PORT}`);
});

export default app;
