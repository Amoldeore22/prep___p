"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import StudentSidebar from "@/components/layout/StudentSidebar";
import StudentNavbar from "@/components/layout/StudentNavbar";
import {
  Code2,
  CalendarCheck,
  Brain,
  Building2,
  FileText,
  TrendingUp,
  ArrowRight,
  CheckCircle2,
  Clock,
  Award,
} from "lucide-react";

export default function StudentDashboardPage() {
  const [analytics, setAnalytics] = useState<any>(null);
  const [dailyQuizInfo, setDailyQuizInfo] = useState<any>(null);
  const [upcomingCompanies, setUpcomingCompanies] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/analytics/student").then((r) => r.json()),
      fetch("/api/aptitude/daily").then((r) => r.json()),
      fetch("/api/companies/requirements").then((r) => r.json()),
    ])
      .then(([analyticsData, quizData, companiesData]) => {
        setAnalytics(analyticsData);
        setDailyQuizInfo(quizData);
        if (companiesData.requirements) {
          setUpcomingCompanies(companiesData.requirements.slice(0, 3));
        }
        setIsLoading(false);
      })
      .catch((err) => {
        console.error("Dashboard data error:", err);
        setIsLoading(false);
      });
  }, []);

  return (
    <div className="flex min-h-screen bg-[#121316] text-[#FFFFFF]">
      <StudentSidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <StudentNavbar title="Student Dashboard" />

        <main className="p-6 md:p-8 space-y-8 flex-1 overflow-y-auto max-w-7xl w-full mx-auto">
          {/* Welcome Banner */}
          <div className="relative overflow-hidden rounded-3xl p-8 bg-gradient-to-r from-[#1A1B1E] via-[#202226] to-[#1A1B1E] border border-[#2C2E33] shadow-2xl">
            <div className="relative z-10 space-y-3 max-w-2xl">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Welcome to your Prep Hub
              </h2>
              <p className="text-sm text-[#9CA3AF] leading-relaxed">
                Consistent pattern solving and daily aptitude quizzes build unbeatable placement confidence. Track your progress across 15 DSA patterns and top tier campus drives.
              </p>
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <Link
                  href="/aptitude/daily"
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#FF5722] to-[#F15A24] hover:from-[#F15A24] hover:to-[#ea580c] text-white font-bold text-xs shadow-lg shadow-[#FF5722]/25 transition flex items-center gap-1.5"
                >
                  <CalendarCheck className="w-4 h-4" />
                  <span>Take Today's Quiz</span>
                </Link>
                <Link
                  href="/dsa"
                  className="px-4 py-2 rounded-xl bg-[#202226] hover:bg-[#2C2E33] text-white font-bold text-xs border border-[#2C2E33] transition flex items-center gap-1.5"
                >
                  <Code2 className="w-4 h-4 text-[#FF5722]" />
                  <span>Browse DSA Patterns</span>
                </Link>
              </div>
            </div>
          </div>

          {/* Core Metrics Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {/* 1. DSA Problems Solved */}
            <div className="bg-[#1A1B1E] p-5 rounded-2xl border border-[#2C2E33] space-y-3">
              <div className="flex items-center justify-between text-[#9CA3AF]">
                <span className="text-xs font-semibold uppercase tracking-wider">DSA Solved</span>
                <div className="w-8 h-8 rounded-lg bg-[#FF5722]/10 border border-[#FF5722]/20 flex items-center justify-center text-[#FF5722]">
                  <Code2 className="w-4 h-4" />
                </div>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-white">
                  {analytics?.dsa?.solvedCount ?? 0}
                </span>
                <span className="text-xs text-[#9CA3AF]">
                  / {analytics?.dsa?.totalProblems ?? 189} total
                </span>
              </div>
              <div className="w-full bg-[#202226] h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-gradient-to-r from-[#FF5722] to-[#F15A24] h-full rounded-full transition-all duration-500"
                  style={{ width: `${analytics?.dsa?.overallCompletion ?? 0}%` }}
                />
              </div>
              <div className="text-[11px] text-[#9CA3AF] flex items-center justify-between">
                <span>{analytics?.dsa?.overallCompletion ?? 0}% completed</span>
                <span>{analytics?.dsa?.attemptedCount ?? 0} attempted</span>
              </div>
            </div>

            {/* 2. Today's Quiz Status */}
            <div className="bg-[#1A1B1E] p-5 rounded-2xl border border-[#2C2E33] space-y-3">
              <div className="flex items-center justify-between text-[#9CA3AF]">
                <span className="text-xs font-semibold uppercase tracking-wider">Daily Quiz</span>
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                  <CalendarCheck className="w-4 h-4" />
                </div>
              </div>
              <div className="flex items-baseline gap-2">
                {dailyQuizInfo?.hasCompleted ? (
                  <span className="text-3xl font-extrabold text-emerald-400">
                    {dailyQuizInfo.attempt?.score ?? 0} / 10
                  </span>
                ) : (
                  <span className="text-xl font-bold text-amber-400">Pending</span>
                )}
              </div>
              <p className="text-xs text-[#9CA3AF]">
                {dailyQuizInfo?.hasCompleted
                  ? `Completed with ${dailyQuizInfo.attempt?.accuracy ?? 0}% accuracy`
                  : "Today's 10 questions ready for attempt"}
              </p>
              <Link
                href="/aptitude/daily"
                className="text-xs font-semibold text-[#FF5722] hover:text-[#F15A24] inline-flex items-center gap-1 pt-1"
              >
                <span>{dailyQuizInfo?.hasCompleted ? "Review Results" : "Start Test Now"}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* 3. Aptitude Avg Accuracy */}
            <div className="bg-[#1A1B1E] p-5 rounded-2xl border border-[#2C2E33] space-y-3">
              <div className="flex items-center justify-between text-[#9CA3AF]">
                <span className="text-xs font-semibold uppercase tracking-wider">Avg Accuracy</span>
                <div className="w-8 h-8 rounded-lg bg-[#FF5722]/10 border border-[#FF5722]/20 flex items-center justify-center text-[#FF5722]">
                  <TrendingUp className="w-4 h-4" />
                </div>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-white">
                  {analytics?.aptitude?.avgAccuracy ?? 0}%
                </span>
                <span className="text-xs text-[#9CA3AF]">
                  across {analytics?.aptitude?.totalQuizzesTaken ?? 0} quizzes
                </span>
              </div>
              <p className="text-xs text-[#9CA3AF]">
                Avg Score: {analytics?.aptitude?.avgScore ?? 0} / 10
              </p>
              <Link
                href="/progress"
                className="text-xs font-semibold text-[#FF5722] hover:text-[#F15A24] inline-flex items-center gap-1 pt-1"
              >
                <span>View Performance Graph</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* 4. Active Drives */}
            <div className="bg-[#1A1B1E] p-5 rounded-2xl border border-[#2C2E33] space-y-3">
              <div className="flex items-center justify-between text-[#9CA3AF]">
                <span className="text-xs font-semibold uppercase tracking-wider">Campus Openings</span>
                <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                  <Building2 className="w-4 h-4" />
                </div>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-white">
                  {upcomingCompanies.length}
                </span>
                <span className="text-xs text-[#9CA3AF]">Verified Companies</span>
              </div>
              <p className="text-xs text-[#9CA3AF]">Top tech roles currently open</p>
              <Link
                href="/companies"
                className="text-xs font-semibold text-[#FF5722] hover:text-[#F15A24] inline-flex items-center gap-1 pt-1"
              >
                <span>Explore Eligibility & Apply</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Two-Column Content Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left 2 Cols: DSA Pattern Highlights */}
            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-white">DSA Pattern Progress</h3>
                  <p className="text-xs text-[#9CA3AF]">15 Patterns from your cheat sheet</p>
                </div>
                <Link
                  href="/dsa"
                  className="text-xs font-semibold text-[#FF5722] hover:text-[#F15A24] flex items-center gap-1"
                >
                  <span>View All 15 Patterns</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {analytics?.dsa?.patternProgress?.slice(0, 6).map((pat: any) => (
                  <Link
                    key={pat.id}
                    href={`/dsa/${pat.slug}`}
                    className="bg-[#1A1B1E] p-4 rounded-xl border border-[#2C2E33] hover:border-[#FF5722]/40 transition group space-y-2.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-white text-sm group-hover:text-[#FF5722] transition">
                        {pat.name}
                      </span>
                      <span className="text-xs font-bold text-[#9CA3AF] font-mono">
                        {pat.solved} / {pat.total}
                      </span>
                    </div>
                    <div className="w-full bg-[#202226] h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-[#FF5722] to-[#F15A24] h-full rounded-full transition-all"
                        style={{ width: `${pat.percent}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-[#9CA3AF]">
                      <span>{pat.percent}% completed</span>
                      <span className="text-[#FF5722] group-hover:underline">Open Pattern &rarr;</span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Right 1 Col: Top Upcoming Companies */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-white">Latest Company Drives</h3>
                  <p className="text-xs text-[#9CA3AF]">Official college recruitment</p>
                </div>
                <Link
                  href="/companies"
                  className="text-xs font-semibold text-[#FF5722] hover:text-[#F15A24] flex items-center gap-1"
                >
                  <span>All Companies</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              <div className="space-y-3">
                {upcomingCompanies.map((comp) => (
                  <div
                    key={comp.id}
                    className="bg-[#1A1B1E] p-4 rounded-xl border border-[#2C2E33] space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white text-sm">{comp.companyName}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 font-semibold border border-emerald-500/30">
                        {comp.salaryPackage || "Verified"}
                      </span>
                    </div>
                    <div className="text-xs text-[#A1A1AA] font-medium">{comp.jobTitle}</div>
                    <div className="text-[11px] text-[#9CA3AF] flex items-center justify-between pt-1">
                      <span>Min CGPA: {comp.minCgpa ?? "N/A"}</span>
                      <span>Batch: {comp.graduationYear}</span>
                    </div>
                    <a
                      href={comp.officialApplyUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block text-center w-full py-1.5 rounded-lg bg-[#202226] hover:bg-[#2C2E33] text-xs text-white font-semibold transition mt-2 border border-[#2C2E33]"
                    >
                      Apply Officially &rarr;
                    </a>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
