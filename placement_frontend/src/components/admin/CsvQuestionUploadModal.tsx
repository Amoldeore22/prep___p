"use client";

import React, { useState, useRef } from "react";
import {
  Upload,
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Download,
  X,
  Calculator,
  Brain,
  BarChart3,
  BookOpen,
  ArrowRight,
  RefreshCw,
  FileText,
} from "lucide-react";

interface CsvUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUploadSuccess?: () => void;
}

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

export default function CsvQuestionUploadModal({
  isOpen,
  onClose,
  onUploadSuccess,
}: CsvUploadModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadProgressMsg, setUploadProgressMsg] = useState<string>("");
  const [errorMsg, setErrorMsg] = useState<string>("");
  const [uploadResult, setUploadResult] = useState<UploadResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

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
    setUploadProgressMsg("Uploading & parsing CSV contents...");

    try {
      const formData = new FormData();
      formData.append("file", file);

      // Processing message transition
      const timer = setTimeout(() => {
        setUploadProgressMsg(
          "Auto-sorting questions into Quantitative, Logical, Data Interpretation, and Verbal Ability DB..."
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
        if (onUploadSuccess) {
          onUploadSuccess();
        }
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Network error while uploading CSV file.");
    } finally {
      setIsUploading(false);
      setUploadProgressMsg("");
    }
  };

  return (
    <div className="fixed inset-0 bg-[#121316]/85 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="glass-panel w-full max-w-2xl bg-[#1A1B1E] border border-[#2C2E33] rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl relative max-h-[92vh] overflow-y-auto my-8">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 pb-4 border-b border-[#2C2E33]">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FF5722]/10 text-[#FF5722] text-xs font-semibold border border-[#FF5722]/20 mb-1">
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Aptitude Practice Question Importer</span>
            </div>
            <h3 className="text-xl font-bold text-white tracking-tight">
              CSV Upload & Auto-Sorting Module
            </h3>
            <p className="text-xs text-zinc-400">
              Upload a .csv practice question sheet (supports bulk processing of 50+ rows per file without truncation). Questions are parsed and auto-sorted into their
              respective category databases.
            </p>
          </div>

          <button
            onClick={onClose}
            disabled={isUploading}
            className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-[#202226] transition disabled:opacity-50"
            title="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Error Alert */}
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
          <div className="space-y-6">
            {/* Main Success Callout */}
            <div className="p-6 rounded-2xl border border-emerald-500/40 bg-emerald-950/20 text-emerald-300 space-y-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-white">
                    CSV Processed & Auto-Sorted Successfully!
                  </h4>
                  <p className="text-xs text-emerald-300/90">{uploadResult.message}</p>
                </div>
              </div>

              {/* Specific Category Messages as explicitly requested */}
              <div className="bg-emerald-950/40 border border-emerald-500/20 rounded-xl p-4 space-y-2 mt-3">
                <div className="text-[11px] font-bold text-emerald-200 uppercase tracking-wider">
                  Category Distribution Summary:
                </div>
                {uploadResult.messages && uploadResult.messages.length > 0 ? (
                  uploadResult.messages.map((msg, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-2 text-xs font-medium text-emerald-100"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span>{msg}</span>
                    </div>
                  ))
                ) : (
                  <div className="text-xs text-emerald-200">
                    Successfully processed {uploadResult.totalAdded} questions.
                  </div>
                )}
              </div>
            </div>

            {/* Category Breakdown Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {/* Quantitative */}
              <div className="p-3.5 rounded-xl bg-[#202226] border border-[#2C2E33] space-y-1">
                <div className="flex items-center justify-between text-zinc-400">
                  <span className="text-[10px] font-bold uppercase tracking-wider">Quantitative</span>
                  <Calculator className="w-3.5 h-3.5 text-amber-400" />
                </div>
                <div className="text-xl font-bold font-mono text-white">
                  +{uploadResult.byCategory["Quantitative Aptitude"] || 0}
                </div>
                <div className="text-[10px] text-zinc-500">Route: Quantitative DB</div>
              </div>

              {/* Logical */}
              <div className="p-3.5 rounded-xl bg-[#202226] border border-[#2C2E33] space-y-1">
                <div className="flex items-center justify-between text-zinc-400">
                  <span className="text-[10px] font-bold uppercase tracking-wider">Logical</span>
                  <Brain className="w-3.5 h-3.5 text-purple-400" />
                </div>
                <div className="text-xl font-bold font-mono text-white">
                  +{uploadResult.byCategory["Logical Reasoning"] || 0}
                </div>
                <div className="text-[10px] text-zinc-500">Route: Logical Reasoning DB</div>
              </div>

              {/* Data Interpretation */}
              <div className="p-3.5 rounded-xl bg-[#202226] border border-[#2C2E33] space-y-1">
                <div className="flex items-center justify-between text-zinc-400">
                  <span className="text-[10px] font-bold uppercase tracking-wider">Data Interp.</span>
                  <BarChart3 className="w-3.5 h-3.5 text-cyan-400" />
                </div>
                <div className="text-xl font-bold font-mono text-white">
                  +{uploadResult.byCategory["Data Interpretation"] || 0}
                </div>
                <div className="text-[10px] text-zinc-500">Route: Data Interp. DB</div>
              </div>

              {/* Verbal */}
              <div className="p-3.5 rounded-xl bg-[#202226] border border-[#2C2E33] space-y-1">
                <div className="flex items-center justify-between text-zinc-400">
                  <span className="text-[10px] font-bold uppercase tracking-wider">Verbal</span>
                  <BookOpen className="w-3.5 h-3.5 text-emerald-400" />
                </div>
                <div className="text-xl font-bold font-mono text-white">
                  +{uploadResult.byCategory["Verbal Ability"] || 0}
                </div>
                <div className="text-[10px] text-zinc-500">Route: Verbal Ability DB</div>
              </div>
            </div>

            {/* Warnings / Skipped Rows if any */}
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

            {/* Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-[#2C2E33]">
              <button
                type="button"
                onClick={handleReset}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-[#202226] hover:bg-[#2C2E33] text-zinc-300 text-xs font-semibold border border-[#2C2E33] transition flex items-center justify-center gap-2"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Upload Another CSV</span>
              </button>

              <button
                type="button"
                onClick={onClose}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#FF5722] to-[#F15A24] hover:from-[#F15A24] hover:to-[#ea580c] text-white font-bold text-xs shadow-lg shadow-orange-500/20 transition flex items-center justify-center gap-2"
              >
                <span>Done & View Question Bank</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ) : (
          /* Form View */
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Auto-Sorting Routing Legend */}
            <div className="bg-[#202226] border border-[#2C2E33] rounded-2xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-zinc-300 uppercase tracking-wider">
                  Auto-Sorting Routing Rules
                </span>
                <button
                  type="button"
                  onClick={handleDownloadTemplate}
                  className="text-xs font-semibold text-[#FF5722] hover:text-[#ea580c] inline-flex items-center gap-1.5 transition"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Sample CSV Template</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 rounded-xl bg-[#1A1B1E] border border-[#2C2E33] flex items-center gap-2.5">
                  <Calculator className="w-4 h-4 text-amber-400 shrink-0" />
                  <div>
                    <span className="text-zinc-200 font-semibold block text-[11px]">
                      "Quantitative Aptitude"
                    </span>
                    <span className="text-[10px] text-zinc-400">Routes to Quantitative DB</span>
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-[#1A1B1E] border border-[#2C2E33] flex items-center gap-2.5">
                  <Brain className="w-4 h-4 text-purple-400 shrink-0" />
                  <div>
                    <span className="text-zinc-200 font-semibold block text-[11px]">
                      "Logical Reasoning"
                    </span>
                    <span className="text-[10px] text-zinc-400">Routes to Logical Reasoning DB</span>
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-[#1A1B1E] border border-[#2C2E33] flex items-center gap-2.5">
                  <BarChart3 className="w-4 h-4 text-cyan-400 shrink-0" />
                  <div>
                    <span className="text-zinc-200 font-semibold block text-[11px]">
                      "Data Interpretation"
                    </span>
                    <span className="text-[10px] text-zinc-400">Routes to Data Interpretation DB</span>
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-[#1A1B1E] border border-[#2C2E33] flex items-center gap-2.5">
                  <BookOpen className="w-4 h-4 text-emerald-400 shrink-0" />
                  <div>
                    <span className="text-zinc-200 font-semibold block text-[11px]">
                      "Verbal Ability"
                    </span>
                    <span className="text-[10px] text-zinc-400">Routes to Verbal Ability DB</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Drag & Drop Upload Zone */}
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-3xl p-8 text-center cursor-pointer transition-all duration-200 ${
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
                  <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mx-auto text-emerald-400">
                    <FileText className="w-7 h-7" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">{file.name}</h4>
                    <p className="text-[11px] text-zinc-400 mt-0.5">
                      {(file.size / 1024).toFixed(1)} KB • Ready for parsing & auto-sorting
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleReset();
                    }}
                    className="text-[11px] font-semibold text-rose-400 hover:text-rose-300 underline"
                  >
                    Choose different file
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="w-14 h-14 rounded-2xl bg-[#202226] border border-[#2C2E33] flex items-center justify-center mx-auto text-zinc-400 group-hover:text-white transition">
                    <Upload className="w-6 h-6 text-[#FF5722]" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">
                      Drag & drop your CSV file here, or{" "}
                      <span className="text-[#FF5722] hover:underline">browse</span>
                    </h4>
                    <p className="text-[11px] text-zinc-400 mt-1 max-w-sm mx-auto">
                      Supports .csv files with columns: Category, Difficulty, Question Text, Option A,
                      Option B, Option C, Option D, Correct Answer, Solution/Explanation
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

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#2C2E33]">
              <button
                type="button"
                onClick={onClose}
                disabled={isUploading}
                className="px-4 py-2.5 rounded-xl text-zinc-400 hover:text-white hover:bg-[#202226] transition text-xs font-semibold disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!file || isUploading}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#FF5722] to-[#F15A24] hover:from-[#F15A24] hover:to-[#ea580c] text-white font-bold text-xs shadow-lg shadow-orange-500/20 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Processing & Sorting...</span>
                  </>
                ) : (
                  <>
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload & Auto-Sort Questions</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
