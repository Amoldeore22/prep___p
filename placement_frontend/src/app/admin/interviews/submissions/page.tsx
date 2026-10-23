"use client";

import React, { useState, useEffect } from "react";
import AdminSidebar from "@/components/layout/AdminSidebar";
import AdminNavbar from "@/components/layout/AdminNavbar";
import {
  FileCheck,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Clock,
  Building,
  User,
  MessageSquare,
  Sparkles,
  ChevronRight,
  X,
} from "lucide-react";

interface Submission {
  id: string;
  companyName: string;
  jobRole: string;
  roundsCount: number;
  difficulty: string;
  roundsDetails: string;
  questionsAsked: string;
  preparationTips: string | null;
  status: "PENDING" | "APPROVED" | "REJECTED" | "NEEDS_REVISION";
  adminFeedback: string | null;
  createdAt: string;
  user: {
    id: string;
    name: string;
    email: string;
    department: string | null;
  };
}

export default function AdminInterviewSubmissionsPage() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>("ALL");
  const [search, setSearch] = useState("");
  const [selectedSub, setSelectedSub] = useState<Submission | null>(null);
  const [feedback, setFeedback] = useState("");
  const [moderating, setModerating] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");

  const loadSubmissions = async () => {
    try {
      setLoading(true);
      const url = filterStatus === "ALL" 
        ? "/api/admin/interviews/submissions" 
        : `/api/admin/interviews/submissions?status=${filterStatus}`;
      const res = await fetch(url);
      const json = await res.json();
      if (res.ok) {
        setSubmissions(json.submissions || []);
      }
    } catch {
      console.error("Failed to load submissions");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSubmissions();
  }, [filterStatus]);

  const handleModerate = async (newStatus: "APPROVED" | "REJECTED" | "NEEDS_REVISION") => {
    if (!selectedSub) return;
    try {
      setModerating(true);
      const res = await fetch(`/api/admin/interviews/submissions/${selectedSub.id}/moderate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: newStatus,
          adminFeedback: feedback,
        }),
      });
      const json = await res.json();
      if (res.ok) {
        setStatusMessage(`Submission marked as ${newStatus}`);
        setSelectedSub(null);
        setFeedback("");
        loadSubmissions();
      } else {
        alert(json.error || "Failed to update status");
      }
    } catch {
      alert("Network error moderating submission");
    } finally {
      setModerating(false);
    }
  };

  const filtered = submissions.filter((s) => {
    const q = search.toLowerCase();
    return (
      s.companyName.toLowerCase().includes(q) ||
      s.jobRole.toLowerCase().includes(q) ||
      s.user.name.toLowerCase().includes(q) ||
      s.user.email.toLowerCase().includes(q)
    );
  });

  const pendingCount = submissions.filter((s) => s.status === "PENDING").length;

  return (
    <div className="flex min-h-screen bg-[#121316] text-zinc-100">
      <AdminSidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <AdminNavbar title="Interview Submissions Moderation" />

        <main className="flex-1 p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold mb-2">
                <Clock className="w-3.5 h-3.5" />
                <span>{pendingCount} Pending Review</span>
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-white">Student Interview Experience Moderation</h1>
              <p className="text-zinc-400 text-sm mt-1">
                Verify student-submitted placement interview experiences before making them public to the campus.
              </p>
            </div>
          </div>

          {statusMessage && (
            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                <span>{statusMessage}</span>
              </div>
              <button onClick={() => setStatusMessage("")} className="text-zinc-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Filters */}
          <div className="p-4 rounded-2xl bg-[#1A1B1E] border border-[#2C2E33] flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-3" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by student, company, role..."
                className="w-full bg-[#202226] border border-[#2C2E33] rounded-xl pl-10 pr-4 py-2 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-[#FF5722]"
              />
            </div>

            {/* Status Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
              {[
                { label: "All", val: "ALL" },
                { label: "Pending", val: "PENDING" },
                { label: "Approved", val: "APPROVED" },
                { label: "Needs Revision", val: "NEEDS_REVISION" },
                { label: "Rejected", val: "REJECTED" },
              ].map((pill) => (
                <button
                  key={pill.val}
                  onClick={() => setFilterStatus(pill.val)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                    filterStatus === pill.val
                      ? "bg-gradient-to-r from-[#FF5722] to-[#F15A24] text-white shadow-md shadow-orange-500/20"
                      : "bg-[#202226] text-zinc-400 border border-[#2C2E33] hover:text-white"
                  }`}
                >
                  {pill.label}
                </button>
              ))}
            </div>
          </div>

          {/* Submissions List */}
          {loading ? (
            <div className="p-12 text-center text-zinc-400">Loading submissions...</div>
          ) : filtered.length === 0 ? (
            <div className="p-12 text-center rounded-2xl bg-[#1A1B1E] border border-[#2C2E33] text-zinc-400">
              <FileCheck className="w-10 h-10 mx-auto text-zinc-500 mb-3" />
              <p className="font-semibold text-zinc-300">No submissions found</p>
              <p className="text-xs text-zinc-500 mt-1">
                Student submissions will appear here for verification.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filtered.map((sub) => {
                const isPending = sub.status === "PENDING";
                const isApproved = sub.status === "APPROVED";
                const isRevision = sub.status === "NEEDS_REVISION";

                return (
                  <div
                    key={sub.id}
                    className="p-5 rounded-2xl bg-[#1A1B1E] border border-[#2C2E33] hover:border-[#3F4248] transition flex flex-col md:flex-row md:items-center justify-between gap-5"
                  >
                    <div className="space-y-2 max-w-2xl">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-md text-xs font-bold uppercase bg-[#FF5722]/10 text-[#FF5722] border border-[#FF5722]/20 flex items-center gap-1.5">
                          <Building className="w-3.5 h-3.5" />
                          {sub.companyName}
                        </span>
                        <span className="text-sm font-bold text-white">{sub.jobRole}</span>
                        <span
                          className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                            isApproved
                              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                              : isPending
                              ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                              : isRevision
                              ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20"
                              : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                          }`}
                        >
                          {sub.status.replace("_", " ")}
                        </span>
                      </div>

                      <div className="flex items-center gap-4 text-xs text-zinc-400">
                        <span className="flex items-center gap-1">
                          <User className="w-3.5 h-3.5 text-zinc-500" />
                          <span className="text-zinc-300 font-medium">{sub.user.name}</span> (
                          {sub.user.department || sub.user.email})
                        </span>
                        <span>•</span>
                        <span>{sub.roundsCount} Rounds</span>
                        <span>•</span>
                        <span className="text-zinc-500">{new Date(sub.createdAt).toLocaleDateString()}</span>
                      </div>

                      <p className="text-xs text-zinc-300 line-clamp-2">
                        <span className="font-semibold text-zinc-400">Questions: </span>
                        {sub.questionsAsked}
                      </p>

                      {sub.adminFeedback && (
                        <div className="p-2.5 rounded-xl bg-[#202226] border border-[#2C2E33] text-xs text-zinc-400">
                          <span className="font-semibold text-[#FF5722]">Feedback: </span>
                          {sub.adminFeedback}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-3 shrink-0 self-end md:self-center">
                      <button
                        onClick={() => {
                          setSelectedSub(sub);
                          setFeedback(sub.adminFeedback || "");
                        }}
                        className="px-4 py-2 rounded-xl bg-[#202226] hover:bg-[#2C2E33] text-white text-xs font-semibold flex items-center gap-1.5 transition border border-[#2C2E33]"
                      >
                        <span>Review & Moderate</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Moderation Modal */}
          {selectedSub && (
            <div className="fixed inset-0 z-50 bg-[#121316]/80 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="bg-[#1A1B1E] border border-[#2C2E33] rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6 space-y-6 shadow-2xl">
                <div className="flex items-center justify-between border-b border-[#2C2E33] pb-4">
                  <div>
                    <h2 className="text-lg font-bold text-white flex items-center gap-2">
                      <FileCheck className="w-5 h-5 text-[#FF5722]" />
                      <span>
                        {selectedSub.companyName} — {selectedSub.jobRole}
                      </span>
                    </h2>
                    <p className="text-xs text-zinc-400 mt-0.5">
                      Submitted by {selectedSub.user.name} ({selectedSub.user.email})
                    </p>
                  </div>
                  <button
                    onClick={() => setSelectedSub(null)}
                    className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-[#202226] transition"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Submission Content */}
                <div className="space-y-4 text-xs text-zinc-300">
                  <div className="grid grid-cols-2 gap-4 p-3.5 rounded-xl bg-[#202226] border border-[#2C2E33]">
                    <div>
                      <span className="text-zinc-500 font-semibold">Total Rounds:</span>
                      <p className="text-white font-medium text-sm mt-0.5">{selectedSub.roundsCount}</p>
                    </div>
                    <div>
                      <span className="text-zinc-500 font-semibold">Difficulty Rating:</span>
                      <p className="text-white font-medium text-sm mt-0.5">{selectedSub.difficulty}</p>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold text-zinc-200 mb-1">Rounds Breakdown & Structure:</h4>
                    <div className="p-3.5 rounded-xl bg-[#202226] border border-[#2C2E33] whitespace-pre-wrap leading-relaxed">
                      {selectedSub.roundsDetails}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold text-zinc-200 mb-1">Questions Asked:</h4>
                    <div className="p-3.5 rounded-xl bg-[#202226] border border-[#2C2E33] whitespace-pre-wrap leading-relaxed">
                      {selectedSub.questionsAsked}
                    </div>
                  </div>

                  {selectedSub.preparationTips && (
                    <div>
                      <h4 className="font-semibold text-zinc-200 mb-1">Preparation Strategy & Tips:</h4>
                      <div className="p-3.5 rounded-xl bg-[#202226] border border-[#2C2E33] whitespace-pre-wrap leading-relaxed">
                        {selectedSub.preparationTips}
                      </div>
                    </div>
                  )}

                  {/* Feedback Box */}
                  <div className="pt-2">
                    <label className="block font-semibold text-zinc-200 mb-1.5">
                      Admin Feedback or Revision Guidance (Optional)
                    </label>
                    <textarea
                      rows={3}
                      value={feedback}
                      onChange={(e) => setFeedback(e.target.value)}
                      placeholder="e.g. Approved with gratitude, or please specify time complexity required in Round 2..."
                      className="w-full bg-[#202226] border border-[#2C2E33] rounded-xl p-3 text-xs text-white focus:outline-none focus:border-[#FF5722]"
                    />
                  </div>
                </div>

                {/* Moderation Action Buttons */}
                <div className="flex flex-wrap items-center justify-end gap-3 pt-4 border-t border-[#2C2E33]">
                  <button
                    type="button"
                    onClick={() => setSelectedSub(null)}
                    className="px-4 py-2.5 rounded-xl border border-[#2C2E33] text-zinc-300 hover:bg-[#202226] text-xs font-semibold transition"
                  >
                    Cancel
                  </button>

                  <button
                    type="button"
                    disabled={moderating}
                    onClick={() => handleModerate("REJECTED")}
                    className="px-4 py-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 hover:bg-rose-500/20 text-xs font-semibold transition flex items-center gap-1.5"
                  >
                    <XCircle className="w-4 h-4" />
                    <span>Reject</span>
                  </button>

                  <button
                    type="button"
                    disabled={moderating}
                    onClick={() => handleModerate("NEEDS_REVISION")}
                    className="px-4 py-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/20 text-xs font-semibold transition flex items-center gap-1.5"
                  >
                    <AlertCircle className="w-4 h-4" />
                    <span>Request Revision</span>
                  </button>

                  <button
                    type="button"
                    disabled={moderating}
                    onClick={() => handleModerate("APPROVED")}
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold transition shadow-lg shadow-emerald-600/20 flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Approve & Publish to Campus</span>
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
