"use client";

import React, { useState, useEffect } from "react";
import AdminSidebar from "@/components/layout/AdminSidebar";
import AdminNavbar from "@/components/layout/AdminNavbar";
import {
  HelpCircle,
  Calendar,
  Lock,
  Unlock,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  Users,
  Award,
  Layers,
  Sparkles,
} from "lucide-react";

export default function AdminDailyQuizPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const loadQuiz = async () => {
    try {
      setLoading(true);
      setErrorMsg("");
      const res = await fetch("/api/admin/aptitude/daily-quiz");
      const json = await res.json();
      if (res.ok) {
        setData(json);
      } else {
        setErrorMsg(json.message || json.error || "Failed to load quiz");
      }
    } catch {
      setErrorMsg("Network error loading daily quiz");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadQuiz();
  }, []);

  const handleGenerate = async () => {
    if (data?.quiz && data.quiz.isLocked) {
      alert("Cannot regenerate this quiz because student attempts have already been recorded.");
      return;
    }
    if (
      data?.quiz &&
      !confirm("Are you sure you want to regenerate today's daily quiz with a new set of 10 questions?")
    ) {
      return;
    }

    try {
      setGenerating(true);
      setErrorMsg("");
      setSuccessMsg("");
      const res = await fetch("/api/admin/aptitude/daily-quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      const json = await res.json();
      if (res.ok) {
        setSuccessMsg(json.message || "Daily quiz generated successfully!");
        loadQuiz();
      } else {
        setErrorMsg(json.message || json.error || "Failed to generate daily quiz");
      }
    } catch {
      setErrorMsg("Error generating quiz");
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#121316] text-zinc-100">
      <AdminSidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <AdminNavbar title="Daily Aptitude Quiz Manager" />

        <main className="flex-1 p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-white">Daily Aptitude Quiz</h1>
              <p className="text-zinc-400 text-sm mt-1">
                Every student receives the exact same 10-question quiz per date with server-side evaluation.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={loadQuiz}
                disabled={loading}
                className="px-4 py-2.5 rounded-xl border border-[#2C2E33] bg-[#202226] text-zinc-300 hover:bg-[#2C2E33] text-sm font-semibold flex items-center gap-2 transition"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
                <span>Refresh</span>
              </button>

              <button
                onClick={handleGenerate}
                disabled={generating || (data?.quiz && data.quiz.isLocked)}
                className={`px-4 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2 transition shadow-lg ${
                  data?.quiz && data.quiz.isLocked
                    ? "bg-[#202226] text-zinc-500 cursor-not-allowed border border-[#2C2E33]"
                    : "bg-gradient-to-r from-[#FF5722] to-[#F15A24] text-white hover:from-[#F15A24] hover:to-[#ea580c] shadow-orange-500/20"
                }`}
              >
                {generating ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : data?.quiz ? (
                  <RefreshCw className="w-4 h-4" />
                ) : (
                  <Sparkles className="w-4 h-4" />
                )}
                <span>
                  {generating
                    ? "Generating..."
                    : data?.quiz
                    ? data.quiz.isLocked
                      ? "Quiz Locked (In Use)"
                      : "Regenerate Quiz"
                    : "Generate Today's Quiz"}
                </span>
              </button>
            </div>
          </div>

          {/* Alerts */}
          {errorMsg && (
            <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-sm flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Action Blocked</p>
                <p className="text-xs text-rose-300 mt-0.5">{errorMsg}</p>
              </div>
            </div>
          )}

          {successMsg && (
            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Question Bank Sufficiency Indicator */}
          {data && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 rounded-2xl bg-[#1A1B1E] border border-[#2C2E33]">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-zinc-400">Total Published Pool</span>
                  <Award className="w-4 h-4 text-amber-400" />
                </div>
                <div className="mt-2 text-2xl font-bold text-white">
                  {data.totalPublishedQuestions}
                  <span className="text-xs text-zinc-400 font-normal ml-2">
                    (Min required: 10)
                  </span>
                </div>
                <div className="mt-1">
                  {data.totalPublishedQuestions >= 10 ? (
                    <span className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Question bank sufficient
                    </span>
                  ) : (
                    <span className="text-[11px] text-rose-400 font-semibold flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" /> Needs {10 - data.totalPublishedQuestions} more
                    </span>
                  )}
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-[#1A1B1E] border border-[#2C2E33]">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-zinc-400">Target Date</span>
                  <Calendar className="w-4 h-4 text-[#FF5722]" />
                </div>
                <div className="mt-2 text-2xl font-bold text-white">{data.date}</div>
                <span className="text-[11px] text-[#FF5722] font-semibold">
                  {data.isToday ? "Today's Official Date" : "Archived Date"}
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-[#1A1B1E] border border-[#2C2E33]">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-zinc-400">Student Attempts</span>
                  <Users className="w-4 h-4 text-[#FF5722]" />
                </div>
                <div className="mt-2 text-2xl font-bold text-white">
                  {data.quiz?.attemptsCount || 0}
                </div>
                <span className="text-[11px] text-zinc-400">Official student submissions</span>
              </div>

              <div className="p-4 rounded-2xl bg-[#1A1B1E] border border-[#2C2E33]">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-zinc-400">Lock Status</span>
                  {data.quiz?.isLocked ? (
                    <Lock className="w-4 h-4 text-rose-400" />
                  ) : (
                    <Unlock className="w-4 h-4 text-emerald-400" />
                  )}
                </div>
                <div className="mt-2 text-xl font-bold text-white">
                  {data.quiz
                    ? data.quiz.isLocked
                      ? "Locked"
                      : "Unlocked (Editable)"
                    : "Not Generated"}
                </div>
                <span className="text-[11px] text-zinc-400">
                  {data.quiz?.isLocked
                    ? "Locked because students started"
                    : "Can regenerate prior to attempts"}
                </span>
              </div>
            </div>
          )}

          {/* Quiz Details and Questions */}
          {loading ? (
            <div className="p-12 text-center text-zinc-400">Loading daily quiz data...</div>
          ) : !data?.quiz ? (
            <div className="p-12 rounded-2xl bg-[#1A1B1E] border border-[#2C2E33] text-center space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-[#202226] flex items-center justify-center mx-auto text-zinc-400">
                <HelpCircle className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">No Daily Quiz Generated for Today</h3>
              <p className="text-sm text-zinc-400 max-w-md mx-auto">
                A daily quiz can be generated automatically when students first access the portal, or you can pre-generate and preview it here.
              </p>
              <button
                onClick={handleGenerate}
                disabled={generating || (data && data.totalPublishedQuestions < 10)}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#FF5722] to-[#F15A24] hover:from-[#F15A24] hover:to-[#ea580c] text-white font-semibold text-sm transition shadow-lg shadow-orange-500/20"
              >
                Generate 10-Question Quiz Now
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <Layers className="w-5 h-5 text-[#FF5722]" />
                  <span>Assigned 10 Questions for {data.date}</span>
                </h2>
                <span className="text-xs text-zinc-400">
                  Total Questions: {data.quiz.questions.length} / 10
                </span>
              </div>

              <div className="space-y-3">
                {data.quiz.questions.map((q: any) => (
                  <div
                    key={q.id}
                    className="p-5 rounded-2xl bg-[#1A1B1E] border border-[#2C2E33] hover:border-[#3F4248] transition space-y-3"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3">
                        <span className="w-7 h-7 rounded-lg bg-[#FF5722]/10 text-[#FF5722] border border-[#FF5722]/20 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                          {q.orderIndex}
                        </span>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase bg-[#202226] text-zinc-300">
                              {q.categorySlug.replace("-", " ")}
                            </span>
                            <span
                              className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                                q.difficulty === "HARD"
                                  ? "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                                  : q.difficulty === "MEDIUM"
                                  ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                                  : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                              }`}
                            >
                              {q.difficulty}
                            </span>
                          </div>
                          <p className="text-sm font-semibold text-zinc-200">{q.text}</p>
                        </div>
                      </div>
                    </div>

                    {/* Options Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pl-10">
                      {[
                        { key: "A", val: q.optionA },
                        { key: "B", val: q.optionB },
                        { key: "C", val: q.optionC },
                        { key: "D", val: q.optionD },
                      ].map((opt) => {
                        const isCorrect = q.correctAnswer === opt.key;
                        return (
                          <div
                            key={opt.key}
                            className={`px-3 py-2 rounded-xl text-xs flex items-center gap-2.5 border ${
                              isCorrect
                                ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300 font-semibold"
                                : "bg-[#202226] border-[#2C2E33] text-zinc-400"
                            }`}
                          >
                            <span
                              className={`w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-bold shrink-0 ${
                                isCorrect
                                  ? "bg-emerald-500 text-black"
                                  : "bg-[#1A1B1E] text-zinc-300"
                              }`}
                            >
                              {opt.key}
                            </span>
                            <span className="truncate">{opt.val}</span>
                            {isCorrect && (
                              <CheckCircle2 className="w-3.5 h-3.5 ml-auto text-emerald-400 shrink-0" />
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {q.explanation && (
                      <div className="pl-10 text-xs text-zinc-400 bg-[#202226] p-3 rounded-xl border border-[#2C2E33]">
                        <span className="font-semibold text-zinc-300">Explanation: </span>
                        {q.explanation}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
