"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import StudentSidebar from "@/components/layout/StudentSidebar";
import StudentNavbar from "@/components/layout/StudentNavbar";
import {
  Code2,
  Search,
  CheckCircle2,
  PlayCircle,
  BookOpen,
  ArrowRight,
  Filter,
} from "lucide-react";

export default function DSAPatternsPage() {
  const [patterns, setPatterns] = useState<any[]>([]);
  const [search, setSearch] = useState<string>("");
  const [filterType, setFilterType] = useState<"all" | "visualizer" | "solved">("all");
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    fetch("/api/dsa/patterns")
      .then((res) => res.json())
      .then((data) => {
        if (data.patterns) setPatterns(data.patterns);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error("Patterns error:", err);
        setIsLoading(false);
      });
  }, []);

  const filtered = patterns.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase());
    if (!matchesSearch) return false;
    if (filterType === "visualizer") return Boolean(p.visualizerKey);
    if (filterType === "solved") return p.solvedCount > 0;
    return true;
  });

  return (
    <div className="flex min-h-screen bg-[#121316] text-[#FFFFFF]">
      <StudentSidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <StudentNavbar title="DSA Pattern Academy" />

        <main className="p-6 md:p-8 space-y-6 flex-1 overflow-y-auto max-w-7xl w-full mx-auto">
          {/* Header & Source of Truth Badge */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-white tracking-tight">
                Placement DSA Patterns Cheat Sheet
              </h2>
              <p className="text-xs text-[#9CA3AF] mt-1">
                Preserving original question links, pattern assignments, and algorithmic visualizers.
              </p>
            </div>

            {/* Quick Summary Pill */}
            <div className="bg-[#1A1B1E] px-4 py-2.5 rounded-xl border border-[#2C2E33] flex items-center gap-4 text-xs font-medium">
              <span className="text-[#9CA3AF]">
                Total Patterns: <strong className="text-white">{patterns.length}</strong>
              </span>
              <span className="text-[#2C2E33]">|</span>
              <span className="text-[#9CA3AF]">
                Visualizers Available:{" "}
                <strong className="text-[#FF5722]">
                  {patterns.filter((p) => p.visualizerKey).length}
                </strong>
              </span>
            </div>
          </div>

          {/* Search & Filter Toolbar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-[#1A1B1E] p-3 rounded-2xl border border-[#2C2E33]">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-[#9CA3AF] absolute left-3.5 top-3" />
              <input
                type="text"
                placeholder="Search patterns (e.g. Two Pointers, Binary Search)..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="glass-input w-full pl-10 pr-4 py-2 rounded-xl text-xs text-white outline-none"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                onClick={() => setFilterType("all")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                  filterType === "all"
                    ? "bg-gradient-to-r from-[#FF5722] to-[#F15A24] text-white shadow-md shadow-[#FF5722]/20"
                    : "bg-[#202226] text-[#9CA3AF] hover:text-white border border-[#2C2E33]"
                }`}
              >
                All Patterns ({patterns.length})
              </button>
              <button
                onClick={() => setFilterType("visualizer")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                  filterType === "visualizer"
                    ? "bg-gradient-to-r from-[#FF5722] to-[#F15A24] text-white shadow-md shadow-[#FF5722]/20"
                    : "bg-[#202226] text-[#9CA3AF] hover:text-white border border-[#2C2E33]"
                }`}
              >
                With Animation
              </button>
              <button
                onClick={() => setFilterType("solved")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                  filterType === "solved"
                    ? "bg-gradient-to-r from-[#FF5722] to-[#F15A24] text-white shadow-md shadow-[#FF5722]/20"
                    : "bg-[#202226] text-[#9CA3AF] hover:text-white border border-[#2C2E33]"
                }`}
              >
                In Progress
              </button>
            </div>
          </div>

          {/* Patterns Grid */}
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-44 rounded-2xl bg-[#1A1B1E] animate-pulse border border-[#2C2E33]" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((p) => (
                <Link
                  key={p.id}
                  href={`/dsa/${p.slug}`}
                  className="bg-[#1A1B1E] p-6 rounded-2xl border border-[#2C2E33] hover:border-[#FF5722]/50 transition-all duration-300 flex flex-col justify-between group shadow-lg hover:shadow-[#FF5722]/10"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-mono text-[#9CA3AF]">
                        Pattern #{p.orderIndex}
                      </span>
                      {p.visualizerKey ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#FF5722]/10 text-[#FF5722] border border-[#FF5722]/20">
                          <PlayCircle className="w-3 h-3 text-[#FF5722]" />
                          Interactive Animation
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-[#202226] text-[#9CA3AF] border border-[#2C2E33]">
                          <BookOpen className="w-3 h-3" />
                          Problem Guide
                        </span>
                      )}
                    </div>

                    <h3 className="text-lg font-bold text-white group-hover:text-[#FF5722] transition">
                      {p.name}
                    </h3>
                    <p className="text-xs text-[#9CA3AF] line-clamp-2 leading-relaxed">
                      {p.description || `Master the ${p.name} algorithm pattern.`}
                    </p>
                  </div>

                  <div className="pt-5 mt-4 border-t border-[#2C2E33] space-y-2">
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <span className="text-[#9CA3AF]">Solved:</span>
                      <span className="text-white font-mono">
                        {p.solvedCount} / {p.totalProblems}
                      </span>
                    </div>

                    <div className="w-full bg-[#202226] h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-[#FF5722] to-[#F15A24] h-full rounded-full transition-all"
                        style={{ width: `${p.completionPercentage}%` }}
                      />
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-[#9CA3AF] pt-1">
                      <span>{p.completionPercentage}% completed</span>
                      <span className="text-[#FF5722] font-semibold flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                        <span>Open Pattern</span>
                        <ArrowRight className="w-3 h-3" />
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
