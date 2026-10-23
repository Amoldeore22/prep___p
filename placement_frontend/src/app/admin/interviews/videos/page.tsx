"use client";

import React, { useState, useEffect } from "react";
import AdminSidebar from "@/components/layout/AdminSidebar";
import AdminNavbar from "@/components/layout/AdminNavbar";
import {
  Video,
  Plus,
  Search,
  ExternalLink,
  Edit2,
  Trash2,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertTriangle,
  Building,
  Briefcase,
  Play,
  X,
} from "lucide-react";

interface InterviewVideo {
  id: string;
  title: string;
  description: string | null;
  companyName: string;
  jobRole: string;
  round: string;
  topic: string | null;
  videoUrl: string;
  videoType: "EXTERNAL_URL" | "UPLOADED_FILE";
  thumbnailUrl: string | null;
  isPublished: boolean;
  createdAt: string;
}

export default function AdminInterviewVideosPage() {
  const [videos, setVideos] = useState<InterviewVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterCompany, setFilterCompany] = useState("ALL");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVideo, setEditingVideo] = useState<InterviewVideo | null>(null);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Form State
  const [form, setForm] = useState({
    title: "",
    description: "",
    companyName: "",
    jobRole: "",
    round: "Technical Round 1",
    topic: "Data Structures & System Design",
    videoUrl: "",
    videoType: "EXTERNAL_URL" as "EXTERNAL_URL" | "UPLOADED_FILE",
    thumbnailUrl: "",
    isPublished: true,
  });

  const loadVideos = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/interviews/videos");
      const json = await res.json();
      if (res.ok) {
        setVideos(json.videos || []);
      }
    } catch {
      setErrorMsg("Failed to load interview videos");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadVideos();
  }, []);

  const openCreateModal = () => {
    setEditingVideo(null);
    setForm({
      title: "",
      description: "",
      companyName: "",
      jobRole: "Software Development Engineer (SDE-1)",
      round: "Technical Round 1",
      topic: "DSA & System Design",
      videoUrl: "",
      videoType: "EXTERNAL_URL",
      thumbnailUrl: "",
      isPublished: true,
    });
    setErrorMsg("");
    setIsModalOpen(true);
  };

  const openEditModal = (video: InterviewVideo) => {
    setEditingVideo(video);
    setForm({
      title: video.title,
      description: video.description || "",
      companyName: video.companyName,
      jobRole: video.jobRole,
      round: video.round,
      topic: video.topic || "",
      videoUrl: video.videoUrl,
      videoType: video.videoType,
      thumbnailUrl: video.thumbnailUrl || "",
      isPublished: video.isPublished,
    });
    setErrorMsg("");
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.companyName || !form.videoUrl) {
      setErrorMsg("Please fill in all required fields (Title, Company, Video URL).");
      return;
    }

    try {
      setSaving(true);
      setErrorMsg("");
      const payload: any = {
        ...form,
        id: editingVideo?.id,
      };

      const res = await fetch("/api/admin/interviews/videos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (res.ok) {
        setSuccessMsg(editingVideo ? "Video updated successfully" : "Video added successfully");
        setIsModalOpen(false);
        loadVideos();
      } else {
        setErrorMsg(json.error || "Failed to save video");
      }
    } catch {
      setErrorMsg("Network error saving video");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to permanently delete "${title}"?`)) return;

    try {
      const res = await fetch(`/api/admin/interviews/videos/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setSuccessMsg("Video deleted successfully");
        loadVideos();
      } else {
        const json = await res.json();
        alert(json.error || "Failed to delete");
      }
    } catch {
      alert("Network error deleting video");
    }
  };

  const togglePublish = async (video: InterviewVideo) => {
    try {
      const res = await fetch("/api/admin/interviews/videos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: video.id,
          title: video.title,
          description: video.description,
          companyName: video.companyName,
          jobRole: video.jobRole,
          round: video.round,
          topic: video.topic,
          videoUrl: video.videoUrl,
          videoType: video.videoType,
          thumbnailUrl: video.thumbnailUrl,
          isPublished: !video.isPublished,
        }),
      });
      if (res.ok) {
        loadVideos();
      }
    } catch {
      alert("Failed to toggle publish state");
    }
  };

  // Filter & Search
  const companies = Array.from(new Set(videos.map((v) => v.companyName))).sort();
  const filtered = videos.filter((v) => {
    const matchesSearch =
      v.title.toLowerCase().includes(search.toLowerCase()) ||
      v.companyName.toLowerCase().includes(search.toLowerCase()) ||
      v.jobRole.toLowerCase().includes(search.toLowerCase()) ||
      (v.topic && v.topic.toLowerCase().includes(search.toLowerCase()));
    const matchesCompany = filterCompany === "ALL" || v.companyName === filterCompany;
    return matchesSearch && matchesCompany;
  });

  return (
    <div className="flex min-h-screen bg-[#121316] text-zinc-100">
      <AdminSidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <AdminNavbar title="Interview Video Management" />

        <main className="flex-1 p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-white">Interview Video Library</h1>
              <p className="text-zinc-400 text-sm mt-1">
                Manage high-yield interview breakdown videos, round analyses, and company debriefs.
              </p>
            </div>

            <button
              onClick={openCreateModal}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#FF5722] to-[#F15A24] hover:from-[#F15A24] hover:to-[#ea580c] text-white font-semibold text-sm flex items-center gap-2 shadow-lg shadow-orange-500/20 transition self-start sm:self-auto"
            >
              <Plus className="w-4 h-4" />
              <span>Add Interview Video</span>
            </button>
          </div>

          {/* Toast / Messages */}
          {successMsg && (
            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                <span>{successMsg}</span>
              </div>
              <button onClick={() => setSuccessMsg("")} className="text-zinc-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Filter Bar */}
          <div className="p-4 rounded-2xl bg-[#1A1B1E] border border-[#2C2E33] flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-3" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by title, company, role..."
                className="w-full bg-[#202226] border border-[#2C2E33] rounded-xl pl-10 pr-4 py-2 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-[#FF5722]"
              />
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <select
                value={filterCompany}
                onChange={(e) => setFilterCompany(e.target.value)}
                className="bg-[#202226] border border-[#2C2E33] rounded-xl px-3 py-2 text-xs font-semibold text-zinc-300 focus:outline-none focus:border-[#FF5722]"
              >
                <option value="ALL">All Companies ({videos.length})</option>
                {companies.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>

              <span className="text-xs text-zinc-400 shrink-0 font-medium">
                {filtered.length} video{filtered.length !== 1 ? "s" : ""}
              </span>
            </div>
          </div>

          {/* Video Grid */}
          {loading ? (
            <div className="p-12 text-center text-zinc-400">Loading videos...</div>
          ) : filtered.length === 0 ? (
            <div className="p-12 text-center rounded-2xl bg-[#1A1B1E] border border-[#2C2E33] text-zinc-400">
              <Video className="w-10 h-10 mx-auto text-zinc-500 mb-3" />
              <p className="font-semibold text-zinc-300">No interview videos found</p>
              <p className="text-xs text-zinc-500 mt-1">Add a YouTube link or uploaded video to get started.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filtered.map((video) => (
                <div
                  key={video.id}
                  className="rounded-2xl bg-[#1A1B1E] border border-[#2C2E33] overflow-hidden flex flex-col hover:border-[#3F4248] transition group"
                >
                  {/* Thumbnail / Header */}
                  <div className="relative aspect-video bg-[#121316] flex items-center justify-center overflow-hidden border-b border-[#2C2E33]">
                    {/* Thumbnail provided in screenshot */}
                    <div className="flex flex-col items-center justify-center text-zinc-600 gap-2">
                      <Video className="w-10 h-10 text-zinc-700" />
                      <span className="text-[11px] font-medium text-zinc-500">Placement Prep Media</span>
                    </div>

                    {video.thumbnailUrl && /\.(jpeg|jpg|gif|png|webp|svg)($|\?)/i.test(video.thumbnailUrl) && (
                      <img
                        src={video.thumbnailUrl}
                        alt=""
                        className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition duration-300"
                        onError={(e) => {
                          e.currentTarget.style.display = "none";
                        }}
                      />
                    )}
                    <a
                      href={video.videoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="absolute inset-0 bg-[#121316]/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center"
                    >
                      <div className="w-12 h-12 rounded-full bg-gradient-to-r from-[#FF5722] to-[#F15A24] text-white flex items-center justify-center shadow-lg shadow-orange-500/40">
                        <Play className="w-5 h-5 ml-0.5 fill-current" />
                      </div>
                    </a>
                    {/* Status badge */}
                    <div className="absolute top-3 right-3">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold shadow-md flex items-center gap-1.5 ${
                          video.isPublished
                            ? "bg-emerald-500/90 text-white"
                            : "bg-[#202226]/90 text-zinc-400 border border-[#2C2E33]"
                        }`}
                      >
                        {video.isPublished ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                        {video.isPublished ? "Published" : "Draft"}
                      </span>
                    </div>
                  </div>

                  {/* Body */}
                  <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase bg-[#FF5722]/10 text-[#FF5722] border border-[#FF5722]/20 flex items-center gap-1">
                          <Building className="w-3 h-3" />
                          {video.companyName}
                        </span>
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-[#202226] text-zinc-300 truncate max-w-[150px]">
                          {video.round}
                        </span>
                      </div>
                      <h3 className="font-bold text-white text-base leading-snug line-clamp-2">
                        {video.title}
                      </h3>
                      {video.description && (
                        <p className="text-xs text-zinc-400 line-clamp-2 mt-1.5">
                          {video.description}
                        </p>
                      )}
                      <div className="mt-3 flex items-center gap-1 text-[11px] text-zinc-400">
                        <Briefcase className="w-3 h-3 text-zinc-500" />
                        <span className="truncate">{video.jobRole}</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="pt-3 border-t border-[#2C2E33] flex items-center justify-between">
                      <button
                        onClick={() => togglePublish(video)}
                        className={`text-xs font-semibold px-2.5 py-1 rounded-lg border transition ${
                          video.isPublished
                            ? "border-amber-500/30 text-amber-400 hover:bg-amber-500/10"
                            : "border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10"
                        }`}
                      >
                        {video.isPublished ? "Unpublish" : "Publish"}
                      </button>

                      <div className="flex items-center gap-2">
                        <a
                          href={video.videoUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-[#202226] transition"
                          title="Open Link"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                        <button
                          onClick={() => openEditModal(video)}
                          className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-[#202226] transition"
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(video.id, video.title)}
                          className="p-1.5 rounded-lg text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Create/Edit Modal */}
          {isModalOpen && (
            <div className="fixed inset-0 z-50 bg-[#121316]/80 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="bg-[#1A1B1E] border border-[#2C2E33] rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 space-y-5 shadow-2xl">
                <div className="flex items-center justify-between border-b border-[#2C2E33] pb-4">
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <Video className="w-5 h-5 text-[#FF5722]" />
                    <span>{editingVideo ? "Edit Interview Video" : "Add New Interview Video"}</span>
                  </h2>
                  <button
                    onClick={() => setIsModalOpen(false)}
                    className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-[#202226] transition"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {errorMsg && (
                  <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-zinc-300 mb-1">
                      Video Title <span className="text-rose-400">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={form.title}
                      onChange={(e) => setForm({ ...form, title: e.target.value })}
                      placeholder="e.g. Google SDE-2 System Design & Coding Round Breakdown"
                      className="w-full bg-[#202226] border border-[#2C2E33] rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-[#FF5722]"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-zinc-300 mb-1">
                        Company Name <span className="text-rose-400">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={form.companyName}
                        onChange={(e) => setForm({ ...form, companyName: e.target.value })}
                        placeholder="e.g. Google, Amazon, Microsoft"
                        className="w-full bg-[#202226] border border-[#2C2E33] rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-[#FF5722]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-zinc-300 mb-1">
                        Job Role <span className="text-rose-400">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={form.jobRole}
                        onChange={(e) => setForm({ ...form, jobRole: e.target.value })}
                        placeholder="e.g. SDE-1, Cloud Engineer, Data Scientist"
                        className="w-full bg-[#202226] border border-[#2C2E33] rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-[#FF5722]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-zinc-300 mb-1">
                        Interview Round <span className="text-rose-400">*</span>
                      </label>
                      <select
                        value={form.round}
                        onChange={(e) => setForm({ ...form, round: e.target.value })}
                        className="w-full bg-[#202226] border border-[#2C2E33] rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-[#FF5722]"
                      >
                        <option value="Online Assessment (OA)">Online Assessment (OA)</option>
                        <option value="Technical Round 1 (DSA)">Technical Round 1 (DSA)</option>
                        <option value="Technical Round 2 (System Design/Core CS)">
                          Technical Round 2 (System Design/Core CS)
                        </option>
                        <option value="Managerial & Behavioral Round">
                          Managerial & Behavioral Round
                        </option>
                        <option value="HR / Cultural Fit Round">HR / Cultural Fit Round</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-zinc-300 mb-1">
                        Primary Topic / Focus
                      </label>
                      <input
                        type="text"
                        value={form.topic}
                        onChange={(e) => setForm({ ...form, topic: e.target.value })}
                        placeholder="e.g. Dynamic Programming & Trees"
                        className="w-full bg-[#202226] border border-[#2C2E33] rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-[#FF5722]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-300 mb-1">
                      Video URL (YouTube or Object Storage URL) <span className="text-rose-400">*</span>
                    </label>
                    <input
                      type="url"
                      required
                      value={form.videoUrl}
                      onChange={(e) => setForm({ ...form, videoUrl: e.target.value })}
                      placeholder="https://www.youtube.com/watch?v=... or S3/GCS media link"
                      className="w-full bg-[#202226] border border-[#2C2E33] rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-[#FF5722]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-300 mb-1">
                      Custom Thumbnail URL (Optional)
                    </label>
                    <input
                      type="url"
                      value={form.thumbnailUrl}
                      onChange={(e) => setForm({ ...form, thumbnailUrl: e.target.value })}
                      placeholder="https://images.unsplash.com/... or media thumbnail"
                      className="w-full bg-[#202226] border border-[#2C2E33] rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-[#FF5722]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-300 mb-1">
                      Description & Notes
                    </label>
                    <textarea
                      rows={3}
                      value={form.description}
                      onChange={(e) => setForm({ ...form, description: e.target.value })}
                      placeholder="Summary of questions asked, recommended time complexity, and core takeaways..."
                      className="w-full bg-[#202226] border border-[#2C2E33] rounded-xl p-3 text-sm text-white focus:outline-none focus:border-[#FF5722]"
                    />
                  </div>

                  <div className="flex items-center gap-2 pt-2">
                    <input
                      type="checkbox"
                      id="isPublished"
                      checked={form.isPublished}
                      onChange={(e) => setForm({ ...form, isPublished: e.target.checked })}
                      className="w-4 h-4 rounded text-[#FF5722] bg-[#202226] border-[#2C2E33] focus:ring-0 accent-[#FF5722]"
                    />
                    <label htmlFor="isPublished" className="text-xs font-semibold text-zinc-200">
                      Publish immediately to Student Portal
                    </label>
                  </div>

                  <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#2C2E33]">
                    <button
                      type="button"
                      onClick={() => setIsModalOpen(false)}
                      className="px-4 py-2.5 rounded-xl border border-[#2C2E33] text-zinc-300 hover:bg-[#202226] text-xs font-semibold transition"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={saving}
                      className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#FF5722] to-[#F15A24] hover:from-[#F15A24] hover:to-[#ea580c] text-white font-semibold text-xs transition shadow-lg shadow-orange-500/20"
                    >
                      {saving ? "Saving..." : editingVideo ? "Save Changes" : "Create Video Resource"}
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
