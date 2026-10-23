"use client";

import React, { useState, useEffect } from "react";
import AdminSidebar from "@/components/layout/AdminSidebar";
import AdminNavbar from "@/components/layout/AdminNavbar";
import {
  HelpCircle,
  Plus,
  Edit2,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  Search,
  Filter,
  Upload,
  ChevronLeft,
  ChevronRight,
  Loader2,
} from "lucide-react";
import CsvQuestionUploadModal from "@/components/admin/CsvQuestionUploadModal";
import { cleanQuestionText } from "@/lib/question-utils";

export default function AdminAptitudeQuestionsPage() {
  const [questions, setQuestions] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [stats, setStats] = useState<any>({});
  const [search, setSearch] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("all");
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
  const [loading, setLoading] = useState<boolean>(false);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [showUploadModal, setShowUploadModal] = useState<boolean>(false);
  const [editingQuestion, setEditingQuestion] = useState<any>(null);

  // Form states
  const [text, setText] = useState<string>("");
  const [optionA, setOptionA] = useState<string>("");
  const [optionB, setOptionB] = useState<string>("");
  const [optionC, setOptionC] = useState<string>("");
  const [optionD, setOptionD] = useState<string>("");
  const [correctAnswer, setCorrectAnswer] = useState<string>("A");
  const [explanation, setExplanation] = useState<string>("");
  const [categorySlug, setCategorySlug] = useState<string>("quantitative");
  const [difficulty, setDifficulty] = useState<string>("Medium");
  const [isPublished, setIsPublished] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  const fetchQuestions = (targetPage = page) => {
    setLoading(true);
    fetch(
      `/api/admin/aptitude/questions?search=${encodeURIComponent(
        search
      )}&category=${selectedCategory}&difficulty=${selectedDifficulty}&page=${targetPage}&limit=50&sort=asc`
    )
      .then((r) => r.json())
      .then((d) => {
        if (d.questions) setQuestions(d.questions);
        if (d.categories) setCategories(d.categories);
        if (d.stats) setStats(d.stats);
        if (d.pagination) setPagination(d.pagination);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch questions:", err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchQuestions(page);
  }, [search, selectedCategory, selectedDifficulty, page]);

  const openEdit = (q?: any) => {
    if (q) {
      setEditingQuestion(q);
      setText(cleanQuestionText(q.text));
      setOptionA(q.optionA);
      setOptionB(q.optionB);
      setOptionC(q.optionC);
      setOptionD(q.optionD);
      setCorrectAnswer(q.correctAnswer);
      setExplanation(q.explanation);
      setCategorySlug(q.categorySlug);
      setDifficulty(q.difficulty);
      setIsPublished(q.isPublished);
    } else {
      setEditingQuestion(null);
      setText("");
      setOptionA("");
      setOptionB("");
      setOptionC("");
      setOptionD("");
      setCorrectAnswer("A");
      setExplanation("");
      setCategorySlug("quantitative");
      setDifficulty("Medium");
      setIsPublished(true);
    }
    setShowModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      await fetch("/api/admin/aptitude/questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editingQuestion?.id,
          text,
          optionA,
          optionB,
          optionC,
          optionD,
          correctAnswer,
          explanation,
          categorySlug,
          difficulty,
          isPublished,
        }),
      });

      setShowModal(false);
      setIsSaving(false);
      fetchQuestions();
    } catch {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this question?")) return;
    try {
      await fetch(`/api/admin/aptitude/questions/${id}`, { method: "DELETE" });
      fetchQuestions();
    } catch {}
  };

  return (
    <div className="flex min-h-screen bg-[#121316] text-zinc-100">
      <AdminSidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <AdminNavbar title="Aptitude Question Bank" />

        <main className="p-6 md:p-8 space-y-6 flex-1 overflow-y-auto max-w-7xl w-full mx-auto">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-white tracking-tight">
                Aptitude Question Bank & Daily Quiz Pool
              </h2>
              <p className="text-xs text-zinc-400 mt-0.5">
                Manage MCQs across Quantitative, Logical, Verbal, and Data Interpretation.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 self-start sm:self-center">
              <button
                onClick={() => setShowUploadModal(true)}
                className="px-4 py-2.5 rounded-xl bg-[#202226] hover:bg-[#2C2E33] text-white font-bold text-xs border border-[#3F4248] transition flex items-center gap-2 shadow-sm"
              >
                <Upload className="w-4 h-4 text-[#FF5722]" />
                <span>Upload CSV</span>
              </button>

              <button
                onClick={() => openEdit()}
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#FF5722] to-[#F15A24] hover:from-[#F15A24] hover:to-[#ea580c] text-white font-bold text-xs shadow-lg shadow-orange-500/20 transition flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                <span>Create Question</span>
              </button>
            </div>
          </div>

          {/* Daily Quiz Sufficiency Alert */}
          {!stats.hasSufficientForDaily && stats.missingForDaily > 0 ? (
            <div className="glass-panel p-5 rounded-2xl border border-rose-500/40 bg-rose-950/20 text-rose-300 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
              <div className="text-xs space-y-1">
                <strong className="text-white block font-semibold">
                  Insufficient Questions for Daily Quiz Generation!
                </strong>
                <p>
                  At least 10 published questions are required for the automated daily quiz. Currently
                  available: <strong className="text-white font-mono">{stats.publishedCount || 0}</strong>.
                  Please create and publish at least{" "}
                  <strong className="text-rose-300 font-mono">{stats.missingForDaily}</strong> more
                  question(s).
                </p>
              </div>
            </div>
          ) : (
            <div className="glass-panel p-4 rounded-xl border border-emerald-500/30 bg-emerald-950/10 text-emerald-300 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>
                Daily Quiz Pool Healthy: {stats.publishedCount} published questions available for daily
                10-question distribution.
              </span>
            </div>
          )}

          {/* Search & Filters */}
          <div className="bg-[#1A1B1E] p-4 rounded-2xl border border-[#2C2E33] flex flex-wrap items-center justify-between gap-4">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-3" />
              <input
                type="text"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                placeholder="Search question text..."
                className="glass-input w-full pl-10 pr-4 py-2 rounded-xl text-xs text-white outline-none"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2 text-xs">
              <select
                value={selectedCategory}
                onChange={(e) => {
                  setSelectedCategory(e.target.value);
                  setPage(1);
                }}
                className="bg-[#202226] border border-[#2C2E33] text-zinc-300 rounded-lg px-3 py-2 outline-none cursor-pointer"
              >
                <option value="all">All Categories</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.slug}>
                    {c.name}
                  </option>
                ))}
              </select>

              <select
                value={selectedDifficulty}
                onChange={(e) => {
                  setSelectedDifficulty(e.target.value);
                  setPage(1);
                }}
                className="bg-[#202226] border border-[#2C2E33] text-zinc-300 rounded-lg px-3 py-2 outline-none cursor-pointer"
              >
                <option value="all">All Difficulties</option>
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>
            </div>
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

            {loading && (
              <div className="flex items-center gap-1.5 text-zinc-400 font-medium">
                <Loader2 className="w-3.5 h-3.5 text-[#FF5722] animate-spin" />
                <span>Loading questions...</span>
              </div>
            )}
          </div>

          {/* Question List Container with Vertical Scrolling */}
          <div className="space-y-3 max-h-[640px] overflow-y-auto pr-2 rounded-2xl">
            {loading && questions.length === 0 ? (
              <div className="glass-panel p-12 text-center text-zinc-400 rounded-2xl border border-[#2C2E33] bg-[#1A1B1E]">
                <Loader2 className="w-8 h-8 animate-spin text-[#FF5722] mx-auto mb-3" />
                <p className="text-sm font-semibold text-white">Loading question bank records...</p>
              </div>
            ) : questions.length === 0 ? (
              <div className="glass-panel p-12 text-center text-zinc-400 rounded-2xl border border-[#2C2E33] bg-[#1A1B1E]">
                <HelpCircle className="w-8 h-8 text-zinc-600 mx-auto mb-3" />
                <p className="text-sm font-semibold text-white">No questions found</p>
                <p className="text-xs text-zinc-500 mt-1">
                  Try adjusting your search criteria or upload questions using the CSV importer.
                </p>
              </div>
            ) : (
              questions.map((q, idx) => (
                <div
                  key={q.id}
                  className="glass-panel p-5 rounded-2xl border border-[#2C2E33] bg-[#1A1B1E] flex flex-col sm:flex-row sm:items-start justify-between gap-4"
                >
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2 text-xs">
                      <span className="px-2.5 py-0.5 rounded-full bg-[#FF5722]/10 border border-[#FF5722]/20 text-[#FF5722] font-semibold capitalize">
                        {q.category?.name || q.categorySlug}
                      </span>
                      <span className="text-zinc-500 font-mono text-[11px]">{q.difficulty}</span>
                      <span className="text-emerald-400 font-mono font-bold">
                        Ans: {q.correctAnswer}
                      </span>
                      {q.isPublished ? (
                        <span className="text-[10px] text-emerald-400 font-semibold">● Published</span>
                      ) : (
                        <span className="text-[10px] text-zinc-500 font-semibold">● Draft</span>
                      )}
                    </div>

                    <p className="font-semibold text-white text-sm leading-relaxed">
                      {idx + 1}. {cleanQuestionText(q.text)}
                    </p>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] text-zinc-400 font-mono">
                      <div>A: {q.optionA}</div>
                      <div>B: {q.optionB}</div>
                      <div>C: {q.optionC}</div>
                      <div>D: {q.optionD}</div>
                    </div>

                    <div className="text-xs text-zinc-400 italic pt-1">
                      <strong className="text-zinc-300">Explanation:</strong> {q.explanation}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 self-end sm:self-start">
                    <button
                      onClick={() => openEdit(q)}
                      className="p-2 rounded-lg bg-[#202226] hover:bg-[#2C2E33] text-zinc-300 transition"
                      title="Edit Question"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(q.id)}
                      className="p-2 rounded-lg bg-[#202226] hover:bg-rose-500/20 text-zinc-400 hover:text-rose-400 transition"
                      title="Delete Question"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Pagination Controls */}
          {pagination.totalPages > 1 && (
            <div className="p-4 rounded-2xl bg-[#1A1B1E] border border-[#2C2E33] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-400 shadow-sm">
              <div className="flex items-center gap-2">
                <span>
                  Page <strong className="text-white font-semibold">{pagination.page}</strong> of{" "}
                  <strong className="text-white font-semibold">{pagination.totalPages}</strong>
                </span>
                <span className="text-zinc-500">
                  ({pagination.total} questions in {selectedCategory === "all" ? "all categories" : selectedCategory})
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1 || loading}
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
                  disabled={page >= pagination.totalPages || loading}
                  className="px-3.5 py-2 rounded-xl bg-[#202226] hover:bg-[#2C2E33] text-zinc-300 disabled:opacity-40 disabled:cursor-not-allowed border border-[#2C2E33] transition flex items-center gap-1.5 font-semibold text-xs"
                >
                  <span>Next Page</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Edit/Create Question Modal */}
          {showModal && (
            <div className="fixed inset-0 bg-[#121316]/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className="glass-panel w-full max-w-xl p-6 rounded-3xl border border-[#2C2E33] bg-[#1A1B1E] space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto">
                <h3 className="text-lg font-bold text-white">
                  {editingQuestion ? "Edit Aptitude Question" : "Create Aptitude Question"}
                </h3>

                <form onSubmit={handleSave} className="space-y-3 text-xs">
                  <div>
                    <label className="text-zinc-300 font-semibold block mb-1">Question Text</label>
                    <textarea
                      required
                      rows={3}
                      value={text}
                      onChange={(e) => setText(e.target.value)}
                      className="glass-input w-full p-2.5 rounded-xl text-white text-xs outline-none resize-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-zinc-300 font-semibold block mb-1">Option A</label>
                      <input
                        type="text"
                        required
                        value={optionA}
                        onChange={(e) => setOptionA(e.target.value)}
                        className="glass-input w-full p-2 rounded-xl text-white text-xs outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-zinc-300 font-semibold block mb-1">Option B</label>
                      <input
                        type="text"
                        required
                        value={optionB}
                        onChange={(e) => setOptionB(e.target.value)}
                        className="glass-input w-full p-2 rounded-xl text-white text-xs outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-zinc-300 font-semibold block mb-1">Option C</label>
                      <input
                        type="text"
                        required
                        value={optionC}
                        onChange={(e) => setOptionC(e.target.value)}
                        className="glass-input w-full p-2 rounded-xl text-white text-xs outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-zinc-300 font-semibold block mb-1">Option D</label>
                      <input
                        type="text"
                        required
                        value={optionD}
                        onChange={(e) => setOptionD(e.target.value)}
                        className="glass-input w-full p-2 rounded-xl text-white text-xs outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="text-zinc-300 font-semibold block mb-1">Correct Answer</label>
                      <select
                        value={correctAnswer}
                        onChange={(e) => setCorrectAnswer(e.target.value)}
                        className="bg-[#202226] border border-[#2C2E33] text-white rounded-xl p-2 w-full outline-none font-bold text-emerald-400"
                      >
                        <option value="A">Option A</option>
                        <option value="B">Option B</option>
                        <option value="C">Option C</option>
                        <option value="D">Option D</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-zinc-300 font-semibold block mb-1">Category</label>
                      <select
                        value={categorySlug}
                        onChange={(e) => setCategorySlug(e.target.value)}
                        className="bg-[#202226] border border-[#2C2E33] text-white rounded-xl p-2 w-full outline-none"
                      >
                        <option value="quantitative">Quantitative</option>
                        <option value="logical">Logical Reasoning</option>
                        <option value="verbal">Verbal Ability</option>
                        <option value="data-interpretation">Data Interpretation</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-zinc-300 font-semibold block mb-1">Difficulty</label>
                      <select
                        value={difficulty}
                        onChange={(e) => setDifficulty(e.target.value)}
                        className="bg-[#202226] border border-[#2C2E33] text-white rounded-xl p-2 w-full outline-none"
                      >
                        <option value="Easy">Easy</option>
                        <option value="Medium">Medium</option>
                        <option value="Hard">Hard</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="text-zinc-300 font-semibold block mb-1">Step-by-Step Explanation</label>
                    <textarea
                      required
                      rows={3}
                      value={explanation}
                      onChange={(e) => setExplanation(e.target.value)}
                      placeholder="Explain how the correct answer was derived..."
                      className="glass-input w-full p-2.5 rounded-xl text-white text-xs outline-none resize-none"
                    />
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <input
                      type="checkbox"
                      id="qPublished"
                      checked={isPublished}
                      onChange={(e) => setIsPublished(e.target.checked)}
                      className="rounded border-[#2C2E33] accent-[#FF5722]"
                    />
                    <label htmlFor="qPublished" className="text-zinc-300 font-semibold">
                      Publish for Student Daily Quizzes & Practice
                    </label>
                  </div>

                  <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#2C2E33]">
                    <button
                      type="button"
                      onClick={() => setShowModal(false)}
                      className="px-4 py-2 rounded-xl text-zinc-400 hover:bg-[#202226] transition"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSaving}
                      className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#FF5722] to-[#F15A24] hover:from-[#F15A24] hover:to-[#ea580c] text-white font-bold transition disabled:opacity-50 shadow-lg shadow-orange-500/20"
                    >
                      {isSaving ? "Saving..." : "Save Question"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* CSV Question Upload & Auto-Sorting Modal */}
          <CsvQuestionUploadModal
            isOpen={showUploadModal}
            onClose={() => setShowUploadModal(false)}
            onUploadSuccess={() => {
              setPage(1);
              fetchQuestions(1);
            }}
          />
        </main>
      </div>
    </div>
  );
}
