"use client";

import React, { useState, useEffect } from "react";
import AdminSidebar from "@/components/layout/AdminSidebar";
import AdminNavbar from "@/components/layout/AdminNavbar";
import {
  Building,
  Plus,
  Search,
  ExternalLink,
  Edit2,
  Trash2,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertTriangle,
  Briefcase,
  GraduationCap,
  Calendar,
  DollarSign,
  MapPin,
  X,
} from "lucide-react";

interface CompanyReq {
  id: string;
  companyName: string;
  website: string | null;
  jobTitle: string;
  jobDescription: string;
  eligibleDegree: string;
  eligibleBranch: string;
  minCgpa: number | null;
  backlogRestrictions: string | null;
  requiredSkills: string;
  graduationYear: number;
  location: string;
  deadline: string | null;
  selectionRounds: string | null;
  salaryPackage: string | null;
  officialApplyUrl: string;
  sourceUrl: string | null;
  isPublished: boolean;
  lastVerifiedDate: string;
}

export default function AdminCompaniesPage() {
  const [requirements, setRequirements] = useState<CompanyReq[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<CompanyReq | null>(null);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const [form, setForm] = useState({
    companyName: "",
    website: "",
    jobTitle: "",
    jobDescription: "",
    eligibleDegree: "B.Tech / B.E. / M.Tech / MCA",
    eligibleBranch: "CSE, IT, ECE, EEE, AI/DS",
    minCgpa: "7.0",
    backlogRestrictions: "No active backlogs at time of joining",
    requiredSkills: "DSA, OOP, System Design, SQL",
    graduationYear: 2025,
    location: "Bangalore / Hyderabad / Pune / Hybrid",
    deadline: "",
    selectionRounds: "OA (Coding + Aptitude) -> Technical 1 -> Technical 2 -> HR",
    salaryPackage: "12 - 18 LPA",
    officialApplyUrl: "",
    sourceUrl: "",
    isPublished: true,
  });

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/companies");
      const json = await res.json();
      if (res.ok) {
        setRequirements(json.requirements || []);
      }
    } catch {
      setErrorMsg("Failed to load company requirements");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openCreateModal = () => {
    setEditingItem(null);
    setForm({
      companyName: "",
      website: "",
      jobTitle: "Software Development Engineer - 1",
      jobDescription: "",
      eligibleDegree: "B.Tech / B.E. / M.Tech / MCA",
      eligibleBranch: "CSE, IT, ECE, EEE, AI/DS",
      minCgpa: "7.0",
      backlogRestrictions: "No active backlogs allowed",
      requiredSkills: "Data Structures, Algorithms, JavaScript/TypeScript, SQL",
      graduationYear: 2025,
      location: "Bangalore / Hyderabad / Remote",
      deadline: "",
      selectionRounds: "OA -> Tech 1 (DSA) -> Tech 2 (System Design) -> HR",
      salaryPackage: "",
      officialApplyUrl: "",
      sourceUrl: "",
      isPublished: true,
    });
    setErrorMsg("");
    setIsModalOpen(true);
  };

  const openEditModal = (item: CompanyReq) => {
    setEditingItem(item);
    setForm({
      companyName: item.companyName,
      website: item.website || "",
      jobTitle: item.jobTitle,
      jobDescription: item.jobDescription,
      eligibleDegree: item.eligibleDegree,
      eligibleBranch: item.eligibleBranch,
      minCgpa: item.minCgpa ? String(item.minCgpa) : "",
      backlogRestrictions: item.backlogRestrictions || "",
      requiredSkills: item.requiredSkills,
      graduationYear: item.graduationYear,
      location: item.location,
      deadline: item.deadline ? item.deadline.slice(0, 10) : "",
      selectionRounds: item.selectionRounds || "",
      salaryPackage: item.salaryPackage || "",
      officialApplyUrl: item.officialApplyUrl,
      sourceUrl: item.sourceUrl || "",
      isPublished: item.isPublished,
    });
    setErrorMsg("");
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.companyName || !form.jobTitle || !form.officialApplyUrl) {
      setErrorMsg("Please fill in required fields: Company, Job Title, Official URL.");
      return;
    }

    try {
      setSaving(true);
      setErrorMsg("");

      const payload = {
        id: editingItem?.id,
        companyName: form.companyName,
        website: form.website || undefined,
        jobTitle: form.jobTitle,
        jobDescription: form.jobDescription || "Job description verified through official placement notice.",
        eligibleDegree: form.eligibleDegree,
        eligibleBranch: form.eligibleBranch,
        minCgpa: form.minCgpa ? parseFloat(form.minCgpa) : null,
        backlogRestrictions: form.backlogRestrictions || null,
        requiredSkills: form.requiredSkills,
        graduationYear: parseInt(String(form.graduationYear), 10),
        location: form.location,
        deadline: form.deadline ? new Date(form.deadline).toISOString() : null,
        selectionRounds: form.selectionRounds || null,
        salaryPackage: form.salaryPackage || null,
        officialApplyUrl: form.officialApplyUrl,
        sourceUrl: form.sourceUrl || null,
        isPublished: form.isPublished,
      };

      const res = await fetch("/api/admin/companies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (res.ok) {
        setSuccessMsg(editingItem ? "Requirement updated successfully" : "Requirement published");
        setIsModalOpen(false);
        loadData();
      } else {
        setErrorMsg(json.error || "Failed to save requirement");
      }
    } catch {
      setErrorMsg("Network error saving company opening");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete opening for ${name}?`)) return;
    try {
      const res = await fetch(`/api/admin/companies/requirements/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setSuccessMsg("Opening deleted");
        loadData();
      } else {
        alert("Failed to delete opening");
      }
    } catch {
      alert("Network error deleting opening");
    }
  };

  const filtered = requirements.filter((r) => {
    const q = search.toLowerCase();
    return (
      r.companyName.toLowerCase().includes(q) ||
      r.jobTitle.toLowerCase().includes(q) ||
      r.location.toLowerCase().includes(q) ||
      r.requiredSkills.toLowerCase().includes(q)
    );
  });

  return (
    <div className="flex min-h-screen bg-[#121316] text-zinc-100">
      <AdminSidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <AdminNavbar title="Placement Drives & Requirements" />

        <main className="flex-1 p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-white">Campus Placement Drives</h1>
              <p className="text-zinc-400 text-sm mt-1">
                Manage verified company hiring criteria, eligibility standards, and official application portals.
              </p>
            </div>

            <button
              onClick={openCreateModal}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#FF5722] to-[#F15A24] hover:from-[#F15A24] hover:to-[#ea580c] text-white font-semibold text-sm flex items-center gap-2 shadow-lg shadow-orange-500/20 transition self-start sm:self-auto"
            >
              <Plus className="w-4 h-4" />
              <span>Add Company Opening</span>
            </button>
          </div>

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

          {/* Search bar */}
          <div className="p-4 rounded-2xl bg-[#1A1B1E] border border-[#2C2E33] flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="relative w-full sm:w-96">
              <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-3" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by company, job role, skills, or city..."
                className="w-full bg-[#202226] border border-[#2C2E33] rounded-xl pl-10 pr-4 py-2 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-[#FF5722]"
              />
            </div>
            <span className="text-xs text-zinc-400 font-medium">
              {filtered.length} opening{filtered.length !== 1 ? "s" : ""}
            </span>
          </div>

          {/* Table / Cards */}
          {loading ? (
            <div className="p-12 text-center text-zinc-400">Loading company drives...</div>
          ) : filtered.length === 0 ? (
            <div className="p-12 text-center rounded-2xl bg-[#1A1B1E] border border-[#2C2E33] text-zinc-400">
              <Building className="w-10 h-10 mx-auto text-zinc-500 mb-3" />
              <p className="font-semibold text-zinc-300">No company requirements found</p>
              <p className="text-xs text-zinc-500 mt-1">Publish verified company drives to assist students.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filtered.map((req) => (
                <div
                  key={req.id}
                  className="p-5 rounded-2xl bg-[#1A1B1E] border border-[#2C2E33] hover:border-[#3F4248] transition flex flex-col lg:flex-row lg:items-center justify-between gap-6"
                >
                  <div className="space-y-3 max-w-3xl">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-md text-xs font-bold uppercase bg-[#FF5722]/10 text-[#FF5722] border border-[#FF5722]/20 flex items-center gap-1.5">
                        <Building className="w-3.5 h-3.5" />
                        {req.companyName}
                      </span>
                      <h3 className="text-base font-bold text-white">{req.jobTitle}</h3>
                      <span
                        className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                          req.isPublished
                            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                            : "bg-[#202226] text-zinc-400 border border-[#2C2E33]"
                        }`}
                      >
                        {req.isPublished ? "Published" : "Draft"}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs text-zinc-400">
                      <div className="flex items-center gap-1.5">
                        <GraduationCap className="w-3.5 h-3.5 text-zinc-500" />
                        <span>Min CGPA: {req.minCgpa ?? "No Cutoff"}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-zinc-500" />
                        <span className="truncate">{req.location}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <DollarSign className="w-3.5 h-3.5 text-zinc-500" />
                        <span>{req.salaryPackage || "Undisclosed"}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-zinc-500" />
                        <span>
                          Batch: <strong className="text-white">{req.graduationYear}</strong>
                        </span>
                      </div>
                    </div>

                    <div className="text-xs text-zinc-300">
                      <span className="text-zinc-400 font-semibold">Required Skills: </span>
                      {req.requiredSkills}
                    </div>

                    {req.deadline && (
                      <div className="text-[11px] text-amber-400 font-semibold flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>Deadline: {new Date(req.deadline).toLocaleDateString()}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2 shrink-0 self-end lg:self-center">
                    <a
                      href={req.officialApplyUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-2 rounded-xl bg-[#202226] hover:bg-[#2C2E33] text-zinc-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition border border-[#2C2E33]"
                    >
                      <span>Official Link</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                    <button
                      onClick={() => openEditModal(req)}
                      className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-[#202226] transition"
                      title="Edit"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(req.id, req.companyName)}
                      className="p-2 rounded-xl text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Modal */}
          {isModalOpen && (
            <div className="fixed inset-0 z-50 bg-[#121316]/80 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="bg-[#1A1B1E] border border-[#2C2E33] rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 space-y-5 shadow-2xl">
                <div className="flex items-center justify-between border-b border-[#2C2E33] pb-4">
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <Building className="w-5 h-5 text-[#FF5722]" />
                    <span>{editingItem ? "Edit Drive Requirement" : "Add Campus Drive Requirement"}</span>
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
                        placeholder="e.g. Microsoft"
                        className="w-full bg-[#202226] border border-[#2C2E33] rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-[#FF5722]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-zinc-300 mb-1">
                        Job Title / Role <span className="text-rose-400">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={form.jobTitle}
                        onChange={(e) => setForm({ ...form, jobTitle: e.target.value })}
                        placeholder="e.g. SDE-1"
                        className="w-full bg-[#202226] border border-[#2C2E33] rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-[#FF5722]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-zinc-300 mb-1">
                        Graduation Batch <span className="text-rose-400">*</span>
                      </label>
                      <input
                        type="number"
                        required
                        value={form.graduationYear}
                        onChange={(e) => setForm({ ...form, graduationYear: parseInt(e.target.value, 10) })}
                        className="w-full bg-[#202226] border border-[#2C2E33] rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-[#FF5722]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-zinc-300 mb-1">
                        Min CGPA Cutoff
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        value={form.minCgpa}
                        onChange={(e) => setForm({ ...form, minCgpa: e.target.value })}
                        placeholder="e.g. 7.5"
                        className="w-full bg-[#202226] border border-[#2C2E33] rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-[#FF5722]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-zinc-300 mb-1">
                        Verified CTC (Optional)
                      </label>
                      <input
                        type="text"
                        value={form.salaryPackage}
                        onChange={(e) => setForm({ ...form, salaryPackage: e.target.value })}
                        placeholder="e.g. 14.5 LPA"
                        className="w-full bg-[#202226] border border-[#2C2E33] rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-[#FF5722]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-zinc-300 mb-1">
                        Location / Work Mode
                      </label>
                      <input
                        type="text"
                        value={form.location}
                        onChange={(e) => setForm({ ...form, location: e.target.value })}
                        placeholder="e.g. Bangalore / Hybrid"
                        className="w-full bg-[#202226] border border-[#2C2E33] rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-[#FF5722]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-zinc-300 mb-1">
                        Application Deadline
                      </label>
                      <input
                        type="date"
                        value={form.deadline}
                        onChange={(e) => setForm({ ...form, deadline: e.target.value })}
                        className="w-full bg-[#202226] border border-[#2C2E33] rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-[#FF5722]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-300 mb-1">
                      Official Application Link <span className="text-rose-400">*</span>
                    </label>
                    <input
                      type="url"
                      required
                      value={form.officialApplyUrl}
                      onChange={(e) => setForm({ ...form, officialApplyUrl: e.target.value })}
                      placeholder="https://careers.company.com/job/..."
                      className="w-full bg-[#202226] border border-[#2C2E33] rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-[#FF5722]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-300 mb-1">
                      Required Skills & Technologies
                    </label>
                    <input
                      type="text"
                      value={form.requiredSkills}
                      onChange={(e) => setForm({ ...form, requiredSkills: e.target.value })}
                      placeholder="e.g. C++, Java, React, SQL, Problem Solving"
                      className="w-full bg-[#202226] border border-[#2C2E33] rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-[#FF5722]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-300 mb-1">
                      Job Description & Rounds Summary
                    </label>
                    <textarea
                      rows={3}
                      value={form.jobDescription}
                      onChange={(e) => setForm({ ...form, jobDescription: e.target.value })}
                      placeholder="Brief job description, candidate requirements, and eligibility guidelines..."
                      className="w-full bg-[#202226] border border-[#2C2E33] rounded-xl p-3 text-sm text-white focus:outline-none focus:border-[#FF5722]"
                    />
                  </div>

                  <div className="flex items-center gap-2 pt-2">
                    <input
                      type="checkbox"
                      id="publishCheck"
                      checked={form.isPublished}
                      onChange={(e) => setForm({ ...form, isPublished: e.target.checked })}
                      className="w-4 h-4 rounded text-[#FF5722] bg-[#202226] border-[#2C2E33] focus:ring-0 accent-[#FF5722]"
                    />
                    <label htmlFor="publishCheck" className="text-xs font-semibold text-zinc-200">
                      Publish drive notice immediately to Student Portal
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
                      {saving ? "Saving..." : editingItem ? "Save Changes" : "Publish Drive"}
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
