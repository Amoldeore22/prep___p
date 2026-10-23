"use client";

import React, { useState, useEffect } from "react";
import AdminSidebar from "@/components/layout/AdminSidebar";
import AdminNavbar from "@/components/layout/AdminNavbar";
import {
  LineChart as LineChartIcon,
  Users,
  Code2,
  HelpCircle,
  Building,
  Video,
  Award,
  Clock,
  TrendingUp,
  RefreshCw,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const COLORS = ["#FF5722", "#F15A24", "#ea580c", "#f97316", "#fb923c", "#fdba74"];

export default function AdminAnalyticsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/analytics");
      const json = await res.json();
      if (res.ok) {
        setData(json);
      }
    } catch {
      console.error("Failed to load analytics");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  // Prepare chart data from stats
  const distributionData = data
    ? [
        { name: "Active Students", value: data.stats.activeStudents },
        { name: "Inactive Students", value: Math.max(0, data.stats.totalStudents - data.stats.activeStudents) },
      ]
    : [];

  const platformOverviewData = data
    ? [
        { category: "Students", count: data.stats.totalStudents },
        { category: "Problems", count: data.stats.totalProblems },
        { category: "Solved Events", count: data.stats.totalSolvedEvents },
        { category: "Daily Quizzes", count: data.stats.totalQuizzes },
        { category: "Quiz Attempts", count: data.stats.totalQuizAttempts },
        { category: "Companies", count: data.stats.publishedCompanies },
      ]
    : [];

  return (
    <div className="flex min-h-screen bg-[#121316] text-zinc-100">
      <AdminSidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <AdminNavbar title="Platform Analytics & Intelligence" />

        <main className="flex-1 p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-white">System Analytics & Growth</h1>
              <p className="text-zinc-400 text-sm mt-1">
                Real database-driven metrics measuring student engagement, problem resolution, and placement quiz accuracy.
              </p>
            </div>

            <button
              onClick={fetchAnalytics}
              disabled={loading}
              className="px-4 py-2.5 rounded-xl border border-[#2C2E33] bg-[#202226] hover:bg-[#2C2E33] text-zinc-300 text-xs font-semibold flex items-center gap-2 transition self-start sm:self-auto"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
              <span>Refresh Metrics</span>
            </button>
          </div>

          {loading ? (
            <div className="p-16 text-center text-zinc-400">Loading system metrics...</div>
          ) : !data ? (
            <div className="p-12 text-center text-zinc-400">Failed to load platform analytics.</div>
          ) : (
            <>
              {/* Stat Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-5 rounded-2xl bg-[#1A1B1E] border border-[#2C2E33] space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-zinc-400">Registered Students</span>
                    <Users className="w-4 h-4 text-[#FF5722]" />
                  </div>
                  <div className="text-2xl font-bold text-white">{data.stats.totalStudents}</div>
                  <span className="text-[11px] text-emerald-400 font-medium">
                    {data.stats.activeStudents} active learners
                  </span>
                </div>

                <div className="p-5 rounded-2xl bg-[#1A1B1E] border border-[#2C2E33] space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-zinc-400">DSA Submissions</span>
                    <Code2 className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div className="text-2xl font-bold text-white">{data.stats.totalSolvedEvents}</div>
                  <span className="text-[11px] text-zinc-400">
                    across {data.stats.totalProblems} imported problems
                  </span>
                </div>

                <div className="p-5 rounded-2xl bg-[#1A1B1E] border border-[#2C2E33] space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-zinc-400">Aptitude Attempts</span>
                    <HelpCircle className="w-4 h-4 text-[#FF5722]" />
                  </div>
                  <div className="text-2xl font-bold text-white">{data.stats.totalQuizAttempts}</div>
                  <span className="text-[11px] text-[#FF5722] font-medium">
                    {data.stats.avgQuizAccuracy}% avg accuracy
                  </span>
                </div>

                <div className="p-5 rounded-2xl bg-[#1A1B1E] border border-[#2C2E33] space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-zinc-400">Placement Drives</span>
                    <Building className="w-4 h-4 text-amber-400" />
                  </div>
                  <div className="text-2xl font-bold text-white">{data.stats.publishedCompanies}</div>
                  <span className="text-[11px] text-amber-400 font-medium">
                    {data.stats.pendingInterviews} experiences pending review
                  </span>
                </div>
              </div>

              {/* Charts Section */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Platform Overview Bar Chart */}
                <div className="p-6 rounded-2xl bg-[#1A1B1E] border border-[#2C2E33] space-y-4">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-[#FF5722]" />
                    <span>Database Activity Distribution</span>
                  </h3>
                  <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={platformOverviewData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#2C2E33" />
                        <XAxis dataKey="category" stroke="#71717a" fontSize={11} angle={-15} textAnchor="end" />
                        <YAxis stroke="#71717a" fontSize={11} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "#1A1B1E",
                            borderColor: "#2C2E33",
                            borderRadius: "12px",
                            fontSize: "12px",
                            color: "#FFFFFF",
                          }}
                        />
                        <Bar dataKey="count" fill="#FF5722" radius={[6, 6, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Active Student Engagement Pie Chart */}
                <div className="p-6 rounded-2xl bg-[#1A1B1E] border border-[#2C2E33] space-y-4">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Award className="w-4 h-4 text-[#FF5722]" />
                    <span>Student Practice Engagement Ratio</span>
                  </h3>
                  <div className="h-64 w-full flex items-center justify-center">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={distributionData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={85}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {distributionData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "#1A1B1E",
                            borderColor: "#2C2E33",
                            borderRadius: "12px",
                            fontSize: "12px",
                            color: "#FFFFFF",
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex justify-center gap-6 text-xs text-zinc-400">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-[#FF5722]" />
                      <span>Active ({data.stats.activeStudents})</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-amber-500" />
                      <span>Inactive ({Math.max(0, data.stats.totalStudents - data.stats.activeStudents)})</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent Activity Feed */}
              <div className="p-6 rounded-2xl bg-[#1A1B1E] border border-[#2C2E33] space-y-4">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Clock className="w-4 h-4 text-amber-400" />
                  <span>Real-time Student Activity Feed</span>
                </h3>

                {data.recentActivity && data.recentActivity.length > 0 ? (
                  <div className="divide-y divide-[#2C2E33]">
                    {data.recentActivity.map((event: any) => (
                      <div key={event.id} className="py-3 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-3">
                          <div className="w-2 h-2 rounded-full bg-[#FF5722]" />
                          <span className="font-semibold text-white">{event.user?.name || "Student"}</span>
                          <span className="text-zinc-400">
                            performed <strong className="text-zinc-200">{event.type.replace(/_/g, " ")}</strong>
                          </span>
                          <span className="px-2 py-0.5 rounded text-[10px] bg-[#202226] text-zinc-400">
                            {event.targetResource}
                          </span>
                        </div>
                        <span className="text-zinc-500">{new Date(event.createdAt).toLocaleTimeString()}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-zinc-500 text-center py-6">
                    Activity events will stream here as students practice.
                  </p>
                )}
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
}
