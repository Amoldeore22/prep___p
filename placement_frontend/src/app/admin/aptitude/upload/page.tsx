"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import AdminSidebar from "@/components/layout/AdminSidebar";
import AdminNavbar from "@/components/layout/AdminNavbar";
import {
  Upload,
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Download,
  Calculator,
  Brain,
  BarChart3,
  BookOpen,
  ArrowRight,
  RefreshCw,
  FileText,
  ChevronLeft,
  Check,
} from "lucide-react";

interface UploadResult {
  success: boolean;
  totalAdded: number;
  totalProcessed: number;
  byCategory: {
    "Quantitative Aptitude": number;
    "Logical Reasoning": number;
    "Data Interpretation": number;
    "Verbal Ability": number;
  };
  messages: string[];
  message: string;
  rejectedRows?: Array<{ row: number; reason: string }>;
  sampleQuestions?: Array<{
    category: string;
    difficulty: string;
    text: string;
    correctAnswer: string;
  }>;
}

export default function AdminAptitudeUploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadProgressMsg, setUploadProgressMsg] = useState<string>("");
  const [errorMsg, setErrorMsg] = useState<string>("");
  const [uploadResult, setUploadResult] = useState<UploadResult | null>(null);
  const [stats, setStats] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchStats = async () => {
    try {
      const res = await fetch("/api/admin/aptitude/upload");
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch {
      // Ignore initial stats load errors
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    setErrorMsg("");

    const droppedFiles = e.dataTransfer.files;
    if (droppedFiles && droppedFiles.length > 0) {
      const selected = droppedFiles[0];
      if (!selected.name.toLowerCase().endsWith(".csv")) {
        setErrorMsg("Please upload a file with a .csv extension.");
        return;
      }
      setFile(selected);
      setUploadResult(null);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrorMsg("");
    if (e.target.files && e.target.files.length > 0) {
      const selected = e.target.files[0];
      if (!selected.name.toLowerCase().endsWith(".csv")) {
        setErrorMsg("Please upload a file with a .csv extension.");
        return;
      }
      setFile(selected);
      setUploadResult(null);
    }
  };

  const handleDownloadTemplate = () => {
    window.open("/api/admin/aptitude/upload?template=true", "_blank");
  };

  const handleReset = () => {
    setFile(null);
    setUploadResult(null);
    setErrorMsg("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setErrorMsg("Please select a .csv file first.");
      return;
    }

    setIsUploading(true);
    setErrorMsg("");
    setUploadResult(null);
    setUploadProgressMsg("Reading and parsing CSV contents using csv-parse...");

    try {
      const formData = new FormData();
      formData.append("file", file);

      const timer = setTimeout(() => {
        setUploadProgressMsg(
          "Auto-sorting questions into Quantitative Aptitude, Logical Reasoning, Data Interpretation, and Verbal Ability DB..."
        );
      }, 700);

      const res = await fetch("/api/admin/aptitude/upload", {
        method: "POST",
        body: formData,
      });

      clearTimeout(timer);
      const data = await res.json();

      if (!res.ok) {
        setErrorMsg(data.error || "Failed to process and sort the uploaded CSV.");
        if (data.rejectedRows && data.rejectedRows.length > 0) {
          setUploadResult({
            success: false,
            totalAdded: 0,
            totalProcessed: data.rejectedRows.length,
            byCategory: {
              "Quantitative Aptitude": 0,
              "Logical Reasoning": 0,
              "Data Interpretation": 0,
              "Verbal Ability": 0,
            },
            messages: [],
            message: data.error,
            rejectedRows: data.rejectedRows,
          });
        }
      } else {
        setUploadResult(data);
        fetchStats();
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Network error while uploading CSV file.");
    } finally {
      setIsUploading(false);
      setUploadProgressMsg("");
    }
  };

  return (
    <div className="flex min-h-screen bg-[#121316] text-zinc-100">
      <AdminSidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <AdminNavbar title="Aptitude CSV Auto-Sorting Importer" />

        <main className="p-6 md:p-8 space-y-6 flex-1 overflow-y-auto max-w-7xl w-full mx-auto">
          {/* Header & Back Link */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Link
                  href="/admin/aptitude/questions"
                  className="text-xs text-zinc-400 hover:text-white inline-flex items-center gap-1 transition"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  <span>Back to Question Bank</span>
                </Link>
                <span className="text-zinc-600">•</span>
                <span className="text-xs text-[#FF5722] font-semibold">Batch CSV Importer</span>
              </div>
              <h2 className="text-2xl font-bold text-white tracking-tight">
                CSV Upload and Auto-Sorting Module
              </h2>
              <p className="text-xs text-zinc-400 mt-0.5">
                Upload practice questions in CSV format. Questions are automatically validated,
                mapped, and routed into their corresponding category databases.
              </p>
            </div>

            <button
              onClick={handleDownloadTemplate}
              className="px-4 py-2.5 rounded-xl bg-[#202226] hover:bg-[#2C2E33] text-white font-bold text-xs border border-[#3F4248] transition flex items-center gap-2 self-start sm:self-center shadow-sm"
            >
              <Download className="w-4 h-4 text-[#FF5722]" />
              <span>Download CSV Template</span>
            </button>
          </div>

          {/* Auto-Sorting Routing Legend */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-[#1A1B1E] border border-[#2C2E33] space-y-2">
              <div className="flex items-center justify-between text-zinc-400">
                <span className="text-[10px] font-bold uppercase tracking-wider">Target DB 1</span>
                <Calculator className="w-4 h-4 text-amber-400" />
              </div>
              <div className="text-base font-bold text-white">Quantitative Aptitude</div>
              <p className="text-[11px] text-zinc-400">
                Category: <code className="text-amber-300">"Quantitative Aptitude"</code>
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-[#1A1B1E] border border-[#2C2E33] space-y-2">
              <div className="flex items-center justify-between text-zinc-400">
                <span className="text-[10px] font-bold uppercase tracking-wider">Target DB 2</span>
                <Brain className="w-4 h-4 text-purple-400" />
              </div>
              <div className="text-base font-bold text-white">Logical Reasoning</div>
              <p className="text-[11px] text-zinc-400">
                Category: <code className="text-purple-300">"Logical Reasoning"</code>
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-[#1A1B1E] border border-[#2C2E33] space-y-2">
              <div className="flex items-center justify-between text-zinc-400">
                <span className="text-[10px] font-bold uppercase tracking-wider">Target DB 3</span>
                <BarChart3 className="w-4 h-4 text-cyan-400" />
              </div>
              <div className="text-base font-bold text-white">Data Interpretation</div>
              <p className="text-[11px] text-zinc-400">
                Category: <code className="text-cyan-300">"Data Interpretation"</code>
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-[#1A1B1E] border border-[#2C2E33] space-y-2">
              <div className="flex items-center justify-between text-zinc-400">
                <span className="text-[10px] font-bold uppercase tracking-wider">Target DB 4</span>
                <BookOpen className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="text-base font-bold text-white">Verbal Ability</div>
              <p className="text-[11px] text-zinc-400">
                Category: <code className="text-emerald-300">"Verbal Ability"</code>
              </p>
            </div>
          </div>

          {/* Error Message */}
          {errorMsg && (
            <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
              <div>
                <strong className="block font-semibold text-rose-200">Upload Issue</strong>
                <span>{errorMsg}</span>
              </div>
            </div>
          )}

          {/* Success Feedback View */}
          {uploadResult && uploadResult.success ? (
            <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-emerald-500/40 bg-[#1A1B1E] space-y-6">
              {/* Main Success Callout */}
              <div className="p-6 rounded-2xl border border-emerald-500/30 bg-emerald-950/20 text-emerald-300 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">
                      Practice Questions Successfully Auto-Sorted & Saved!
                    </h3>
                    <p className="text-xs text-emerald-300/90">{uploadResult.message}</p>
                  </div>
                </div>

                {/* Specific Category Messages as explicitly requested */}
                <div className="bg-emerald-950/50 border border-emerald-500/20 rounded-xl p-4 space-y-2.5 mt-4">
                  <div className="text-[11px] font-bold text-emerald-200 uppercase tracking-wider">
                    Category Breakdown:
                  </div>
                  {uploadResult.messages && uploadResult.messages.length > 0 ? (
                    uploadResult.messages.map((msg, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-2 text-xs font-semibold text-emerald-100"
                      >
                        <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span>{msg}</span>
                      </div>
                    ))
                  ) : (
                    <div className="text-xs text-emerald-200">
                      Successfully added {uploadResult.totalAdded} questions.
                    </div>
                  )}
                </div>
              </div>

              {/* Category Count Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-4 rounded-xl bg-[#202226] border border-[#2C2E33] space-y-1">
                  <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">
                    Quantitative Aptitude
                  </span>
                  <span className="text-2xl font-bold font-mono text-white">
                    +{uploadResult.byCategory["Quantitative Aptitude"] || 0}
                  </span>
                  <span className="text-[11px] text-zinc-500 block">Saved to Quantitative DB</span>
                </div>

                <div className="p-4 rounded-xl bg-[#202226] border border-[#2C2E33] space-y-1">
                  <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">
                    Logical Reasoning
                  </span>
                  <span className="text-2xl font-bold font-mono text-white">
                    +{uploadResult.byCategory["Logical Reasoning"] || 0}
                  </span>
                  <span className="text-[11px] text-zinc-500 block">Saved to Logical DB</span>
                </div>

                <div className="p-4 rounded-xl bg-[#202226] border border-[#2C2E33] space-y-1">
                  <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">
                    Data Interpretation
                  </span>
                  <span className="text-2xl font-bold font-mono text-white">
                    +{uploadResult.byCategory["Data Interpretation"] || 0}
                  </span>
                  <span className="text-[11px] text-zinc-500 block">Saved to Data Interp DB</span>
                </div>

                <div className="p-4 rounded-xl bg-[#202226] border border-[#2C2E33] space-y-1">
                  <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">
                    Verbal Ability
                  </span>
                  <span className="text-2xl font-bold font-mono text-white">
                    +{uploadResult.byCategory["Verbal Ability"] || 0}
                  </span>
                  <span className="text-[11px] text-zinc-500 block">Saved to Verbal DB</span>
                </div>
              </div>

              {/* Sample Questions Table */}
              {uploadResult.sampleQuestions && uploadResult.sampleQuestions.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                    Sample Newly Added Questions Preview
                  </h4>
                  <div className="border border-[#2C2E33] rounded-2xl overflow-hidden divide-y divide-[#2C2E33] bg-[#202226]">
                    {uploadResult.sampleQuestions.map((q, idx) => (
                      <div key={idx} className="p-3.5 flex items-start justify-between gap-4 text-xs">
                        <div className="space-y-1 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 rounded-full bg-[#FF5722]/10 text-[#FF5722] text-[10px] font-bold">
                              {q.category}
                            </span>
                            <span className="text-zinc-500 text-[10px] font-mono">{q.difficulty}</span>
                            <span className="text-emerald-400 text-[10px] font-mono font-bold">
                              Ans: {q.correctAnswer}
                            </span>
                          </div>
                          <p className="text-white text-xs font-medium">{q.text}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Skipped rows if any */}
              {uploadResult.rejectedRows && uploadResult.rejectedRows.length > 0 && (
                <div className="p-4 rounded-xl border border-amber-500/30 bg-amber-950/20 space-y-2">
                  <div className="text-xs font-bold text-amber-300 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-amber-400" />
                    <span>Skipped Invalid Rows ({uploadResult.rejectedRows.length}):</span>
                  </div>
                  <div className="max-h-32 overflow-y-auto space-y-1 text-[11px] font-mono text-amber-200/80">
                    {uploadResult.rejectedRows.map((r, i) => (
                      <div key={i}>
                        • Row {r.row}: {r.reason}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-[#2C2E33]">
                <button
                  type="button"
                  onClick={handleReset}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#202226] hover:bg-[#2C2E33] text-zinc-300 text-xs font-semibold border border-[#2C2E33] transition flex items-center justify-center gap-2"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Upload Another CSV</span>
                </button>

                <Link
                  href="/admin/aptitude/questions"
                  className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#FF5722] to-[#F15A24] hover:from-[#F15A24] hover:to-[#ea580c] text-white font-bold text-xs shadow-lg shadow-orange-500/20 transition flex items-center justify-center gap-2"
                >
                  <span>Go to Question Bank</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ) : (
            /* Upload Box */
            <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-[#2C2E33] bg-[#1A1B1E] space-y-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Drag and Drop Zone */}
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-3xl p-10 text-center cursor-pointer transition-all duration-200 ${
                    isDragging
                      ? "border-[#FF5722] bg-[#FF5722]/5 scale-[0.99]"
                      : file
                      ? "border-emerald-500/50 bg-emerald-950/10"
                      : "border-[#3F4248] hover:border-[#FF5722]/60 bg-[#141518] hover:bg-[#1A1B1E]"
                  }`}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".csv,text/csv"
                    onChange={handleFileChange}
                    className="hidden"
                    disabled={isUploading}
                  />

                  {file ? (
                    <div className="space-y-3">
                      <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mx-auto text-emerald-400">
                        <FileText className="w-8 h-8" />
                      </div>
                      <div>
                        <h4 className="text-base font-bold text-white">{file.name}</h4>
                        <p className="text-xs text-zinc-400 mt-1">
                          {(file.size / 1024).toFixed(1)} KB • Ready for automated parsing and routing
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleReset();
                        }}
                        className="text-xs font-semibold text-rose-400 hover:text-rose-300 underline"
                      >
                        Choose another file
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="w-16 h-16 rounded-2xl bg-[#202226] border border-[#2C2E33] flex items-center justify-center mx-auto text-zinc-400">
                        <Upload className="w-7 h-7 text-[#FF5722]" />
                      </div>
                      <div>
                        <h4 className="text-base font-bold text-white">
                          Drag and drop your practice questions CSV here
                        </h4>
                        <p className="text-xs text-zinc-400 mt-1 max-w-md mx-auto leading-relaxed">
                          Click to select a file from your computer. Headers must include Category,
                          Difficulty, Question Text, Option A, Option B, Option C, Option D, Correct
                          Answer, and Solution/Explanation.
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Loading Indicator State */}
                {isUploading && (
                  <div className="p-5 rounded-2xl bg-[#202226] border border-[#FF5722]/30 flex items-center gap-3 animate-pulse">
                    <Loader2 className="w-5 h-5 text-[#FF5722] animate-spin shrink-0" />
                    <div className="space-y-0.5">
                      <strong className="text-xs font-bold text-white block">
                        Processing Practice Questions...
                      </strong>
                      <span className="text-[11px] text-zinc-400">{uploadProgressMsg}</span>
                    </div>
                  </div>
                )}

                {/* Upload Actions */}
                <div className="flex items-center justify-between pt-2">
                  <div className="text-[11px] text-zinc-400 flex items-center gap-1.5">
                    <FileSpreadsheet className="w-3.5 h-3.5 text-[#FF5722]" />
                    <span>Dual-compatible parser (.csv, RFC 4180 standard)</span>
                  </div>

                  <button
                    type="submit"
                    disabled={!file || isUploading}
                    className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#FF5722] to-[#F15A24] hover:from-[#F15A24] hover:to-[#ea580c] text-white font-bold text-xs shadow-lg shadow-orange-500/20 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {isUploading ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Processing & Auto-Sorting...</span>
                      </>
                    ) : (
                      <>
                        <Upload className="w-3.5 h-3.5" />
                        <span>Upload & Auto-Sort CSV</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Data Mapping Documentation Card */}
          <div className="glass-panel p-6 rounded-2xl border border-[#2C2E33] bg-[#1A1B1E] space-y-4">
            <h3 className="text-sm font-bold text-white">Expected CSV Format Specification</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-[#2C2E33] text-zinc-400">
                    <th className="py-2 pr-4 font-semibold">Column Name</th>
                    <th className="py-2 pr-4 font-semibold">Type</th>
                    <th className="py-2 pr-4 font-semibold">Accepted Values / Description</th>
                    <th className="py-2 font-semibold">Target Database Field</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#2C2E33] text-zinc-300 font-mono text-[11px]">
                  <tr>
                    <td className="py-2.5 pr-4 text-white font-semibold">Category</td>
                    <td className="py-2.5 pr-4 text-amber-400">String</td>
                    <td className="py-2.5 pr-4 font-sans text-zinc-300">
                      "Quantitative Aptitude", "Logical Reasoning", "Data Interpretation", or "Verbal Ability"
                    </td>
                    <td className="py-2.5 text-[#FF5722]">categorySlug (Auto-sorted)</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 pr-4 text-white font-semibold">Difficulty</td>
                    <td className="py-2.5 pr-4 text-amber-400">String</td>
                    <td className="py-2.5 pr-4 font-sans text-zinc-300">"Easy", "Medium", "Hard" (default: Medium)</td>
                    <td className="py-2.5 text-zinc-400">difficulty</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 pr-4 text-white font-semibold">Question Text</td>
                    <td className="py-2.5 pr-4 text-amber-400">String</td>
                    <td className="py-2.5 pr-4 font-sans text-zinc-300">Full practice question text (min 5 chars)</td>
                    <td className="py-2.5 text-zinc-400">text</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 pr-4 text-white font-semibold">Option A, B, C, D</td>
                    <td className="py-2.5 pr-4 text-amber-400">String</td>
                    <td className="py-2.5 pr-4 font-sans text-zinc-300">The 4 multiple choice options</td>
                    <td className="py-2.5 text-zinc-400">optionA, optionB, optionC, optionD</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 pr-4 text-white font-semibold">Correct Answer</td>
                    <td className="py-2.5 pr-4 text-amber-400">String</td>
                    <td className="py-2.5 pr-4 font-sans text-zinc-300">"A", "B", "C", or "D" (or option text)</td>
                    <td className="py-2.5 text-emerald-400">correctAnswer</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 pr-4 text-white font-semibold">Solution/Explanation</td>
                    <td className="py-2.5 pr-4 text-amber-400">String</td>
                    <td className="py-2.5 pr-4 font-sans text-zinc-300">Step-by-step mathematical or logical solution</td>
                    <td className="py-2.5 text-zinc-400">explanation</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
