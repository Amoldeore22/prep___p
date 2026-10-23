"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import StudentSidebar from "@/components/layout/StudentSidebar";
import StudentNavbar from "@/components/layout/StudentNavbar";
import VideoPlayer, { getEmbedUrl } from "./VideoPlayer";
import {
  Plus,
  Search,
  Video,
  ExternalLink,
  Trash2,
  CheckCircle2,
  AlertCircle,
  X,
  Layers,
  Database,
  FileCode2,
  TerminalSquare,
  Sparkles,
  Loader2,
} from "lucide-react";

export type SubjectKey = "CPP" | "OOPS" | "DBMS" | "SQL";

interface VideoItem {
  id: string;
  subject: SubjectKey;
  topicName: string;
  videoUrl: string;
  createdAt: string;
}

export const SUBJECT_INFO: Record<
  SubjectKey,
  {
    key: SubjectKey;
    title: string;
    fullName: string;
    description: string;
    icon: React.ComponentType<{ className?: string }>;
    accentColor: string;
    route: string;
  }
> = {
  CPP: {
    key: "CPP",
    title: "C++",
    fullName: "C++ & Standard Template Library (STL)",
    description:
      "Deep dive into C++ syntax, memory pointers, STL algorithms, containers, and competitive programming paradigms.",
    icon: FileCode2,
    accentColor: "#3B82F6",
    route: "/prephub/cpp",
  },
  OOPS: {
    key: "OOPS",
    title: "OOPS",
    fullName: "Object-Oriented Programming (OOP)",
    description:
      "Master the 4 core pillars: encapsulation, abstraction, inheritance, polymorphism, and solid architecture principles.",
    icon: Layers,
    accentColor: "#A855F7",
    route: "/prephub/oops",
  },
  DBMS: {
    key: "DBMS",
    title: "DBMS",
    fullName: "Database Management Systems (DBMS)",
    description:
      "Understand relational algebra, ACID transactions, normalization (1NF-BCNF), concurrency control, and indexing.",
    icon: Database,
    accentColor: "#10B981",
    route: "/prephub/dbms",
  },
  SQL: {
    key: "SQL",
    title: "SQL",
    fullName: "Structured Query Language (SQL)",
    description:
      "Master complex joins, subqueries, aggregates, window functions, and real-world interview database query problems.",
    icon: TerminalSquare,
    accentColor: "#F59E0B",
    route: "/prephub/sql",
  },
};

export default function PrepHubSubjectView({ subject }: { subject: SubjectKey }) {
  const currentInfo = SUBJECT_INFO[subject] || SUBJECT_INFO.CPP;
  const SubjectIcon = currentInfo.icon;

  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form state
  const [topicName, setTopicName] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [toastMsg, setToastMsg] = useState("");

  const topicInputRef = useRef<HTMLInputElement>(null);

  const fetchVideos = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/prephub/videos?subject=${subject}`);
      const data = await res.json();
      if (res.ok && data.videos) {
        setVideos(data.videos);
      }
    } catch (err) {
      console.error("Failed to fetch videos:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVideos();
  }, [subject]);

  // Focus topic name input and listen for ESC key when modal opens
  useEffect(() => {
    if (isModalOpen) {
      setTimeout(() => {
        topicInputRef.current?.focus();
      }, 100);

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Escape" && !submitting) {
          setIsModalOpen(false);
        }
      };
      window.addEventListener("keydown", handleKeyDown);
      return () => window.removeEventListener("keydown", handleKeyDown);
    }
  }, [isModalOpen, submitting]);

  const handleOpenModal = () => {
    setErrorMsg("");
    setTopicName("");
    setVideoUrl("");
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    if (submitting) return;
    setIsModalOpen(false);
    setErrorMsg("");
    setTopicName("");
    setVideoUrl("");
  };

  const handleAddVideo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topicName.trim()) {
      setErrorMsg("Please enter a Topic Name.");
      return;
    }
    if (!videoUrl.trim()) {
      setErrorMsg("Please enter a Video Link.");
      return;
    }

    try {
      setSubmitting(true);
      setErrorMsg("");

      // Automatically tagged with the current subject page (e.g. OOPS, CPP, DBMS, SQL)
      const res = await fetch("/api/prephub/videos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject: subject,
          topicName: topicName.trim(),
          videoUrl: videoUrl.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMsg(data.error || "Failed to save video.");
        setSubmitting(false);
        return;
      }

      // Seamless update: Close modal, clear form fields, and refresh video list immediately
      const savedTopic = topicName.trim();
      setTopicName("");
      setVideoUrl("");
      setIsModalOpen(false);
      setSubmitting(false);

      // Refresh video list/grid so newly added video card appears immediately
      await fetchVideos();

      // Show toast confirmation
      setToastMsg(`"${savedTopic}" has been added to ${currentInfo.title}!`);
      setTimeout(() => setToastMsg(""), 4000);
    } catch {
      setErrorMsg("Network error saving video. Please try again.");
      setSubmitting(false);
    }
  };

  const handleDeleteVideo = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to remove the video for "${name}"?`)) return;

    try {
      const res = await fetch(`/api/prephub/videos?id=${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setVideos((prev) => prev.filter((v) => v.id !== id));
        setToastMsg(`Video removed successfully.`);
        setTimeout(() => setToastMsg(""), 3000);
      } else {
        alert("Failed to delete video.");
      }
    } catch {
      alert("Error deleting video.");
    }
  };

  const filteredVideos = videos.filter((v) =>
    v.topicName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const previewEmbed = videoUrl.trim() ? getEmbedUrl(videoUrl.trim()) : null;

  return (
    <div className="flex min-h-screen bg-[#121316] text-[#FFFFFF]">
      <StudentSidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <StudentNavbar title={`Prep Hub • ${currentInfo.title}`} />

        <main className="p-4 sm:p-6 md:p-8 space-y-6 md:space-y-8 flex-1 overflow-y-auto max-w-7xl w-full mx-auto">
          {/* Toast Notification */}
          {toastMsg && (
            <div className="flex items-center gap-2.5 p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-sm shadow-xl animate-in fade-in slide-in-from-top-2 duration-200">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              <span className="font-medium">{toastMsg}</span>
            </div>
          )}

          {/* Header Banner */}
          <div className="relative overflow-hidden rounded-3xl p-6 sm:p-8 bg-gradient-to-r from-[#1A1B1E] via-[#202226] to-[#1A1B1E] border border-[#2C2E33] shadow-2xl">
            <div className="relative z-10 space-y-2 max-w-3xl">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight">
                {currentInfo.fullName}
              </h1>
              <p className="text-sm text-[#9CA3AF] leading-relaxed">
                {currentInfo.description}
              </p>
            </div>

            {/* Background Glow */}
            <div
              className="absolute -right-20 -bottom-20 w-80 h-80 rounded-full blur-3xl opacity-15 pointer-events-none"
              style={{ backgroundColor: currentInfo.accentColor }}
            />
          </div>

          {/* Subject Navigation Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
            {(["CPP", "OOPS", "DBMS", "SQL"] as SubjectKey[]).map((subjKey) => {
              const info = SUBJECT_INFO[subjKey];
              const Icon = info.icon;
              const isActive = subjKey === subject;

              return (
                <Link
                  key={subjKey}
                  href={info.route}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
                    isActive
                      ? "bg-gradient-to-r from-[#FF5722] to-[#F15A24] text-white shadow-md shadow-[#FF5722]/25"
                      : "bg-[#1A1B1E] text-[#9CA3AF] border border-[#2C2E33] hover:text-white hover:bg-[#202226]"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{info.title}</span>
                </Link>
              );
            })}
          </div>

          {/* Search and Counts Filter Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 p-4 rounded-2xl bg-[#1A1B1E] border border-[#2C2E33]">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={`Search ${currentInfo.title} topics...`}
                className="w-full bg-[#121316] border border-[#2C2E33] focus:border-[#FF5722] rounded-xl pl-10 pr-4 py-2 text-xs sm:text-sm text-white placeholder-zinc-500 focus:outline-none transition"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <div className="flex items-center justify-between sm:justify-end gap-3 text-xs text-[#9CA3AF]">
              <span>
                Showing <strong className="text-white font-bold">{filteredVideos.length}</strong> {filteredVideos.length === 1 ? "video" : "videos"}
              </span>
              <button
                type="button"
                onClick={handleOpenModal}
                className="sm:hidden inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#FF5722] text-white text-xs font-semibold"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Add</span>
              </button>
            </div>
          </div>

          {/* Videos Grid */}
          {loading ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="rounded-2xl border border-[#2C2E33] bg-[#1A1B1E] p-5 space-y-4 animate-pulse"
                >
                  <div className="h-6 w-3/4 bg-[#202226] rounded-lg" />
                  <div className="aspect-video w-full bg-[#202226] rounded-xl" />
                </div>
              ))}
            </div>
          ) : filteredVideos.length === 0 ? (
            <div className="p-12 text-center rounded-3xl bg-[#1A1B1E] border border-[#2C2E33] space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-[#202226] border border-[#2C2E33] flex items-center justify-center mx-auto text-[#FF5722]">
                <Video className="w-7 h-7" />
              </div>
              <div className="space-y-1 max-w-md mx-auto">
                <h3 className="text-base font-bold text-white">
                  {searchQuery ? "No matching topics found" : `No videos yet for ${currentInfo.title}`}
                </h3>
                <p className="text-xs text-[#9CA3AF]">
                  {searchQuery
                    ? `No video matches "${searchQuery}". Try a different keyword.`
                    : `Be the first to add a topic video for ${currentInfo.title} to help students prepare!`}
                </p>
              </div>
              <div>
                <button
                  type="button"
                  onClick={handleOpenModal}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#FF5722] to-[#F15A24] text-white text-xs font-bold shadow-md shadow-[#FF5722]/20 hover:scale-105 transition"
                >
                  <Plus className="w-4 h-4" />
                  <span>+ Add Video</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {filteredVideos.map((item, index) => (
                <div
                  key={item.id}
                  className="group rounded-2xl border border-[#2C2E33] hover:border-[#FF5722]/40 bg-[#1A1B1E] p-5 space-y-3.5 shadow-xl transition-all duration-200 flex flex-col justify-between"
                >
                  {/* Topic Name Header (Rendered Above Video Player) */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-[#FF5722]/15 text-[#FF5722] border border-[#FF5722]/30">
                          Topic #{index + 1}
                        </span>
                        <span className="text-[10px] text-zinc-500">
                          {new Date(item.createdAt).toLocaleDateString(undefined, {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </span>
                      </div>
                      <h3 className="text-base sm:text-lg font-bold text-white tracking-tight leading-snug group-hover:text-[#FF5722] transition-colors">
                        {item.topicName}
                      </h3>
                    </div>

                    <button
                      onClick={() => handleDeleteVideo(item.id, item.topicName)}
                      className="p-1.5 rounded-lg text-zinc-500 hover:text-red-400 hover:bg-red-500/10 transition shrink-0"
                      title="Delete video"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Embedded Video Player */}
                  <VideoPlayer url={item.videoUrl} title={item.topicName} />

                  {/* Card Bottom Links */}
                  <div className="flex items-center justify-between pt-2 border-t border-[#2C2E33]/60 text-xs text-zinc-400">
                    <div className="flex items-center gap-2">
                      <SubjectIcon className="w-3.5 h-3.5 text-[#FF5722]" />
                      <span className="font-semibold text-zinc-300">{item.subject}</span>
                    </div>

                    <a
                      href={item.videoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-zinc-400 hover:text-[#FF5722] font-medium transition"
                    >
                      <span>Open Link</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>

      {/* "Add Video" Modal Form for Admin */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          {/* Backdrop Click Listener */}
          <div
            className="fixed inset-0"
            onClick={handleCloseModal}
          />

          {/* Centered Modal Card */}
          <div className="relative w-full max-w-lg bg-[#1A1B1E] border border-[#2C2E33] rounded-2xl sm:rounded-3xl p-6 sm:p-7 shadow-2xl z-10 space-y-5 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-[#2C2E33]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#FF5722] to-[#F15A24] flex items-center justify-center text-white shadow-md shadow-[#FF5722]/30">
                  <Video className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-bold text-white tracking-tight">Add Video</h3>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#FF5722]/15 text-[#FF5722] border border-[#FF5722]/30 uppercase">
                      {currentInfo.title}
                    </span>
                  </div>
                  <p className="text-xs text-[#9CA3AF]">
                    Input topic and embed link to save to {currentInfo.title}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleCloseModal}
                disabled={submitting}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-[#202226] transition"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Error Alert */}
            {errorMsg && (
              <div className="flex items-center gap-2 p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleAddVideo} className="space-y-4">
              {/* Field 1: Topic Name */}
              <div className="space-y-1.5">
                <label htmlFor="topicName" className="text-xs font-semibold text-zinc-300 block">
                  Topic Name <span className="text-[#FF5722]">*</span>
                </label>
                <input
                  ref={topicInputRef}
                  id="topicName"
                  type="text"
                  value={topicName}
                  onChange={(e) => setTopicName(e.target.value)}
                  placeholder="e.g., Polymorphism"
                  required
                  className="w-full bg-[#121316] border border-[#2C2E33] focus:border-[#FF5722] rounded-xl px-4 py-2.5 text-sm text-white placeholder-zinc-500 focus:outline-none transition"
                />
              </div>

              {/* Field 2: Video Link */}
              <div className="space-y-1.5">
                <label htmlFor="videoLink" className="text-xs font-semibold text-zinc-300 block">
                  Video Link <span className="text-[#FF5722]">*</span>
                </label>
                <input
                  id="videoLink"
                  type="url"
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  placeholder="e.g., https://www.youtube.com/watch?v=..."
                  required
                  className="w-full bg-[#121316] border border-[#2C2E33] focus:border-[#FF5722] rounded-xl px-4 py-2.5 text-sm text-white placeholder-zinc-500 focus:outline-none transition"
                />
                <p className="text-[11px] text-zinc-500">
                  Paste any YouTube (watch, shorts, embed), Vimeo, or direct MP4 embed link.
                </p>
              </div>

              {/* Live Preview if valid URL entered */}
              {previewEmbed && previewEmbed.type !== "invalid" && (
                <div className="space-y-1.5 pt-1">
                  <div className="flex items-center gap-1.5 text-xs text-zinc-400">
                    <Sparkles className="w-3.5 h-3.5 text-[#FF5722]" />
                    <span>Live Video Preview</span>
                  </div>
                  <div className="rounded-xl overflow-hidden border border-[#2C2E33] bg-black">
                    <VideoPlayer url={videoUrl} title={topicName || "Preview"} />
                  </div>
                </div>
              )}

              {/* Action Buttons: Cancel and orange Save Video */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#2C2E33]">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  disabled={submitting}
                  className="px-4 py-2.5 rounded-xl bg-[#202226] hover:bg-[#2C2E33] text-zinc-300 hover:text-white text-xs font-semibold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#FF5722] to-[#F15A24] hover:from-[#ea580c] hover:to-[#c2410c] text-white text-xs font-bold shadow-md shadow-[#FF5722]/25 transition disabled:opacity-50"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <span>Save Video</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
