"use client";

import React, { useState, useEffect } from "react";
import AdminSidebar from "@/components/layout/AdminSidebar";
import AdminNavbar from "@/components/layout/AdminNavbar";
import {
  Layers,
  Plus,
  Edit2,
  ExternalLink,
  Search,
  Filter,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

export default function AdminProblemsPage() {
  const [problems, setProblems] = useState<any[]>([]);
  const [patterns, setPatterns] = useState<any[]>([]);
  const [search, setSearch] = useState<string>("");
  const [selectedPattern, setSelectedPattern] = useState<string>("");
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("");
  const [page, setPage] = useState<number>(1);
  const [pagination, setPagination] = useState<any>({});
  const [showModal, setShowModal] = useState<boolean>(false);
  const [editingProblem, setEditingProblem] = useState<any>(null);

  // Form states
  const [title, setTitle] = useState<string>("");
  const [patternId, setPatternId] = useState<string>("");
  const [difficulty, setDifficulty] = useState<string>("Medium");
  const [leetcodeUrl, setLeetcodeUrl] = useState<string>("");
  const [subcategory, setSubcategory] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  const [isSaving, setIsSaving] = useState<boolean>(false);

  const fetchProblems = () => {
    fetch(
      `/api/admin/dsa/problems?search=${encodeURIComponent(
        search
      )}&patternId=${selectedPattern}&difficulty=${selectedDifficulty}&page=${page}&limit=25`
    )
      .then((r) => r.json())
      .then((d) => {
        if (d.problems) {
          setProblems(d.problems);
          setPagination(d.pagination || {});
        }
      });
  };

  useEffect(() => {
    fetch("/api/admin/dsa/patterns")
      .then((r) => r.json())
      .then((d) => {
        if (d.patterns) setPatterns(d.patterns);
      });
  }, []);

  useEffect(() => {
    fetchProblems();
  }, [search, selectedPattern, selectedDifficulty, page]);

  const openEdit = (prob?: any) => {
    if (prob) {
      setEditingProblem(prob);
      setTitle(prob.title);
      setPatternId(prob.patternId);
      setDifficulty(prob.difficulty);
      setLeetcodeUrl(prob.leetcodeUrl || "");
      setSubcategory(prob.subcategory || "");
      setNotes(prob.notes || "");
    } else {
      setEditingProblem(null);
      setTitle("");
      setPatternId(patterns[0]?.id || "");
      setDifficulty("Medium");
      setLeetcodeUrl("");
      setSubcategory("");
      setNotes("");
    }
    setShowModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      await fetch("/api/admin/dsa/problems", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editingProblem?.id,
          title,
          patternId,
          difficulty,
          leetcodeUrl: leetcodeUrl || null,
          subcategory: subcategory || null,
          notes: notes || null,
        }),
      });

      setShowModal(false);
      setIsSaving(false);
      fetchProblems();
    } catch {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#121316] text-zinc-100">
      <AdminSidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <AdminNavbar title="DSA Problem Bank Management" />

        <main className="p-6 md:p-8 space-y-6 flex-1 overflow-y-auto max-w-7xl w-full mx-auto">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-white tracking-tight">Question Bank & Pattern Mapping</h2>
              <p className="text-xs text-zinc-400 mt-0.5">
                Preserve original URLs, edit difficulty, and assign problems to patterns.
              </p>
            </div>

            <button
              onClick={() => openEdit()}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#FF5722] to-[#F15A24] hover:from-[#F15A24] hover:to-[#ea580c] text-white font-bold text-xs shadow-lg shadow-orange-500/20 transition flex items-center gap-2 self-start sm:self-center"
            >
              <Plus className="w-4 h-4" />
              <span>Add Problem Manually</span>
            </button>
          </div>

          {/* Search & Filters */}
          <div className="bg-[#1A1B1E] p-4 rounded-2xl border border-[#2C2E33] flex flex-wrap items-center justify-between gap-4">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-3" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search question title..."
                className="glass-input w-full pl-10 pr-4 py-2 rounded-xl text-xs text-white outline-none"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2 text-xs">
              <select
                value={selectedPattern}
                onChange={(e) => {
                  setSelectedPattern(e.target.value);
                  setPage(1);
                }}
                className="bg-[#202226] border border-[#2C2E33] text-zinc-300 rounded-lg px-3 py-2 outline-none cursor-pointer max-w-[200px]"
              >
                <option value="">All Patterns</option>
                {patterns.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
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
                <option value="">All Difficulties</option>
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>
            </div>
          </div>

          {/* Problems Table */}
          <div className="glass-panel rounded-2xl border border-[#2C2E33] bg-[#1A1B1E] overflow-hidden shadow-2xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#141518] text-zinc-400 uppercase tracking-wider font-semibold border-b border-[#2C2E33]">
                  <tr>
                    <th className="p-4">#</th>
                    <th className="p-4">Question Title</th>
                    <th className="p-4">Assigned Pattern</th>
                    <th className="p-4">Difficulty</th>
                    <th className="p-4">Subcategory</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#2C2E33] text-zinc-300">
                  {problems.map((prob, idx) => (
                    <tr key={prob.id} className="hover:bg-[#202226]/50 transition">
                      <td className="p-4 font-mono text-zinc-500">{prob.orderIndex || idx + 1}</td>
                      <td className="p-4">
                        <div className="font-semibold text-white flex items-center gap-1.5">
                          <span>{prob.title}</span>
                          {prob.leetcodeUrl && (
                            <a
                              href={prob.leetcodeUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-zinc-500 hover:text-[#FF5722]"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                          )}
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="px-2.5 py-0.5 rounded-full bg-[#FF5722]/10 text-[#FF5722] border border-[#FF5722]/20 font-medium">
                          {prob.pattern?.name || "Unassigned"}
                        </span>
                      </td>
                      <td className="p-4">
                        <span
                          className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                            prob.difficulty === "Easy"
                              ? "bg-emerald-500/10 text-emerald-400"
                              : prob.difficulty === "Hard"
                              ? "bg-rose-500/10 text-rose-400"
                              : "bg-amber-500/10 text-amber-400"
                          }`}
                        >
                          {prob.difficulty}
                        </span>
                      </td>
                      <td className="p-4 text-zinc-400">{prob.subcategory || "—"}</td>
                      <td className="p-4 text-right">
                        <button
                          onClick={() => openEdit(prob)}
                          className="p-1.5 rounded-lg bg-[#202226] hover:bg-[#2C2E33] text-zinc-300 transition"
                          title="Edit Problem"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            {pagination.totalPages > 1 && (
              <div className="p-4 border-t border-[#2C2E33] flex items-center justify-between text-xs text-zinc-400">
                <span>
                  Showing Page {pagination.page} of {pagination.totalPages} ({pagination.total} total)
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="p-1.5 rounded-lg bg-[#202226] hover:bg-[#2C2E33] disabled:opacity-40 transition"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
                    disabled={page >= pagination.totalPages}
                    className="p-1.5 rounded-lg bg-[#202226] hover:bg-[#2C2E33] disabled:opacity-40 transition"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Edit Problem Modal */}
          {showModal && (
            <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className="glass-panel w-full max-w-lg p-6 rounded-3xl border border-[#2C2E33] bg-[#1A1B1E] space-y-4 shadow-2xl">
                <h3 className="text-lg font-bold text-white">
                  {editingProblem ? "Edit Question Mapping" : "Add New Problem"}
                </h3>

                <form onSubmit={handleSave} className="space-y-3.5 text-xs">
                  <div>
                    <label className="text-zinc-300 font-semibold block mb-1">Question Title</label>
                    <input
                      type="text"
                      required
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="glass-input w-full p-2.5 rounded-xl text-white text-xs outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-zinc-300 font-semibold block mb-1">Assigned Pattern</label>
                    <select
                      value={patternId}
                      onChange={(e) => setPatternId(e.target.value)}
                      required
                      className="bg-[#202226] border border-[#2C2E33] text-white rounded-xl p-2.5 w-full outline-none"
                    >
                      {patterns.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-zinc-300 font-semibold block mb-1">Difficulty</label>
                      <select
                        value={difficulty}
                        onChange={(e) => setDifficulty(e.target.value)}
                        className="bg-[#202226] border border-[#2C2E33] text-white rounded-xl p-2.5 w-full outline-none"
                      >
                        <option value="Easy">Easy</option>
                        <option value="Medium">Medium</option>
                        <option value="Hard">Hard</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-zinc-300 font-semibold block mb-1">Subcategory (optional)</label>
                      <input
                        type="text"
                        value={subcategory}
                        onChange={(e) => setSubcategory(e.target.value)}
                        placeholder="e.g. Traversal"
                        className="glass-input w-full p-2.5 rounded-xl text-white text-xs outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-zinc-300 font-semibold block mb-1">LeetCode / Resource URL</label>
                    <input
                      type="url"
                      value={leetcodeUrl}
                      onChange={(e) => setLeetcodeUrl(e.target.value)}
                      placeholder="https://leetcode.com/problems/..."
                      className="glass-input w-full p-2.5 rounded-xl text-white text-xs outline-none font-mono"
                    />
                  </div>

                  <div className="flex items-center justify-end gap-3 pt-3">
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
                      {isSaving ? "Saving..." : "Save Problem"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
