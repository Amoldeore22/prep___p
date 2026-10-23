"use client";

import React, { useState } from "react";
import AdminSidebar from "@/components/layout/AdminSidebar";
import AdminNavbar from "@/components/layout/AdminNavbar";
import {
  FileSpreadsheet,
  CheckCircle2,
  AlertTriangle,
  Play,
  RotateCcw,
  Layers,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
} from "lucide-react";

export default function AdminDSAImportPage() {
  const [previewData, setPreviewData] = useState<any>(null);
  const [commitResult, setCommitResult] = useState<any>(null);
  const [isLoadingPreview, setIsLoadingPreview] = useState<boolean>(false);
  const [isLoadingCommit, setIsLoadingCommit] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>("");

  const handleRunPreview = async () => {
    setIsLoadingPreview(true);
    setErrorMsg("");
    setCommitResult(null);

    try {
      const res = await fetch("/api/admin/dsa/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "preview" }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error || "Failed to load workbook preview");
      } else {
        setPreviewData(data);
      }
      setIsLoadingPreview(false);
    } catch {
      setErrorMsg("Network error connecting to workbook parser.");
      setIsLoadingPreview(false);
    }
  };

  const handleCommitImport = async () => {
    const confirmCommit = window.confirm(
      "Confirm importing workbook data into database? Existing patterns will be updated safely without deleting student progress."
    );
    if (!confirmCommit) return;

    setIsLoadingCommit(true);
    setErrorMsg("");

    try {
      const res = await fetch("/api/admin/dsa/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "commit" }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error || "Failed to commit import");
      } else {
        setCommitResult(data);
      }
      setIsLoadingCommit(false);
    } catch {
      setErrorMsg("Failed to commit import.");
      setIsLoadingCommit(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#121316] text-zinc-100">
      <AdminSidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <AdminNavbar title="Excel Workbook DSA Importer" />

        <main className="p-6 md:p-8 space-y-6 flex-1 overflow-y-auto max-w-7xl w-full mx-auto">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 text-xs font-semibold border border-amber-500/20 mb-2">
                <FileSpreadsheet className="w-3.5 h-3.5" />
                <span>Source of Truth Workbook Engine</span>
              </div>
              <h2 className="text-2xl font-bold text-white tracking-tight">
                Import & Validate DSA Patterns
              </h2>
              <p className="text-xs text-zinc-400 mt-0.5">
                Inspects each pattern, question, and LeetCode link with pre-commit validation.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={handleRunPreview}
                disabled={isLoadingPreview}
                className="px-4 py-2.5 rounded-xl bg-[#202226] hover:bg-[#2C2E33] text-white font-bold text-xs border border-[#3F4248] transition flex items-center gap-2"
              >
                <RotateCcw className={`w-3.5 h-3.5 ${isLoadingPreview ? "animate-spin" : ""}`} />
                <span>{isLoadingPreview ? "Validating..." : "Run Inspection & Preview"}</span>
              </button>

              {previewData && (
                <button
                  onClick={handleCommitImport}
                  disabled={isLoadingCommit}
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/30 transition flex items-center gap-2 disabled:opacity-50"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{isLoadingCommit ? "Committing..." : "Commit Validated Import"}</span>
                </button>
              )}
            </div>
          </div>

          {errorMsg && (
            <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {commitResult && (
            <div className="glass-panel p-6 rounded-2xl border border-emerald-500/40 bg-emerald-950/20 text-emerald-300 space-y-2">
              <div className="flex items-center gap-2 text-base font-bold text-white">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                <span>Import Successfully Committed!</span>
              </div>
              <p className="text-xs text-emerald-400">{commitResult.message}</p>
              <div className="flex items-center gap-4 text-xs font-mono pt-2">
                <span>Committed Patterns: {commitResult.summary?.committedPatterns}</span>
                <span>•</span>
                <span>Committed Problems: {commitResult.summary?.committedProblems}</span>
              </div>
            </div>
          )}

          {/* Validation Summary Cards */}
          {previewData ? (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div className="glass-card p-4 rounded-xl border border-[#2C2E33] bg-[#1A1B1E]">
                  <span className="text-[11px] font-semibold text-zinc-400 block uppercase">
                    Total Patterns
                  </span>
                  <span className="text-2xl font-bold text-white font-mono mt-1 block">
                    {previewData.summary?.totalPatterns}
                  </span>
                </div>
                <div className="glass-card p-4 rounded-xl border border-[#2C2E33] bg-[#1A1B1E]">
                  <span className="text-[11px] font-semibold text-zinc-400 block uppercase">
                    Total Questions
                  </span>
                  <span className="text-2xl font-bold text-[#FF5722] font-mono mt-1 block">
                    {previewData.summary?.totalProblems}
                  </span>
                </div>
                <div className="glass-card p-4 rounded-xl border border-[#2C2E33] bg-[#1A1B1E]">
                  <span className="text-[11px] font-semibold text-zinc-400 block uppercase">
                    Validation Warnings
                  </span>
                  <span className="text-2xl font-bold text-amber-400 font-mono mt-1 block">
                    {previewData.summary?.warningCount}
                  </span>
                </div>
                <div className="glass-card p-4 rounded-xl border border-[#2C2E33] bg-[#1A1B1E]">
                  <span className="text-[11px] font-semibold text-zinc-400 block uppercase">
                    Critical Errors
                  </span>
                  <span className="text-2xl font-bold text-emerald-400 font-mono mt-1 block">
                    {previewData.summary?.errorCount || 0}
                  </span>
                </div>
              </div>

              {/* Warnings callout */}
              {previewData.warnings?.length > 0 && (
                <div className="glass-panel p-5 rounded-2xl border border-amber-500/30 bg-amber-950/10 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-amber-400">
                    <AlertTriangle className="w-4 h-4" />
                    <span>Workbook Safe Handling Warnings ({previewData.warnings.length}):</span>
                  </div>
                  <div className="max-h-40 overflow-y-auto space-y-1 text-[11px] text-amber-200/80 font-mono">
                    {previewData.warnings.slice(0, 10).map((w: string, i: number) => (
                      <div key={i}>• {w}</div>
                    ))}
                    {previewData.warnings.length > 10 && (
                      <div className="text-zinc-500 italic">
                        ...and {previewData.warnings.length - 10} more safe handling notes.
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Patterns Table Preview */}
              <div className="glass-panel rounded-2xl border border-[#2C2E33] overflow-hidden bg-[#1A1B1E]">
                <div className="p-4 border-b border-[#2C2E33] font-bold text-sm text-white">
                  Validated Pattern Inventory
                </div>
                <div className="divide-y divide-[#2C2E33] text-xs">
                  {previewData.patterns?.map((p: any, idx: number) => (
                    <div key={idx} className="p-4 flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2 font-bold text-white text-sm">
                          <span>{p.name}</span>
                          <span className="text-zinc-500 font-mono text-xs">(Row {p.rowNumber})</span>
                        </div>
                        <div className="text-zinc-400 text-[11px] mt-1">
                          Sample problems:{" "}
                          {p.sampleQuestions?.map((q: any) => q.title).join(", ")}
                        </div>
                      </div>

                      <span className="px-3 py-1 rounded-full bg-[#FF5722]/10 border border-[#FF5722]/20 text-[#FF5722] font-mono font-bold">
                        {p.problemCount} Problems
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="glass-panel p-12 rounded-3xl border border-[#2C2E33] bg-[#1A1B1E] text-center space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-[#202226] border border-[#2C2E33] flex items-center justify-center text-zinc-400 mx-auto">
                <FileSpreadsheet className="w-8 h-8 text-amber-400" />
              </div>
              <h3 className="text-lg font-bold text-white">Ready to Inspect Excel Workbook</h3>
              <p className="text-xs text-zinc-400 max-w-md mx-auto">
                Click "Run Inspection & Preview" above to inspect all sheets, pattern rows, question titles, and URLs from <code className="text-amber-300">data/DSA_patterns_Cheat_Sheet.xlsx</code>.
              </p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
