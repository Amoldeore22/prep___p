"use client";

import React, { useState, useEffect } from "react";
import StudentSidebar from "@/components/layout/StudentSidebar";
import StudentNavbar from "@/components/layout/StudentNavbar";
import {
  Video,
  Play,
  FileCheck,
  Building,
  PlusCircle,
  ExternalLink,
  Search,
  CheckCircle2,
  Clock,
  Sparkles,
  HelpCircle,
} from "lucide-react";

export default function InterviewPrepPage() {
  const [activeTab, setActiveTab] = useState<"videos" | "experiences" | "mysubmissions">("videos");
  const [videos, setVideos] = useState<any[]>([]);
  const [experiences, setExperiences] = useState<any[]>([]);
  const [mySubmissions, setMySubmissions] = useState<any[]>([]);
  const [showSubmitModal, setShowSubmitModal] = useState<boolean>(false);

  // Submission form state
  const [companyName, setCompanyName] = useState("");
  const [jobRole, setJobRole] = useState("");
  const [roundsSummary, setRoundsSummary] = useState("");
  const [questionsAsked, setQuestionsAsked] = useState("");
  const [preparationStrategy, setPreparationStrategy] = useState("");
  const [difficulty, setDifficulty] = useState("Medium");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitSuccessMsg, setSubmitSuccessMsg] = useState("");

  const loadData = () => {
    fetch("/api/interviews/videos")
      .then((r) => r.json())
      .then((d) => setVideos(d.videos || []));

    fetch("/api/interviews/experiences")
      .then((r) => r.json())
      .then((d) => setExperiences(d.experiences || []));

    fetch("/api/interviews/submissions")
      .then((r) => r.json())
      .then((d) => setMySubmissions(d.submissions || []));
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateSubmission = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitSuccessMsg("");

    try {
      const res = await fetch("/api/interviews/submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companyName,
          jobRole,
          roundsSummary,
          questionsAsked,
          preparationStrategy,
          difficulty,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setSubmitSuccessMsg(data.message);
        setCompanyName("");
        setJobRole("");
        setRoundsSummary("");
        setQuestionsAsked("");
        setPreparationStrategy("");
        loadData();
        setTimeout(() => setShowSubmitModal(false), 2000);
      }
      setIsSubmitting(false);
    } catch {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#121316] text-zinc-100">
      <StudentSidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <StudentNavbar title="Interview Preparation & Insights" />

        <main className="p-6 md:p-8 space-y-6 flex-1 overflow-y-auto max-w-7xl w-full mx-auto">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FF5722]/10 text-[#FF5722] text-xs font-semibold border border-[#FF5722]/20 mb-2">
                <Video className="w-3.5 h-3.5" />
                <span>Placement Video & Experience Hub</span>
              </div>
              <h2 className="text-2xl font-bold text-white tracking-tight">
                Interview Preparation Library
              </h2>
              <p className="text-xs text-zinc-400 mt-1">
                Learn from curated video tutorials, OA walkthroughs, and peer interview experiences.
              </p>
            </div>

            <button
              onClick={() => setShowSubmitModal(true)}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#FF5722] to-[#F15A24] hover:from-[#F15A24] hover:to-[#ea580c] text-white text-xs font-bold shadow-lg shadow-orange-500/20 transition flex items-center gap-2 self-start sm:self-center"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Share My Interview Experience</span>
            </button>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-2 border-b border-[#2C2E33] pb-3">
            <button
              onClick={() => setActiveTab("videos")}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition flex items-center gap-2 ${
                activeTab === "videos"
                  ? "bg-gradient-to-r from-[#FF5722] to-[#F15A24] text-white shadow-lg shadow-orange-500/20"
                  : "bg-[#202226] text-zinc-400 hover:text-white border border-[#2C2E33]"
              }`}
            >
              <Video className="w-4 h-4" />
              <span>Preparation Videos ({videos.length})</span>
            </button>
            <button
              onClick={() => setActiveTab("experiences")}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition flex items-center gap-2 ${
                activeTab === "experiences"
                  ? "bg-gradient-to-r from-[#FF5722] to-[#F15A24] text-white shadow-lg shadow-orange-500/20"
                  : "bg-[#202226] text-zinc-400 hover:text-white border border-[#2C2E33]"
              }`}
            >
              <FileCheck className="w-4 h-4" />
              <span>Approved Experiences ({experiences.length})</span>
            </button>
            <button
              onClick={() => setActiveTab("mysubmissions")}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition flex items-center gap-2 ${
                activeTab === "mysubmissions"
                  ? "bg-gradient-to-r from-[#FF5722] to-[#F15A24] text-white shadow-lg shadow-orange-500/20"
                  : "bg-[#202226] text-zinc-400 hover:text-white border border-[#2C2E33]"
              }`}
            >
              <Clock className="w-4 h-4" />
              <span>My Moderation Submissions ({mySubmissions.length})</span>
            </button>
          </div>

          {/* Tab 1: Preparation Videos */}
          {activeTab === "videos" && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {videos.map((vid) => (
                <div
                  key={vid.id}
                  className="glass-card rounded-2xl border border-[#2C2E33] bg-[#1A1B1E] overflow-hidden flex flex-col justify-between group hover:border-[#FF5722]/50 transition-all duration-300"
                >
                  <div className="p-5 space-y-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="px-2 py-0.5 rounded-full bg-[#FF5722]/10 text-[#FF5722] font-semibold border border-[#FF5722]/20">
                        {vid.companyName}
                      </span>
                      <span className="text-zinc-500 font-mono text-[11px]">{vid.round}</span>
                    </div>

                    <h3 className="font-bold text-white text-base group-hover:text-[#FF5722] transition leading-snug">
                      {vid.title}
                    </h3>

                    <p className="text-xs text-zinc-400 line-clamp-3 leading-relaxed">
                      {vid.description}
                    </p>
                  </div>

                  <div className="p-5 pt-0">
                    <a
                      href={vid.videoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-2.5 rounded-xl bg-[#202226] group-hover:bg-[#FF5722] text-zinc-200 group-hover:text-white text-xs font-semibold transition flex items-center justify-center gap-2"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>Watch Tutorial Video &rarr;</span>
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Tab 2: Approved Experiences */}
          {activeTab === "experiences" && (
            <div className="space-y-4">
              {experiences.map((exp) => (
                <div
                  key={exp.id}
                  className="glass-panel p-6 rounded-2xl border border-[#2C2E33] bg-[#1A1B1E] space-y-4"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-base font-bold text-white">{exp.companyName}</span>
                        <span className="text-xs text-zinc-500">•</span>
                        <span className="text-xs text-[#FF5722] font-semibold">{exp.jobRole}</span>
                      </div>
                      <span className="text-xs text-zinc-500">
                        Shared by {exp.user?.name || "Student"} ({exp.user?.department || "CSE"})
                      </span>
                    </div>

                    <span
                      className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold border ${
                        exp.difficulty === "Hard"
                          ? "bg-rose-500/10 text-rose-400 border-rose-500/30"
                          : "bg-amber-500/10 text-amber-400 border-amber-500/30"
                      }`}
                    >
                      {exp.difficulty} Interview
                    </span>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div>
                      <strong className="text-zinc-300 block mb-0.5">Rounds Summary:</strong>
                      <p className="text-zinc-400 leading-relaxed">{exp.roundsSummary}</p>
                    </div>

                    <div>
                      <strong className="text-zinc-300 block mb-0.5">Questions Asked:</strong>
                      <p className="text-zinc-400 leading-relaxed">{exp.questionsAsked}</p>
                    </div>

                    {exp.preparationStrategy && (
                      <div>
                        <strong className="text-zinc-300 block mb-0.5">Preparation Strategy:</strong>
                        <p className="text-zinc-400 leading-relaxed">{exp.preparationStrategy}</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Tab 3: My Moderation Submissions */}
          {activeTab === "mysubmissions" && (
            <div className="space-y-4">
              {mySubmissions.length === 0 ? (
                <div className="text-center py-12 text-zinc-500 text-xs">
                  You haven't submitted any interview experiences yet.
                </div>
              ) : (
                mySubmissions.map((sub) => (
                  <div
                    key={sub.id}
                    className="glass-panel p-5 rounded-2xl border border-[#2C2E33] bg-[#1A1B1E] flex items-center justify-between"
                  >
                    <div>
                      <div className="font-bold text-white text-sm">
                        {sub.companyName} — {sub.jobRole}
                      </div>
                      <div className="text-xs text-zinc-400 mt-0.5">
                        Submitted on: {new Date(sub.createdAt).toLocaleDateString()}
                      </div>
                      {sub.adminFeedback && (
                        <div className="text-xs text-amber-300 mt-1 italic">
                          Feedback: {sub.adminFeedback}
                        </div>
                      )}
                    </div>

                    <span
                      className={`text-xs px-3 py-1 rounded-full font-bold border ${
                        sub.status === "APPROVED"
                          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                          : sub.status === "REJECTED"
                          ? "bg-rose-500/10 text-rose-400 border-rose-500/30"
                          : sub.status === "NEEDS_REVISION"
                          ? "bg-amber-500/10 text-amber-400 border-amber-500/30"
                          : "bg-[#202226] text-zinc-300 border-[#2C2E33]"
                      }`}
                    >
                      {sub.status}
                    </span>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Experience Submission Modal */}
          {showSubmitModal && (
            <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className="glass-panel w-full max-w-xl p-6 rounded-3xl border border-[#2C2E33] bg-[#1A1B1E] space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto">
                <div>
                  <h3 className="text-lg font-bold text-white">Share Your Interview Experience</h3>
                  <p className="text-xs text-zinc-400 mt-1">
                    Your submission will be moderated and reviewed by the Placement Admin before publication.
                  </p>
                </div>

                {submitSuccessMsg ? (
                  <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>{submitSuccessMsg}</span>
                  </div>
                ) : (
                  <form onSubmit={handleCreateSubmission} className="space-y-3.5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-semibold text-zinc-300 block mb-1">Company</label>
                        <input
                          type="text"
                          required
                          value={companyName}
                          onChange={(e) => setCompanyName(e.target.value)}
                          placeholder="e.g. Amazon"
                          className="glass-input w-full p-2.5 rounded-xl text-white text-xs outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-zinc-300 block mb-1">Job Role</label>
                        <input
                          type="text"
                          required
                          value={jobRole}
                          onChange={(e) => setJobRole(e.target.value)}
                          placeholder="e.g. SDE-1"
                          className="glass-input w-full p-2.5 rounded-xl text-white text-xs outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-zinc-300 block mb-1">Rounds Summary</label>
                      <textarea
                        required
                        value={roundsSummary}
                        onChange={(e) => setRoundsSummary(e.target.value)}
                        placeholder="e.g. 1 OA on HackerRank + 2 Technical DSA rounds + 1 HR round"
                        rows={2}
                        className="glass-input w-full p-2.5 rounded-xl text-white text-xs outline-none resize-none"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-zinc-300 block mb-1">Questions Asked</label>
                      <textarea
                        required
                        value={questionsAsked}
                        onChange={(e) => setQuestionsAsked(e.target.value)}
                        placeholder="e.g. Round 1: Two Sum variation with target difference, Binary Search on Rotated Array..."
                        rows={3}
                        className="glass-input w-full p-2.5 rounded-xl text-white text-xs outline-none resize-none"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-zinc-300 block mb-1">Preparation Tips</label>
                      <textarea
                        value={preparationStrategy}
                        onChange={(e) => setPreparationStrategy(e.target.value)}
                        placeholder="e.g. Practiced Sliding Window and Two Pointers from the Cheat Sheet..."
                        rows={2}
                        className="glass-input w-full p-2.5 rounded-xl text-white text-xs outline-none resize-none"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-zinc-300 block mb-1">Difficulty</label>
                      <select
                        value={difficulty}
                        onChange={(e) => setDifficulty(e.target.value)}
                        className="bg-[#202226] border border-[#2C2E33] text-xs text-white rounded-xl p-2.5 w-full outline-none"
                      >
                        <option value="Easy">Easy</option>
                        <option value="Medium">Medium</option>
                        <option value="Hard">Hard</option>
                      </select>
                    </div>

                    <div className="flex items-center justify-end gap-3 pt-3">
                      <button
                        type="button"
                        onClick={() => setShowSubmitModal(false)}
                        className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-400 hover:bg-[#202226] transition"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#FF5722] to-[#F15A24] hover:from-[#F15A24] hover:to-[#ea580c] text-white text-xs font-bold shadow-lg shadow-orange-500/20 transition disabled:opacity-50"
                      >
                        {isSubmitting ? "Submitting..." : "Submit for Moderation"}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
