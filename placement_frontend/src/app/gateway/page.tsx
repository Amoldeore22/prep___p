"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  GraduationCap,
  Building2,
  BookOpen,
  Brain,
  Code2,
  FileText,
  Target,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  LogOut,
  User,
} from "lucide-react";

export default function PostLoginGatewayPage() {
  const router = useRouter();
  const [user, setUser] = useState<{
    name: string;
    email: string;
    branch?: string;
    department?: string;
    cgpa?: number;
    graduationYear?: number;
  } | null>(null);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (data.user) setUser(data.user);
      })
      .catch(() => {});
  }, []);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      window.location.href = "/";
    } catch {
      window.location.href = "/";
    }
  };

  return (
    <div className="min-h-screen bg-[#121316] text-[#FFFFFF] flex flex-col">
      {/* Top Header Bar */}
      <header className="h-16 bg-[#161719]/90 backdrop-blur-md border-b border-[#2C2E33] px-6 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#FF5722] via-[#F15A24] to-[#ea580c] flex items-center justify-center shadow-lg shadow-[#FF5722]/25">
            <GraduationCap className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-base font-bold text-white tracking-tight leading-tight">
              PrepPilot
            </h1>
            <span className="text-[10px] font-semibold text-[#FF5722] uppercase tracking-wider block">
              Placement Command Center
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {user && (
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <div className="text-xs font-semibold text-white">{user.name}</div>
                <div className="text-[11px] text-[#9CA3AF]">
                  {user.branch || user.department || "Student Portal"} • CGPA: {user.cgpa || 8.85}
                </div>
              </div>
              <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#FF5722] to-[#F15A24] border border-[#FF5722]/30 flex items-center justify-center text-white font-bold text-xs shadow-md shadow-[#FF5722]/25">
                {user.name.charAt(0).toUpperCase()}
              </div>
            </div>
          )}

          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-zinc-400 hover:text-red-400 hover:bg-red-500/10 transition border border-[#2C2E33]"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Sign Out</span>
          </button>
        </div>
      </header>

      {/* Main Gateway Content */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-4 sm:p-6 md:p-10 flex flex-col justify-center space-y-8 my-auto">
        {/* Welcome Section */}
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <p className="text-sm font-medium text-[#FF5722]">
            Welcome To Your Placement Portal
          </p>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
            Choose Your Workspace
          </h2>
          <p className="text-sm text-[#9CA3AF] leading-relaxed">
            Welcome, <strong className="text-white">{user?.name || "Student"}</strong>. Select how you would like to proceed with your campus placement journey today.
          </p>
        </div>

        {/* Two Prominent Selection Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 items-stretch">
          {/* Card 1: Preparation Workspace */}
          <div className="group relative rounded-3xl border border-[#2C2E33] hover:border-[#FF5722]/60 bg-gradient-to-b from-[#1A1B1E] to-[#161719] p-7 sm:p-8 flex flex-col justify-between shadow-2xl transition-all duration-300 hover:shadow-[#FF5722]/10 hover:-translate-y-1">
            <div className="space-y-6">
              {/* Card Badge & Icon */}
              <div className="flex items-center justify-between">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#FF5722] via-[#F15A24] to-[#ea580c] flex items-center justify-center text-white shadow-xl shadow-[#FF5722]/25 group-hover:scale-105 transition-transform">
                  <GraduationCap className="w-7 h-7" />
                </div>
                <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-[#FF5722]/15 text-[#FF5722] border border-[#FF5722]/30 uppercase tracking-wider">
                  Self-Paced Learning
                </span>
              </div>

              {/* Title & Description */}
              <div className="space-y-2">
                <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight group-hover:text-[#FF5722] transition-colors">
                  Preparation Workspace
                </h3>
                <p className="text-xs sm:text-sm text-[#9CA3AF] leading-relaxed">
                  Master core computer science topics, strengthen coding patterns, and practice aptitude drills with the full suite of study modules.
                </p>
              </div>

              {/* Feature Highlights */}
              <div className="space-y-2.5 pt-2 border-t border-[#2C2E33]/60">
                <div className="flex items-start gap-3 text-xs text-zinc-300">
                  <BookOpen className="w-4 h-4 text-[#FF5722] shrink-0 mt-0.5" />
                  <span><strong>Prep Hub:</strong> C++, OOPS, DBMS, and SQL topic video masterclasses</span>
                </div>
                <div className="flex items-start gap-3 text-xs text-zinc-300">
                  <Brain className="w-4 h-4 text-[#FF5722] shrink-0 mt-0.5" />
                  <span><strong>Practice Hub:</strong> Daily 10-Q timed quiz, analytics, and aptitude practice</span>
                </div>
                <div className="flex items-start gap-3 text-xs text-zinc-300">
                  <Code2 className="w-4 h-4 text-[#FF5722] shrink-0 mt-0.5" />
                  <span><strong>DSA Workbook:</strong> 14+ high-frequency interview coding patterns</span>
                </div>
                <div className="flex items-start gap-3 text-xs text-zinc-300">
                  <FileText className="w-4 h-4 text-[#FF5722] shrink-0 mt-0.5" />
                  <span><strong>Interview Hub & Notes:</strong> Real senior experiences and personalized revision notes</span>
                </div>
              </div>
            </div>

            {/* CTA Button */}
            <div className="pt-6 mt-6 border-t border-[#2C2E33]">
              <Link
                href="/dashboard"
                className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-[#FF5722] to-[#F15A24] hover:from-[#ea580c] hover:to-[#c2410c] text-white text-sm font-bold shadow-lg shadow-[#FF5722]/25 hover:shadow-xl hover:shadow-[#FF5722]/35 transition-all flex items-center justify-center gap-2 group-hover:gap-3"
              >
                <span>Enter Preparation Workspace</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          </div>

          {/* Card 2: Company Placement Pipeline */}
          <div className="group relative rounded-3xl border border-[#2C2E33] hover:border-blue-500/60 bg-gradient-to-b from-[#1A1B1E] to-[#161719] p-7 sm:p-8 flex flex-col justify-between shadow-2xl transition-all duration-300 hover:shadow-blue-500/10 hover:-translate-y-1">
            <div className="space-y-6">
              {/* Card Badge & Icon */}
              <div className="flex items-center justify-between">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 via-blue-500 to-indigo-600 flex items-center justify-center text-white shadow-xl shadow-blue-500/25 group-hover:scale-105 transition-transform">
                  <Building2 className="w-7 h-7" />
                </div>
                <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-blue-500/15 text-blue-400 border border-blue-500/30 uppercase tracking-wider">
                  3-Step Guided Track
                </span>
              </div>

              {/* Title & Description */}
              <div className="space-y-2">
                <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight group-hover:text-blue-400 transition-colors">
                  Company Placement Pipeline
                </h3>
                <p className="text-xs sm:text-sm text-[#9CA3AF] leading-relaxed">
                  Target specific campus recruiters, inspect detailed hiring tracks and salary packages, and run automated live eligibility checks.
                </p>
              </div>

              {/* Feature Highlights */}
              <div className="space-y-2.5 pt-2 border-t border-[#2C2E33]/60">
                <div className="flex items-start gap-3 text-xs text-zinc-300">
                  <Building2 className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                  <span><strong>Step 1 (Companies):</strong> Filter TCS, Infosys, Amazon, Accenture, Cognizant, etc.</span>
                </div>
                <div className="flex items-start gap-3 text-xs text-zinc-300">
                  <Target className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                  <span><strong>Step 2 (Job Roles):</strong> Compare Ninja, Digital, Prime, SDE, and specialized tracks</span>
                </div>
                <div className="flex items-start gap-3 text-xs text-zinc-300">
                  <ShieldCheck className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                  <span><strong>Step 3 (Eligibility Check):</strong> Automated live evaluation of CGPA, Backlogs, Branch & 10th/12th</span>
                </div>
                <div className="flex items-start gap-3 text-xs text-zinc-300">
                  <Sparkles className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                  <span><strong>Target Goal Locking:</strong> Set dream company goals and unlock custom interview roadmaps</span>
                </div>
              </div>
            </div>

            {/* CTA Button */}
            <div className="pt-6 mt-6 border-t border-[#2C2E33]">
              <Link
                href="/pipeline/companies"
                className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-sm font-bold shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/35 transition-all flex items-center justify-center gap-2 group-hover:gap-3"
              >
                <span>Launch Placement Pipeline</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          </div>
        </div>


      </main>
    </div>
  );
}
