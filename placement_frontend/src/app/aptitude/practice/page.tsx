"use client";

import React, { useState, useEffect } from "react";
import StudentSidebar from "@/components/layout/StudentSidebar";
import StudentNavbar from "@/components/layout/StudentNavbar";
import {
  Brain,
  Calculator,
  BookOpen,
  BarChart3,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Sparkles,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  Loader2,
} from "lucide-react";
import { cleanQuestionText } from "@/lib/question-utils";

export default function AptitudePracticePage() {
  const [questions, setQuestions] = useState<any[]>([]);
  const [category, setCategory] = useState<string>("all");
  const [difficulty, setDifficulty] = useState<string>("all");
  const [page, setPage] = useState<number>(1);
  const [pagination, setPagination] = useState<{
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }>({
    total: 0,
    page: 1,
    limit: 50,
    totalPages: 1,
  });
  const [revealed, setRevealed] = useState<Record<string, string>>({}); // { questionId: selectedOption }
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchQuestions = (targetPage = page) => {
    setIsLoading(true);
    fetch(`/api/aptitude/practice?category=${category}&difficulty=${difficulty}&page=${targetPage}&limit=50`)
      .then((res) => res.json())
      .then((data) => {
        if (data.questions) setQuestions(data.questions);
        if (data.pagination) setPagination(data.pagination);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error("Practice questions error:", err);
        setIsLoading(false);
      });
  };

  useEffect(() => {
    fetchQuestions(page);
  }, [category, difficulty, page]);

  const handleSelectOption = (questionId: string, option: string) => {
    setRevealed((prev) => ({
      ...prev,
      [questionId]: option,
    }));
  };

  return (
    <div className="flex min-h-screen bg-[#121316] text-zinc-100">
      <StudentSidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <StudentNavbar title="Aptitude Practice Hub" />

        <main className="p-6 md:p-8 space-y-6 flex-1 overflow-y-auto max-w-5xl w-full mx-auto">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-white tracking-tight">
                Placement Aptitude Question Bank
              </h2>
              <p className="text-xs text-zinc-400 mt-1">
                Drill Quantitative, Logical, Verbal, and Data Interpretation with instant answer validation.
              </p>
            </div>

            <button
              onClick={() => setRevealed({})}
              className="px-3.5 py-2 rounded-xl bg-[#202226] hover:bg-[#2C2E33] text-xs text-zinc-300 font-semibold border border-[#2C2E33] transition flex items-center gap-2 self-start sm:self-center"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Selected Answers</span>
            </button>
          </div>

          {/* Filter Pills */}
          <div className="bg-[#1A1B1E] p-4 rounded-2xl border border-[#2C2E33] flex flex-wrap items-center justify-between gap-4">
            {/* Category tabs */}
            <div className="flex flex-wrap items-center gap-2 text-xs">
              {[
                { id: "all", label: "All Categories", icon: Sparkles },
                { id: "quantitative", label: "Quantitative", icon: Calculator },
                { id: "logical", label: "Logical Reasoning", icon: Brain },
                { id: "verbal", label: "Verbal Ability", icon: BookOpen },
                { id: "data-interpretation", label: "Data Interpretation", icon: BarChart3 },
              ].map((tab) => {
                const Icon = tab.icon;
                const isSelected = category === tab.id;

                return (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setCategory(tab.id);
                      setPage(1);
                    }}
                    className={`px-3 py-1.5 rounded-lg font-semibold transition flex items-center gap-1.5 ${
                      isSelected
                        ? "bg-gradient-to-r from-[#FF5722] to-[#F15A24] text-white shadow-md shadow-orange-500/20"
                        : "bg-[#202226] text-zinc-400 hover:text-white border border-[#2C2E33]"
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Difficulty selector */}
            <select
              value={difficulty}
              onChange={(e) => {
                setDifficulty(e.target.value);
                setPage(1);
              }}
              className="bg-[#202226] border border-[#2C2E33] text-xs text-zinc-300 rounded-lg px-3 py-1.5 outline-none cursor-pointer"
            >
              <option value="all">All Difficulties</option>
              <option value="Easy">Easy</option>
              <option value="Medium">Medium</option>
              <option value="Hard">Hard</option>
            </select>
          </div>

          {/* Question List Header & Info */}
          <div className="flex items-center justify-between text-xs text-zinc-400 px-1">
            <div className="flex items-center gap-2">
              <span>
                Showing{" "}
                <strong className="text-white font-mono">
                  {questions.length > 0 ? (page - 1) * 50 + 1 : 0} -{" "}
                  {Math.min(page * 50, pagination.total || questions.length)}
                </strong>{" "}
                of{" "}
                <strong className="text-white font-mono">
                  {pagination.total || questions.length}
                </strong>{" "}
                questions
              </span>
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-[#202226] text-zinc-400 border border-[#2C2E33]">
                50 per page
              </span>
            </div>

            {isLoading && (
              <div className="flex items-center gap-1.5 text-zinc-400 font-medium">
                <Loader2 className="w-3.5 h-3.5 text-[#FF5722] animate-spin" />
                <span>Loading questions...</span>
              </div>
            )}
          </div>

          {/* Question List */}
          {isLoading && questions.length === 0 ? (
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-44 rounded-2xl bg-[#1A1B1E] animate-pulse border border-[#2C2E33]" />
              ))}
            </div>
          ) : (
            <div className="space-y-4 max-h-[640px] overflow-y-auto pr-2 rounded-2xl">
              {questions.length === 0 ? (
                <div className="glass-panel p-12 text-center text-zinc-400 rounded-2xl border border-[#2C2E33] bg-[#1A1B1E]">
                  <HelpCircle className="w-8 h-8 text-zinc-600 mx-auto mb-3" />
                  <p className="text-sm font-semibold text-white">No questions found</p>
                  <p className="text-xs text-zinc-500 mt-1">
                    Try selecting a different category or difficulty level.
                  </p>
                </div>
              ) : (
                questions.map((q, idx) => {
                  const userSelected = revealed[q.id];
                  const isAnswered = Boolean(userSelected);
                  const isCorrect = userSelected === q.correctAnswer;

                  return (
                    <div
                      key={q.id}
                      className={`glass-panel p-6 rounded-2xl border transition-all space-y-4 bg-[#1A1B1E] ${
                        isAnswered
                          ? isCorrect
                            ? "border-emerald-500/30 bg-emerald-950/10"
                            : "border-rose-500/30 bg-rose-950/10"
                          : "border-[#2C2E33]"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono font-bold text-zinc-400">
                            Q{(page - 1) * 50 + idx + 1}.
                          </span>
                          <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#202226] text-[#FF5722] font-semibold capitalize border border-[#2C2E33]">
                            {q.category?.name || q.categorySlug}
                          </span>
                        </div>
                        <span className="text-xs font-mono text-zinc-500">
                          Difficulty: {q.difficulty}
                        </span>
                      </div>

                      <h3 className="text-base font-semibold text-white leading-relaxed">
                        {cleanQuestionText(q.text)}
                      </h3>

                      {/* Options */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                        {["A", "B", "C", "D"].map((optKey) => {
                          const optText = q[`option${optKey}`];
                          const isChosen = userSelected === optKey;
                          const isRightAnswer = q.correctAnswer === optKey;

                          let style = "bg-[#202226] border-[#2C2E33] text-zinc-300 hover:bg-[#282a30]";
                          if (isAnswered) {
                            if (isRightAnswer) {
                              style = "bg-emerald-500/20 border-emerald-500 text-emerald-300 font-bold";
                            } else if (isChosen && !isCorrect) {
                              style = "bg-rose-500/20 border-rose-500 text-rose-300 font-bold line-through";
                            } else {
                              style = "bg-[#141518]/60 border-[#2C2E33]/40 text-zinc-600 opacity-50";
                            }
                          }

                          return (
                            <button
                              key={optKey}
                              type="button"
                              onClick={() => handleSelectOption(q.id, optKey)}
                              disabled={isAnswered}
                              className={`p-3.5 rounded-xl border text-left text-xs transition flex items-center gap-2.5 ${style}`}
                            >
                              <span className="font-mono font-bold">{optKey}.</span>
                              <span className="leading-relaxed">{optText}</span>
                            </button>
                          );
                        })}
                      </div>

                      {/* Instant Explanation Callout if answered */}
                      {isAnswered && (
                        <div className="p-4 rounded-xl bg-[#141518] border border-[#2C2E33] text-xs text-zinc-300 space-y-1.5">
                          <div className="flex items-center gap-2 font-bold">
                            {isCorrect ? (
                              <span className="text-emerald-400 flex items-center gap-1">
                                <CheckCircle2 className="w-4 h-4" /> Correct Answer: {q.correctAnswer}
                              </span>
                            ) : (
                              <span className="text-rose-400 flex items-center gap-1">
                                <XCircle className="w-4 h-4" /> Incorrect. Correct Answer is: {q.correctAnswer}
                              </span>
                            )}
                          </div>
                          <p className="leading-relaxed text-zinc-400 pt-1">
                            <strong>Explanation:</strong> {q.explanation}
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* Pagination Controls */}
          {pagination.totalPages > 1 && (
            <div className="p-4 rounded-2xl bg-[#1A1B1E] border border-[#2C2E33] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-400 shadow-sm">
              <div className="flex items-center gap-2">
                <span>
                  Page <strong className="text-white font-semibold">{pagination.page}</strong> of{" "}
                  <strong className="text-white font-semibold">{pagination.totalPages}</strong>
                </span>
                <span className="text-zinc-500">
                  ({pagination.total} questions in {category === "all" ? "all categories" : category})
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1 || isLoading}
                  className="px-3.5 py-2 rounded-xl bg-[#202226] hover:bg-[#2C2E33] text-zinc-300 disabled:opacity-40 disabled:cursor-not-allowed border border-[#2C2E33] transition flex items-center gap-1.5 font-semibold text-xs"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Previous Page</span>
                </button>

                <div className="flex items-center gap-1 px-1">
                  <span className="px-3 py-1 rounded-lg bg-[#202226] text-white border border-[#2C2E33] font-mono font-bold">
                    Page {pagination.page} of {pagination.totalPages}
                  </span>
                </div>

                <button
                  onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
                  disabled={page >= pagination.totalPages || isLoading}
                  className="px-3.5 py-2 rounded-xl bg-[#202226] hover:bg-[#2C2E33] text-zinc-300 disabled:opacity-40 disabled:cursor-not-allowed border border-[#2C2E33] transition flex items-center gap-1.5 font-semibold text-xs"
                >
                  <span>Next Page</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
