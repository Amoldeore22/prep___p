import React from "react";
import Link from "next/link";
import {
  GraduationCap,
  Code2,
  CalendarCheck,
  Building2,
  ShieldAlert,
  ArrowRight,
} from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#121316] text-[#FFFFFF] flex flex-col font-sans">
      {/* Navigation Bar */}
      <header className="border-b border-[#2C2E33] bg-[#121316]/90 backdrop-blur-md sticky top-0 z-50 px-6 py-4 flex items-center justify-between max-w-7xl mx-auto w-full">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#FF5722] via-[#F15A24] to-[#ea580c] flex items-center justify-center shadow-lg shadow-[#FF5722]/25">
            <GraduationCap className="w-6 h-6 text-white" />
          </div>
          <div>
            <span className="text-xl font-bold tracking-tight text-white">PrepPilot</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="px-4 py-2 rounded-xl text-sm font-medium text-[#9CA3AF] hover:text-white hover:bg-[#202226] transition"
          >
            Student Sign In
          </Link>
          <Link
            href="/register"
            className="px-4 py-2 rounded-xl text-sm font-semibold bg-gradient-to-r from-[#FF5722] to-[#F15A24] hover:from-[#F15A24] hover:to-[#ea580c] text-white shadow-lg shadow-[#FF5722]/25 transition flex items-center gap-1.5"
          >
            <span>Create Account</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-16 flex flex-col items-center justify-center text-center">

        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight max-w-4xl leading-tight">
          Prepare smarter. <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF5722] via-[#F15A24] to-[#f97316]">
            Get placement-ready.
          </span>
        </h1>

        <p className="mt-6 text-lg text-[#9CA3AF] max-w-2xl leading-relaxed">
          Your personal placement workspace. Master all 15 workbook DSA patterns with step-by-step algorithm visualizers, take daily 10-question placement aptitude assessments, access verified company eligibility requirements, and study real peer interview breakdowns.
        </p>

        {/* Action Buttons */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/login"
            className="px-6 py-3.5 rounded-xl font-bold bg-gradient-to-r from-[#FF5722] to-[#F15A24] hover:from-[#F15A24] hover:to-[#ea580c] text-white text-base shadow-xl shadow-[#FF5722]/25 transition flex items-center gap-2"
          >
            <span>Student Dashboard</span>
            <ArrowRight className="w-5 h-5" />
          </Link>
          <Link
            href="/register"
            className="px-6 py-3.5 rounded-xl font-bold bg-[#1A1B1E] hover:bg-[#202226] text-white text-base border border-[#2C2E33] transition flex items-center gap-2"
          >
            <span>Sign Up as Student</span>
          </Link>
          <Link
            href="/login?role=admin"
            className="px-6 py-3.5 rounded-xl font-bold bg-[#1A1B1E] hover:bg-[#202226] text-[#A1A1AA] hover:text-white text-base border border-[#2C2E33] transition flex items-center gap-2"
          >
            <ShieldAlert className="w-5 h-5 text-amber-400" />
            <span>Admin Control Center</span>
          </Link>
        </div>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-20 w-full text-left">
          <div className="bg-[#1A1B1E] p-6 rounded-2xl border border-[#2C2E33] space-y-3 shadow-xl">
            <div className="w-12 h-12 rounded-xl bg-[#FF5722]/10 border border-[#FF5722]/20 flex items-center justify-center text-[#FF5722]">
              <Code2 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">DSA Pattern Academy</h3>
            <p className="text-sm text-[#9CA3AF] leading-relaxed">
              15 exact patterns and 189 questions directly imported from the official Excel cheat sheet with interactive visualizers (Two Pointers, Sliding Window, Kadane, Binary Search, and Stack).
            </p>
          </div>

          <div className="bg-[#1A1B1E] p-6 rounded-2xl border border-[#2C2E33] space-y-3 shadow-xl">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <CalendarCheck className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">Daily 10-Question Aptitude</h3>
            <p className="text-sm text-[#9CA3AF] leading-relaxed">
              Automated daily assessment with exactly 10 questions across Quantitative, Logical, Verbal, and Data Interpretation. Scored securely on the server with full explanations.
            </p>
          </div>

          <div className="bg-[#1A1B1E] p-6 rounded-2xl border border-[#2C2E33] space-y-3 shadow-xl">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Building2 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">Verified Company Drives</h3>
            <p className="text-sm text-[#9CA3AF] leading-relaxed">
              Real company eligibility criteria, minimum CGPA cutoffs, batch restrictions, selection round breakdowns, and direct official application links for recruiters.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

