"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import AdminSidebar from "@/components/layout/AdminSidebar";
import AdminNavbar from "@/components/layout/AdminNavbar";
import {
  User,
  ArrowLeft,
  CheckCircle2,
  Clock,
  HelpCircle,
  Code2,
  ExternalLink,
  Award,
  Calendar,
  Layers,
  GraduationCap,
} from "lucide-react";

export default function AdminStudentDetailPage() {
  const params = useParams();
  const studentId = params?.id as string;
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (!studentId) return;
    const fetchStudent = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/admin/students/${studentId}`);
        const json = await res.json();
        if (res.ok) {
          setData(json);
        } else {
          setErrorMsg(json.error || "Failed to load student details");
        }
      } catch {
        setErrorMsg("Network error loading student");
      } finally {
        setLoading(false);
      }
    };
    fetchStudent();
  }, [studentId]);

  return (
    <div className="flex min-h-screen bg-[#121316] text-zinc-100">
      <AdminSidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <AdminNavbar title="Student Profile & Progress Breakdown" />

        <main className="flex-1 p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-6">
          <Link
            href="/admin/students"
            className="inline-flex items-center gap-2 text-xs font-semibold text-zinc-400 hover:text-white transition mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Student Directory</span>
          </Link>

          {loading ? (
            <div className="p-12 text-center text-zinc-400">Loading student analytics...</div>
          ) : errorMsg ? (
            <div className="p-8 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-sm text-center">
              {errorMsg}
            </div>
          ) : !data ? null : (
            <>
              {/* Profile Card */}
              <div className="p-6 rounded-2xl bg-[#1A1B1E] border border-[#2C2E33] flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#FF5722] to-[#F15A24] flex items-center justify-center text-white text-xl font-bold shadow-lg shadow-orange-500/20">
                    {data.student.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h1 className="text-xl font-bold text-white">{data.student.name}</h1>
                    <p className="text-xs text-zinc-400">{data.student.email}</p>
                    <div className="flex flex-wrap items-center gap-2 mt-2">
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#202226] text-zinc-300">
                        {data.student.department || "General Engineering"}
                      </span>
                      {data.student.graduationYear && (
                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#202226] text-zinc-300">
                          Class of {data.student.graduationYear}
                        </span>
                      )}
                      {data.student.cgpa && (
                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/10 text-amber-300 border border-amber-500/20">
                          CGPA: {data.student.cgpa}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3 border-t md:border-t-0 md:border-l border-[#2C2E33] pt-4 md:pt-0 md:pl-6 text-center">
                  <div>
                    <span className="text-[11px] text-zinc-400">DSA Solved</span>
                    <div className="text-xl font-bold text-emerald-400">{data.stats.totalSolved}</div>
                  </div>
                  <div>
                    <span className="text-[11px] text-zinc-400">Quizzes Taken</span>
                    <div className="text-xl font-bold text-[#FF5722]">{data.stats.totalQuizzes}</div>
                  </div>
                  <div>
                    <span className="text-[11px] text-zinc-400">Avg Quiz Score</span>
                    <div className="text-xl font-bold text-amber-400">{data.stats.avgQuizScore}/10</div>
                  </div>
                </div>
              </div>

              {/* Two Column Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Solved Problems */}
                <div className="p-6 rounded-2xl bg-[#1A1B1E] border border-[#2C2E33] space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-base font-bold text-white flex items-center gap-2">
                      <Code2 className="w-4 h-4 text-emerald-400" />
                      <span>Solved DSA Problems ({data.solvedProblems.length})</span>
                    </h2>
                  </div>

                  {data.solvedProblems.length === 0 ? (
                    <p className="text-xs text-zinc-500 py-6 text-center">
                      No problems solved yet by this student.
                    </p>
                  ) : (
                    <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
                      {data.solvedProblems.map((prob: any) => (
                        <div
                          key={prob.id}
                          className="p-3 rounded-xl bg-[#202226] border border-[#2C2E33] flex items-center justify-between gap-3 text-xs"
                        >
                          <div>
                            <div className="font-semibold text-white">{prob.title}</div>
                            <div className="text-[11px] text-zinc-400 flex items-center gap-2 mt-0.5">
                              <span>{prob.patternName}</span>
                              <span>•</span>
                              <span
                                className={`font-bold ${
                                  prob.difficulty === "HARD"
                                    ? "text-rose-400"
                                    : prob.difficulty === "MEDIUM"
                                    ? "text-amber-400"
                                    : "text-emerald-400"
                                }`}
                              >
                                {prob.difficulty}
                              </span>
                            </div>
                          </div>
                          <a
                            href={prob.leetcodeUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-[#1A1B1E] transition"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Aptitude Quiz History */}
                <div className="p-6 rounded-2xl bg-[#1A1B1E] border border-[#2C2E33] space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-base font-bold text-white flex items-center gap-2">
                      <HelpCircle className="w-4 h-4 text-[#FF5722]" />
                      <span>Daily Quiz Attempt History ({data.quizHistory.length})</span>
                    </h2>
                  </div>

                  {data.quizHistory.length === 0 ? (
                    <p className="text-xs text-zinc-500 py-6 text-center">
                      No daily quiz attempts submitted yet.
                    </p>
                  ) : (
                    <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
                      {data.quizHistory.map((q: any, idx: number) => (
                        <div
                          key={idx}
                          className="p-3.5 rounded-xl bg-[#202226] border border-[#2C2E33] flex items-center justify-between gap-3 text-xs"
                        >
                          <div>
                            <div className="font-bold text-white">{q.date}</div>
                            <div className="text-[11px] text-zinc-400 flex items-center gap-2 mt-0.5">
                              <span>Time: {Math.floor(q.timeTaken / 60)}m {q.timeTaken % 60}s</span>
                              <span>•</span>
                              <span>{new Date(q.submittedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="font-bold text-sm text-[#FF5722]">{q.score} / 10</span>
                            <div className="text-[10px] text-zinc-400 font-semibold">{q.accuracy}% accuracy</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Activity Timeline */}
              {data.recentActivity && data.recentActivity.length > 0 && (
                <div className="p-6 rounded-2xl bg-[#1A1B1E] border border-[#2C2E33] space-y-4">
                  <h2 className="text-base font-bold text-white flex items-center gap-2">
                    <Clock className="w-4 h-4 text-amber-400" />
                    <span>Recent Activity Stream</span>
                  </h2>

                  <div className="space-y-2">
                    {data.recentActivity.map((event: any) => (
                      <div
                        key={event.id}
                        className="p-3 rounded-xl bg-[#202226] border border-[#2C2E33] flex items-center justify-between text-xs text-zinc-300"
                      >
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-[#FF5722]" />
                          <span className="font-semibold text-white">{event.type.replace(/_/g, " ")}</span>
                          <span className="text-zinc-400">on {event.targetResource}</span>
                        </div>
                        <span className="text-[11px] text-zinc-500">
                          {new Date(event.createdAt).toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}
