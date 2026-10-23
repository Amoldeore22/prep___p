"use client";

import React, { useState, useEffect } from "react";
import StudentSidebar from "@/components/layout/StudentSidebar";
import StudentNavbar from "@/components/layout/StudentNavbar";
import {
  TrendingUp,
  Award,
  CheckCircle2,
  Clock,
  Layers,
  ExternalLink,
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  LineChart,
  Line,
  CartesianGrid,
  Cell,
} from "recharts";

export default function StudentProgressPage() {
  const [analytics, setAnalytics] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    fetch("/api/analytics/student")
      .then((r) => r.json())
      .then((d) => {
        setAnalytics(d);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error("Analytics fetch error:", err);
        setIsLoading(false);
      });
  }, []);

  if (isLoading) {
    return (
      <div className="flex min-h-screen bg-[#121316] text-zinc-100">
        <StudentSidebar />
        <div className="flex-1 flex flex-col">
          <StudentNavbar title="Placement Progress & Analytics" />
          <div className="p-8 flex items-center justify-center flex-1 text-zinc-400">
            Generating real-time analytics from database records...
          </div>
        </div>
      </div>
    );
  }

  const dsa = analytics?.dsa || {};
  const aptitude = analytics?.aptitude || {};

  // Data for difficulty bar chart
  const difficultyData = [
    {
      name: "Easy",
      solved: dsa.difficultyStats?.Easy?.solved || 0,
      total: dsa.difficultyStats?.Easy?.total || 0,
      fill: "#10b981",
    },
    {
      name: "Medium",
      solved: dsa.difficultyStats?.Medium?.solved || 0,
      total: dsa.difficultyStats?.Medium?.total || 0,
      fill: "#f59e0b",
    },
    {
      name: "Hard",
      solved: dsa.difficultyStats?.Hard?.solved || 0,
      total: dsa.difficultyStats?.Hard?.total || 0,
      fill: "#ef4444",
    },
  ];

  // Pattern progress chart data
  const patternChartData = (dsa.patternProgress || []).map((p: any) => ({
    name: p.name.length > 14 ? p.name.slice(0, 14) + "..." : p.name,
    fullName: p.name,
    solved: p.solved,
    total: p.total,
    percent: p.percent,
  }));

  const quizHistoryData = aptitude.quizScoreHistory || [];

  return (
    <div className="flex min-h-screen bg-[#121316] text-zinc-100">
      <StudentSidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <StudentNavbar title="Placement Readiness Analytics" />

        <main className="p-6 md:p-8 space-y-8 flex-1 overflow-y-auto max-w-7xl w-full mx-auto">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-white tracking-tight">
                Personal Progress & Performance Analytics
              </h2>
              <p className="text-xs text-zinc-400 mt-0.5">
                Computed from live problem submissions, daily quiz attempts, and pattern mastery.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="bg-[#1A1B1E] px-4 py-2 rounded-xl border border-[#2C2E33] text-xs">
                DSA Solved:{" "}
                <strong className="text-emerald-400 font-mono">
                  {dsa.solvedCount ?? 0} / {dsa.totalProblems ?? 0}
                </strong>
              </div>
              <div className="bg-[#1A1B1E] px-4 py-2 rounded-xl border border-[#2C2E33] text-xs">
                Quiz Avg:{" "}
                <strong className="text-[#FF5722] font-mono">
                  {aptitude.avgAccuracy ?? 0}%
                </strong>
              </div>
            </div>
          </div>

          {/* Top Row: Difficulty Mastery & Aptitude Trend Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 1. Difficulty Breakdown */}
            <div className="glass-panel p-6 rounded-2xl border border-[#2C2E33] bg-[#1A1B1E] space-y-4 shadow-xl">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-white">DSA Solved by Difficulty</h3>
                  <p className="text-xs text-zinc-400">Easy, Medium, and Hard problem status</p>
                </div>
                <Award className="w-5 h-5 text-amber-400" />
              </div>

              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={difficultyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#2C2E33" />
                    <XAxis dataKey="name" stroke="#9CA3AF" fontSize={12} />
                    <YAxis stroke="#9CA3AF" fontSize={12} />
                    <Tooltip
                      contentStyle={{ backgroundColor: "#1A1B1E", borderColor: "#2C2E33", borderRadius: "12px", fontSize: "12px" }}
                      itemStyle={{ color: "#FFFFFF" }}
                    />
                    <Bar dataKey="solved" name="Solved" radius={[6, 6, 0, 0]}>
                      {difficultyData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="grid grid-cols-3 gap-2 pt-2 border-t border-[#2C2E33] text-center text-xs">
                {difficultyData.map((d) => (
                  <div key={d.name} className="p-2 rounded-xl bg-[#202226]">
                    <span className="text-zinc-400 block">{d.name}</span>
                    <strong className="text-white font-mono">{d.solved} / {d.total}</strong>
                  </div>
                ))}
              </div>
            </div>

            {/* 2. Daily Quiz Scores History */}
            <div className="glass-panel p-6 rounded-2xl border border-[#2C2E33] bg-[#1A1B1E] space-y-4 shadow-xl">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-white">Daily Quiz Score Progression</h3>
                  <p className="text-xs text-zinc-400">Accuracy & scores across official daily attempts</p>
                </div>
                <TrendingUp className="w-5 h-5 text-[#FF5722]" />
              </div>

              {quizHistoryData.length === 0 ? (
                <div className="h-64 flex flex-col items-center justify-center text-zinc-500 text-xs space-y-2">
                  <p>No daily quiz attempts recorded yet.</p>
                  <p className="text-[11px] text-zinc-600">Take today's quiz to start recording accuracy trends.</p>
                </div>
              ) : (
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={quizHistoryData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#2C2E33" />
                      <XAxis dataKey="date" stroke="#9CA3AF" fontSize={10} />
                      <YAxis stroke="#9CA3AF" domain={[0, 10]} fontSize={12} />
                      <Tooltip
                        contentStyle={{ backgroundColor: "#1A1B1E", borderColor: "#2C2E33", borderRadius: "12px", fontSize: "12px" }}
                        itemStyle={{ color: "#FFFFFF" }}
                      />
                      <Line
                        type="monotone"
                        dataKey="score"
                        name="Score (out of 10)"
                        stroke="#FF5722"
                        strokeWidth={3}
                        dot={{ fill: "#FF5722", r: 4 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}

              <div className="flex items-center justify-between text-xs pt-2 border-t border-[#2C2E33] text-zinc-400">
                <span>Total Quizzes Taken: <strong className="text-white">{aptitude.totalQuizzesTaken ?? 0}</strong></span>
                <span>Average Accuracy: <strong className="text-emerald-400">{aptitude.avgAccuracy ?? 0}%</strong></span>
              </div>
            </div>
          </div>

          {/* Bottom Row: 15 Patterns Completion Horizontal Bars */}
          <div className="glass-panel p-6 rounded-2xl border border-[#2C2E33] bg-[#1A1B1E] space-y-4">
            <div>
              <h3 className="text-base font-bold text-white">Pattern-wise Completion Breakdown</h3>
              <p className="text-xs text-zinc-400">
                Exact problem mastery calculated across all 15 workbook patterns
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {dsa.patternProgress?.map((pat: any) => (
                <div
                  key={pat.id}
                  className="bg-[#202226] p-4 rounded-xl border border-[#2C2E33] space-y-2"
                >
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="text-white truncate max-w-[170px]">{pat.name}</span>
                    <span className="text-zinc-400 font-mono">
                      {pat.solved} / {pat.total}
                    </span>
                  </div>

                  <div className="w-full bg-[#141518] h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-[#FF5722] to-[#F15A24] h-full rounded-full transition-all duration-500"
                      style={{ width: `${pat.percent}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-zinc-500">
                    <span>{pat.percent}% solved</span>
                    <span className={pat.solved === pat.total && pat.total > 0 ? "text-emerald-400 font-bold" : ""}>
                      {pat.solved === pat.total && pat.total > 0 ? "✓ Mastered" : `${pat.total - pat.solved} remaining`}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Solved Activity */}
          <div className="glass-panel p-6 rounded-2xl border border-[#2C2E33] bg-[#1A1B1E] space-y-4">
            <h3 className="text-base font-bold text-white">Recently Solved Problems</h3>
            {dsa.recentSolved?.length === 0 ? (
              <div className="text-xs text-zinc-500 py-4 text-center">
                No problems marked as solved yet. Browse DSA Patterns to start tracking.
              </div>
            ) : (
              <div className="divide-y divide-[#2C2E33] text-xs">
                {dsa.recentSolved?.map((prob: any) => (
                  <div key={prob.id} className="py-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <a
                        href={prob.leetcodeUrl || "#"}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-semibold text-white hover:text-[#FF5722] transition inline-flex items-center gap-1.5"
                      >
                        <span>{prob.title}</span>
                        {prob.leetcodeUrl && <ExternalLink className="w-3 h-3 text-zinc-500" />}
                      </a>
                    </div>

                    <div className="flex items-center gap-3 text-zinc-400">
                      <span className="px-2 py-0.5 rounded-full bg-[#202226] text-[10px] font-bold border border-[#2C2E33]">
                        {prob.difficulty}
                      </span>
                      <span>{new Date(prob.solvedAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
