"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import StudentSidebar from "@/components/layout/StudentSidebar";
import StudentNavbar from "@/components/layout/StudentNavbar";
import AlgorithmVisualizer from "@/components/dsa/AlgorithmVisualizer";
import {
  ArrowLeft,
  ExternalLink,
  CheckCircle2,
  Clock,
  Circle,
  Bookmark,
  FileText,
  Search,
  Filter,
  PlayCircle,
  BookOpen,
} from "lucide-react";

export default function PatternDetailPage({
  params,
}: {
  params: { slug: string };
}) {
  const { slug } = params;
  const [pattern, setPattern] = useState<any>(null);
  const [filterDifficulty, setFilterDifficulty] = useState<string>("ALL");
  const [filterStatus, setFilterStatus] = useState<string>("ALL");
  const [search, setSearch] = useState<string>("");
  const [activeNoteProblem, setActiveNoteProblem] = useState<any>(null);
  const [noteContent, setNoteContent] = useState<string>("");
  const [isSavingNote, setIsSavingNote] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchPattern = () => {
    fetch(`/api/dsa/patterns/${slug}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.pattern) setPattern(data.pattern);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error("Pattern error:", err);
        setIsLoading(false);
      });
  };

  useEffect(() => {
    fetchPattern();
  }, [slug]);

  const handleStatusChange = async (problemId: string, newStatus: string) => {
    try {
      await fetch(`/api/dsa/problems/${problemId}/status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      // Update local state smoothly
      setPattern((prev: any) => {
        if (!prev) return prev;
        return {
          ...prev,
          problems: prev.problems.map((p: any) =>
            p.id === problemId ? { ...p, status: newStatus } : p
          ),
        };
      });
    } catch (err) {
      console.error("Status update error:", err);
    }
  };

  const handleBookmarkToggle = async (problemId: string, currentBookmarked: boolean) => {
    try {
      await fetch(`/api/dsa/problems/${problemId}/status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookmarked: !currentBookmarked }),
      });

      setPattern((prev: any) => {
        if (!prev) return prev;
        return {
          ...prev,
          problems: prev.problems.map((p: any) =>
            p.id === problemId ? { ...p, bookmarked: !currentBookmarked } : p
          ),
        };
      });
    } catch (err) {
      console.error("Bookmark toggle error:", err);
    }
  };

  const handleSaveNote = async () => {
    if (!activeNoteProblem) return;
    setIsSavingNote(true);

    try {
      await fetch(`/api/dsa/problems/${activeNoteProblem.id}/status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ personalNotes: noteContent }),
      });

      setPattern((prev: any) => {
        if (!prev) return prev;
        return {
          ...prev,
          problems: prev.problems.map((p: any) =>
            p.id === activeNoteProblem.id ? { ...p, personalNotes: noteContent } : p
          ),
        };
      });

      setActiveNoteProblem(null);
      setIsSavingNote(false);
    } catch (err) {
      console.error("Save note error:", err);
      setIsSavingNote(false);
    }
  };

  if (isLoading || !pattern) {
    return (
      <div className="flex min-h-screen bg-[#121316] text-zinc-100">
        <StudentSidebar />
        <div className="flex-1 flex flex-col">
          <StudentNavbar />
          <div className="p-8 flex items-center justify-center flex-1 text-zinc-400">
            Loading pattern curriculum...
          </div>
        </div>
      </div>
    );
  }

  const filteredProblems = pattern.problems.filter((p: any) => {
    const matchesSearch = p.title.toLowerCase().includes(search.toLowerCase());
    if (!matchesSearch) return false;
    if (filterDifficulty !== "ALL" && p.difficulty !== filterDifficulty) return false;
    if (filterStatus !== "ALL" && p.status !== filterStatus) return false;
    return true;
  });

  const solvedCount = pattern.problems.filter((p: any) => p.status === "SOLVED").length;

  return (
    <div className="flex min-h-screen bg-[#121316] text-[#FFFFFF]">
      <StudentSidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <StudentNavbar title={pattern.name} />

        <main className="p-6 md:p-8 space-y-8 flex-1 overflow-y-auto max-w-7xl w-full mx-auto">
          {/* Breadcrumb & Navigation */}
          <div className="flex items-center justify-between">
            <Link
              href="/dsa"
              className="inline-flex items-center gap-2 text-xs font-semibold text-[#9CA3AF] hover:text-white transition"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to all patterns</span>
            </Link>

            <div className="flex items-center gap-3 text-xs">
              <span className="text-[#9CA3AF]">Mastery:</span>
              <strong className="text-emerald-400 font-mono">
                {solvedCount} / {pattern.problems.length} solved
              </strong>
            </div>
          </div>

          {/* Pattern Header Card */}
          <div className="bg-[#1A1B1E] p-6 rounded-2xl border border-[#2C2E33] space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-semibold bg-[#FF5722]/10 text-[#FF5722] border border-[#FF5722]/20">
                Pattern #{pattern.orderIndex}
              </span>
              <span className="text-xs text-[#2C2E33]">•</span>
              <span className="text-xs text-[#9CA3AF]">{pattern.problems.length} Workbook Questions</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {pattern.name}
            </h2>
            <p className="text-sm text-[#9CA3AF] leading-relaxed max-w-3xl">
              {pattern.description || "Master core coding patterns asked in top product and service company interviews."}
            </p>
          </div>

          {/* Interactive Algorithm Visualizer (Conditioned strictly on pattern having visualizerKey) */}
          {pattern.visualizerKey ? (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-[#FF5722] uppercase tracking-wider">
                <PlayCircle className="w-4 h-4" />
                <span>Interactive Algorithm Simulation</span>
              </div>
              <AlgorithmVisualizer
                patternKey={pattern.visualizerKey}
                patternName={pattern.name}
              />
            </div>
          ) : (
            <div className="bg-[#1A1B1E] p-5 rounded-2xl border border-[#2C2E33] text-xs text-[#9CA3AF] flex items-center gap-3">
              <BookOpen className="w-5 h-5 text-[#FF5722] shrink-0" />
              <div>
                <strong className="text-white block font-medium">
                  Curated Pattern Problem Set & Conceptual Roadmap
                </strong>
                Solve the workbook problems below using standard {pattern.name} paradigms. An interactive step visualizer for this specific pattern is planned for future updates.
              </div>
            </div>
          )}

          {/* Problem List Toolbar */}
          <div className="space-y-4 pt-2">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <h3 className="text-xl font-bold text-white tracking-tight">
                  Workbook Problem Set ({pattern.problems.length})
                </h3>
                <p className="text-xs text-[#9CA3AF]">
                  Click any problem to open its official LeetCode / GFG challenge.
                </p>
              </div>

              {/* Filters */}
              <div className="flex flex-wrap items-center gap-2 text-xs">
                {/* Search */}
                <div className="relative w-48">
                  <Search className="w-3.5 h-3.5 text-[#9CA3AF] absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Filter problem..."
                    className="glass-input pl-8 pr-3 py-1.5 rounded-lg text-xs text-white w-full outline-none"
                  />
                </div>

                {/* Difficulty Filter */}
                <select
                  value={filterDifficulty}
                  onChange={(e) => setFilterDifficulty(e.target.value)}
                  className="bg-[#202226] border border-[#2C2E33] text-[#A1A1AA] rounded-lg px-2.5 py-1.5 outline-none cursor-pointer"
                >
                  <option value="ALL">All Difficulties</option>
                  <option value="Easy">Easy</option>
                  <option value="Medium">Medium</option>
                  <option value="Hard">Hard</option>
                </select>

                {/* Status Filter */}
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="bg-[#202226] border border-[#2C2E33] text-[#A1A1AA] rounded-lg px-2.5 py-1.5 outline-none cursor-pointer"
                >
                  <option value="ALL">All Statuses</option>
                  <option value="NOT_STARTED">Not Started</option>
                  <option value="ATTEMPTED">Attempted</option>
                  <option value="SOLVED">Solved</option>
                </select>
              </div>
            </div>

            {/* Problem Table / Cards */}
            <div className="space-y-2.5">
              {filteredProblems.map((prob: any) => {
                const isSolved = prob.status === "SOLVED";
                const isAttempted = prob.status === "ATTEMPTED";

                const diffColor =
                  prob.difficulty === "Easy"
                    ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                    : prob.difficulty === "Hard"
                    ? "bg-rose-500/10 text-rose-400 border-rose-500/20"
                    : "bg-amber-500/10 text-amber-400 border-amber-500/20";

                return (
                  <div
                    key={prob.id}
                    className={`bg-[#1A1B1E] p-4 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                      isSolved
                        ? "border-emerald-500/30 bg-emerald-950/10"
                        : isAttempted
                        ? "border-amber-500/30 bg-amber-950/10"
                        : "border-[#2C2E33] hover:border-[#FF5722]/40"
                    }`}
                  >
                    {/* Left: Problem Info */}
                    <div className="flex items-start sm:items-center gap-3 flex-1 min-w-0">
                      <button
                        onClick={() =>
                          handleStatusChange(
                            prob.id,
                            isSolved ? "NOT_STARTED" : "SOLVED"
                          )
                        }
                        className="mt-0.5 sm:mt-0 p-1 text-[#9CA3AF] hover:text-emerald-400 transition"
                        title={isSolved ? "Mark as Unsolved" : "Mark as Solved"}
                      >
                        {isSolved ? (
                          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                        ) : isAttempted ? (
                          <Clock className="w-5 h-5 text-amber-400" />
                        ) : (
                          <Circle className="w-5 h-5 text-zinc-600" />
                        )}
                      </button>

                      <div className="space-y-1 min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-mono text-[#9CA3AF]">#{prob.orderIndex}</span>
                          <a
                            href={prob.leetcodeUrl || "#"}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-semibold text-white text-sm hover:text-[#FF5722] transition inline-flex items-center gap-1.5 truncate"
                          >
                            <span>{prob.title}</span>
                            {prob.leetcodeUrl && (
                              <ExternalLink className="w-3.5 h-3.5 text-[#9CA3AF] shrink-0" />
                            )}
                          </a>
                          <span
                            className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${diffColor}`}
                          >
                            {prob.difficulty}
                          </span>
                          {prob.subcategory && (
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#202226] text-[#9CA3AF] border border-[#2C2E33]">
                              {prob.subcategory}
                            </span>
                          )}
                          {prob.notes && (
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#FF5722]/10 text-[#FF5722] border border-[#FF5722]/20">
                              {prob.notes}
                            </span>
                          )}
                        </div>

                        {prob.personalNotes && (
                          <div className="text-xs text-[#A1A1AA] italic flex items-center gap-1 mt-1">
                            <FileText className="w-3 h-3 text-[#FF5722]" />
                            <span className="truncate">Note: {prob.personalNotes}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Right: Actions */}
                    <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
                      {/* Notes Button */}
                      <button
                        onClick={() => {
                          setActiveNoteProblem(prob);
                          setNoteContent(prob.personalNotes || "");
                        }}
                        className={`p-2 rounded-lg text-xs font-medium transition flex items-center gap-1.5 ${
                          prob.personalNotes
                            ? "bg-[#FF5722]/20 text-[#FF5722] border border-[#FF5722]/30"
                            : "bg-[#202226] hover:bg-[#2C2E33] text-[#9CA3AF] hover:text-white border border-[#2C2E33]"
                        }`}
                        title="Add/Edit Personal Note"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span className="hidden md:inline">Note</span>
                      </button>

                      {/* Bookmark Toggle */}
                      <button
                        onClick={() => handleBookmarkToggle(prob.id, prob.bookmarked)}
                        className={`p-2 rounded-lg text-xs transition ${
                          prob.bookmarked
                            ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                            : "bg-[#202226] hover:bg-[#2C2E33] text-[#9CA3AF] hover:text-white border border-[#2C2E33]"
                        }`}
                        title={prob.bookmarked ? "Remove Bookmark" : "Bookmark Problem"}
                      >
                        <Bookmark className="w-3.5 h-3.5" />
                      </button>

                      {/* Status Dropdown */}
                      <select
                        value={prob.status}
                        onChange={(e) => handleStatusChange(prob.id, e.target.value)}
                        className="bg-[#202226] border border-[#2C2E33] text-xs text-white rounded-lg px-2.5 py-1.5 outline-none cursor-pointer"
                      >
                        <option value="NOT_STARTED">Not Started</option>
                        <option value="ATTEMPTED">Attempted</option>
                        <option value="SOLVED">Solved</option>
                      </select>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Personal Note Modal */}
          {activeNoteProblem && (
            <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className="bg-[#1A1B1E] w-full max-w-lg p-6 rounded-2xl border border-[#2C2E33] space-y-4 shadow-2xl">
                <div>
                  <h4 className="text-base font-bold text-white">
                    Personal Notes for: {activeNoteProblem.title}
                  </h4>
                  <p className="text-xs text-[#9CA3AF] mt-1">
                    Store tricky edge cases, complexities, or key insights.
                  </p>
                </div>

                <textarea
                  value={noteContent}
                  onChange={(e) => setNoteContent(e.target.value)}
                  placeholder="e.g. Remember to handle negative numbers. Window boundaries must shrink when sum > target..."
                  rows={4}
                  className="bg-[#202226] border border-[#2C2E33] w-full p-3 rounded-xl text-white text-sm outline-none resize-none focus:border-[#FF5722]"
                />

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    onClick={() => setActiveNoteProblem(null)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-[#9CA3AF] hover:bg-[#202226] hover:text-white transition"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveNote}
                    disabled={isSavingNote}
                    className="px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-[#FF5722] to-[#F15A24] hover:from-[#F15A24] hover:to-[#ea580c] text-white shadow-lg shadow-[#FF5722]/25 transition disabled:opacity-50"
                  >
                    {isSavingNote ? "Saving..." : "Save Note"}
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
