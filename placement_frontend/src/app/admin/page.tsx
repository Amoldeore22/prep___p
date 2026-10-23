"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import AdminSidebar from "@/components/layout/AdminSidebar";
import AdminNavbar from "@/components/layout/AdminNavbar";
import {
  Users,
  Code2,
  CalendarCheck,
  Building,
  FileCheck,
  TrendingUp,
  ArrowRight,
  AlertCircle,
} from "lucide-react";

export default function AdminDashboardPage() {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    fetch("/api/admin/analytics")
      .then((r) => r.json())
      .then((d) => {
        setData(d);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error("Admin analytics error:", err);
        setIsLoading(false);
      });
  }, []);

  const stats = data?.stats || {};
  const recentActivity = data?.recentActivity || [];

  return (
    <div className="flex min-h-screen bg-[#121316] text-zinc-100">
      <AdminSidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <AdminNavbar title="Placement Control Center" />

        <main className="p-6 md:p-8 space-y-8 flex-1 overflow-y-auto max-w-7xl w-full mx-auto">
          {/* Welcome Banner */}
          <div className="rounded-3xl p-8 bg-[#1A1B1E] border border-[#2C2E33] shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Placement Cell Administration
              </h2>
              <p className="text-xs text-zinc-400 max-w-2xl leading-relaxed">
                Monitor student activity telemetry, import workbook DSA patterns, manage daily 10-question aptitude quizzes, and publish verified company recruitment drives.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Link
                href="/admin/companies"
                className="px-4 py-2.5 rounded-xl bg-[#202226] hover:bg-[#2C2E33] text-zinc-200 font-bold text-xs border border-[#2C2E33] transition"
              >
                Manage Companies
              </Link>
            </div>
          </div>

          {/* Core Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {/* 1. Total Registered Students */}
            <div className="glass-panel p-5 rounded-2xl border border-[#2C2E33] bg-[#1A1B1E] space-y-2">
              <div className="flex items-center justify-between text-zinc-400">
                <span className="text-xs font-semibold uppercase tracking-wider">Registered Students</span>
                <Users className="w-4 h-4 text-rose-400" />
              </div>
              <div className="text-3xl font-extrabold text-white">
                {stats.totalStudents ?? 0}
              </div>
              <p className="text-[11px] text-zinc-400">
                Active Solvers: <strong className="text-emerald-400">{stats.activeStudents ?? 0}</strong>
              </p>
              <Link
                href="/admin/students"
                className="text-xs font-semibold text-rose-400 hover:text-rose-300 inline-flex items-center gap-1 pt-1"
              >
                <span>Browse Student Directory</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* 2. DSA Solved Events */}
            <div className="glass-panel p-5 rounded-2xl border border-[#2C2E33] bg-[#1A1B1E] space-y-2">
              <div className="flex items-center justify-between text-zinc-400">
                <span className="text-xs font-semibold uppercase tracking-wider">DSA Solved Events</span>
                <Code2 className="w-4 h-4 text-[#FF5722]" />
              </div>
              <div className="text-3xl font-extrabold text-white">
                {stats.totalSolvedEvents ?? 0}
              </div>
              <p className="text-[11px] text-zinc-400">
                Across {stats.totalProblems ?? 189} workbook problems
              </p>
              <Link
                href="/admin/dsa/problems"
                className="text-xs font-semibold text-[#FF5722] hover:text-[#ff784e] inline-flex items-center gap-1 pt-1"
              >
                <span>Manage Problem Bank</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* 3. Daily Quiz Participation */}
            <div className="glass-panel p-5 rounded-2xl border border-[#2C2E33] bg-[#1A1B1E] space-y-2">
              <div className="flex items-center justify-between text-zinc-400">
                <span className="text-xs font-semibold uppercase tracking-wider">Quiz Attempts</span>
                <CalendarCheck className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="text-3xl font-extrabold text-white">
                {stats.totalQuizAttempts ?? 0}
              </div>
              <p className="text-[11px] text-zinc-400">
                Avg Accuracy: <strong className="text-emerald-400">{stats.avgQuizAccuracy ?? 0}%</strong>
              </p>
              <Link
                href="/admin/aptitude/questions"
                className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 inline-flex items-center gap-1 pt-1"
              >
                <span>Aptitude Bank</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* 4. Pending Moderation */}
            <div className="glass-panel p-5 rounded-2xl border border-[#2C2E33] bg-[#1A1B1E] space-y-2">
              <div className="flex items-center justify-between text-zinc-400">
                <span className="text-xs font-semibold uppercase tracking-wider">Pending Stories</span>
                <FileCheck className="w-4 h-4 text-amber-400" />
              </div>
              <div className="text-3xl font-extrabold text-white">
                {stats.pendingInterviews ?? 0}
              </div>
              <p className="text-[11px] text-zinc-400">
                Published Drives: <strong className="text-white">{stats.publishedCompanies ?? 0}</strong>
              </p>
              <Link
                href="/admin/interviews/submissions"
                className="text-xs font-semibold text-amber-400 hover:text-amber-300 inline-flex items-center gap-1 pt-1"
              >
                <span>Review Moderation Queue</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Quick Shortcuts & Recent Activity Feed */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left 2 Cols: Activity Feed */}
            <div className="lg:col-span-2 glass-panel p-6 rounded-2xl border border-[#2C2E33] bg-[#1A1B1E] space-y-4">
              <h3 className="text-base font-bold text-white">Recent Student Telemetry & Submissions</h3>
              {recentActivity.length === 0 ? (
                <div className="py-8 text-center text-xs text-zinc-500">
                  No student activity recorded yet.
                </div>
              ) : (
                <div className="divide-y divide-[#2C2E33] text-xs">
                  {recentActivity.map((event: any) => (
                    <div key={event.id} className="py-3 flex items-center justify-between">
                      <div className="space-y-0.5">
                        <span className="font-semibold text-white">
                          {event.user?.name || "Student"} ({event.user?.department || "CSE"})
                        </span>
                        <div className="text-zinc-400 text-[11px]">
                          Action: <strong className="text-[#FF5722]">{event.type}</strong>
                        </div>
                      </div>
                      <span className="text-[11px] text-zinc-500">
                        {new Date(event.createdAt).toLocaleTimeString()}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Right 1 Col: Quick Links Card */}
            <div className="glass-panel p-6 rounded-2xl border border-[#2C2E33] bg-[#1A1B1E] space-y-3">
              <h3 className="text-base font-bold text-white">Administrative Actions</h3>
              <div className="space-y-2">
                <Link
                  href="/admin/dsa/import"
                  className="w-full p-3 rounded-xl bg-[#202226] hover:bg-[#282a30] border border-[#2C2E33] flex items-center justify-between text-xs font-semibold text-white transition"
                >
                  <span>Re-import Workbook DSA</span>
                  <ArrowRight className="w-3.5 h-3.5 text-zinc-400" />
                </Link>
                <Link
                  href="/admin/aptitude/questions"
                  className="w-full p-3 rounded-xl bg-[#202226] hover:bg-[#282a30] border border-[#2C2E33] flex items-center justify-between text-xs font-semibold text-white transition"
                >
                  <span>Add Aptitude Questions</span>
                  <ArrowRight className="w-3.5 h-3.5 text-zinc-400" />
                </Link>
                <Link
                  href="/admin/interviews/videos"
                  className="w-full p-3 rounded-xl bg-[#202226] hover:bg-[#282a30] border border-[#2C2E33] flex items-center justify-between text-xs font-semibold text-white transition"
                >
                  <span>Upload Interview Videos</span>
                  <ArrowRight className="w-3.5 h-3.5 text-zinc-400" />
                </Link>
                <Link
                  href="/admin/audit-logs"
                  className="w-full p-3 rounded-xl bg-[#202226] hover:bg-[#282a30] border border-[#2C2E33] flex items-center justify-between text-xs font-semibold text-white transition"
                >
                  <span>Audit Trail</span>
                  <ArrowRight className="w-3.5 h-3.5 text-zinc-400" />
                </Link>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
