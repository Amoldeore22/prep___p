"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import PipelineSidebar from "@/components/layout/PipelineSidebar";
import StudentNavbar from "@/components/layout/StudentNavbar";
import StepProgressHeader from "./StepProgressHeader";
import { PIPELINE_COMPANIES, PipelineCompany, CompanyRole } from "@/data/pipeline-data";
import {
  ShieldCheck,
  ShieldAlert,
  CheckCircle2,
  XCircle,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Building2,
  Target,
  Edit3,
  Lock,
  ListOrdered,
  X,
  FileCheck,
  BookOpen,
  Code2,
  Brain,
  Award,
} from "lucide-react";

interface StudentProfileState {
  name: string;
  email: string;
  cgpa: number;
  backlogs: number;
  branch: string;
  graduationYear: number;
  tenthPercent: number;
  twelfthPercent: number;
}

export default function EligibilityStepView() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const companyParam = searchParams.get("companyId") || "";
  const roleParam = searchParams.get("roleId") || "";

  // Find company & role
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>(() => {
    if (companyParam && PIPELINE_COMPANIES.some((c) => c.id === companyParam)) return companyParam;
    try {
      const saved = localStorage.getItem("pp_target_company");
      if (saved && PIPELINE_COMPANIES.some((c) => c.id === saved)) return saved;
    } catch {
      // Ignore
    }
    return PIPELINE_COMPANIES[0].id;
  });

  const currentCompany =
    PIPELINE_COMPANIES.find((c) => c.id === selectedCompanyId) || PIPELINE_COMPANIES[0];

  const [selectedRoleId, setSelectedRoleId] = useState<string>(() => {
    if (roleParam && currentCompany.roles.some((r) => r.id === roleParam)) return roleParam;
    try {
      const savedRole = localStorage.getItem("pp_target_role");
      if (savedRole && currentCompany.roles.some((r) => r.id === savedRole)) return savedRole;
    } catch {
      // Ignore
    }
    return currentCompany.roles[0].id;
  });

  const currentRole =
    currentCompany.roles.find((r) => r.id === selectedRoleId) || currentCompany.roles[0];

  // Student academic profile (initialized from DB or defaults, editable in modal)
  const [studentProfile, setStudentProfile] = useState<StudentProfileState>({
    name: "Rahul Sharma",
    email: "student@college.edu",
    cgpa: 8.85,
    backlogs: 0,
    branch: "Computer Science & Engineering",
    graduationYear: 2026,
    tenthPercent: 91.5,
    twelfthPercent: 88.0,
  });

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isRoadmapModalOpen, setIsRoadmapModalOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState("");
  const [tempProfile, setTempProfile] = useState<StudentProfileState>(studentProfile);

  // Sync with API auth/me on mount
  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (data.user) {
          setStudentProfile((prev) => {
            const updated = {
              ...prev,
              name: data.user.name || prev.name,
              email: data.user.email || prev.email,
              cgpa: data.user.cgpa ?? prev.cgpa,
              branch: data.user.branch || data.user.department || prev.branch,
              graduationYear: data.user.graduationYear ?? prev.graduationYear,
            };
            setTempProfile(updated);
            return updated;
          });
        }
      })
      .catch(() => {});

    try {
      const savedProfile = localStorage.getItem("pp_custom_student_profile");
      if (savedProfile) {
        const parsed = JSON.parse(savedProfile);
        setStudentProfile(parsed);
        setTempProfile(parsed);
      }
    } catch {
      // Ignore
    }
  }, []);

  // Update company/role when params change
  useEffect(() => {
    if (companyParam && PIPELINE_COMPANIES.some((c) => c.id === companyParam)) {
      setSelectedCompanyId(companyParam);
      const company = PIPELINE_COMPANIES.find((c) => c.id === companyParam);
      if (company) {
        if (roleParam && company.roles.some((r) => r.id === roleParam)) {
          setSelectedRoleId(roleParam);
        } else {
          setSelectedRoleId(company.roles[0].id);
        }
      }
    }
  }, [companyParam, roleParam]);

  // Handle company switcher change
  const handleCompanyChange = (compId: string) => {
    setSelectedCompanyId(compId);
    const company = PIPELINE_COMPANIES.find((c) => c.id === compId);
    if (company) {
      setSelectedRoleId(company.roles[0].id);
      router.push(`/pipeline/eligibility?companyId=${compId}&roleId=${company.roles[0].id}`);
    }
  };

  const handleRoleChange = (roleId: string) => {
    setSelectedRoleId(roleId);
    router.push(`/pipeline/eligibility?companyId=${selectedCompanyId}&roleId=${roleId}`);
  };

  // Evaluate 5 criteria
  const cgpaPass = studentProfile.cgpa >= currentRole.criteria.minCgpa;
  const backlogsPass = studentProfile.backlogs <= currentRole.criteria.maxBacklogs;

  const branchNormalized = studentProfile.branch.toLowerCase();
  const branchPass =
    currentRole.criteria.allowedBranches.includes("All Disciplines") ||
    currentRole.criteria.allowedBranches.some((b) =>
      branchNormalized.includes(b.toLowerCase()) || b.toLowerCase().includes(branchNormalized)
    );

  const batchPass = currentRole.criteria.eligibleBatches.includes(studentProfile.graduationYear);
  const tenthPass = studentProfile.tenthPercent >= currentRole.criteria.min10thPercent;
  const twelfthPass = studentProfile.twelfthPercent >= currentRole.criteria.min12thPercent;
  const secondaryEducationPass = tenthPass && twelfthPass;

  const allCriteriaPass = cgpaPass && backlogsPass && branchPass && batchPass && secondaryEducationPass;

  const failedCriteriaList: string[] = [];
  if (!cgpaPass) failedCriteriaList.push(`CGPA (${studentProfile.cgpa} < required ${currentRole.criteria.minCgpa})`);
  if (!backlogsPass) failedCriteriaList.push(`Active Backlogs (${studentProfile.backlogs} > allowed ${currentRole.criteria.maxBacklogs})`);
  if (!branchPass) failedCriteriaList.push(`Branch "${studentProfile.branch}" not in eligible discipline list`);
  if (!batchPass) failedCriteriaList.push(`Graduation Batch ${studentProfile.graduationYear} (Eligible: ${currentRole.criteria.eligibleBatches.join(", ")})`);
  if (!secondaryEducationPass) failedCriteriaList.push(`10th / 12th Cutoffs (10th: ${studentProfile.tenthPercent}%, 12th: ${studentProfile.twelfthPercent}%)`);

  // Handle Lock in as Target
  const handleLockInTarget = () => {
    try {
      localStorage.setItem("pp_target_company", currentCompany.id);
      localStorage.setItem("pp_target_company_name", currentCompany.name);
      localStorage.setItem("pp_target_role", currentRole.id);
      localStorage.setItem("pp_target_role_name", currentRole.title);
      setToastMsg(`Target locked: ${currentCompany.shortName} – ${currentRole.title}! 🚀`);
      setTimeout(() => setToastMsg(""), 3500);
      setIsRoadmapModalOpen(true);
    } catch {
      // Ignore
    }
  };

  // Handle Profile Save
  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setStudentProfile(tempProfile);
    try {
      localStorage.setItem("pp_custom_student_profile", JSON.stringify(tempProfile));
    } catch {
      // Ignore
    }
    setIsEditModalOpen(false);
    setToastMsg("Academic details updated! Live evaluation recalculated.");
    setTimeout(() => setToastMsg(""), 3500);
  };

  return (
    <div className="flex min-h-screen bg-[#121316] text-[#FFFFFF]">
      <PipelineSidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <StudentNavbar title="Placement Pipeline • Step 3: Eligibility Check" />

        <main className="p-4 sm:p-6 md:p-8 space-y-6 md:space-y-8 flex-1 overflow-y-auto max-w-7xl w-full mx-auto">
          {/* Step 1 ➔ Step 2 ➔ Step 3 Progress Bar */}
          <StepProgressHeader
            currentStep={3}
            companyId={currentCompany.id}
            roleId={currentRole.id}
            companyName={currentCompany.shortName}
            roleTitle={currentRole.title}
          />

          {/* Toast Notification */}
          {toastMsg && (
            <div className="flex items-center gap-2.5 p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-sm shadow-xl animate-in fade-in duration-200">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              <span className="font-semibold">{toastMsg}</span>
            </div>
          )}

          {/* Context Header: Active Selection & Dropdown Switchers */}
          <div className="relative overflow-hidden rounded-3xl p-6 sm:p-8 bg-gradient-to-r from-[#1A1B1E] via-[#202226] to-[#1A1B1E] border border-[#2C2E33] shadow-2xl">
            <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div className="space-y-3 max-w-2xl">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/15 border border-blue-500/30 text-blue-400 text-xs font-semibold">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Step 3 of 3: Live Eligibility Audit</span>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-white p-2 border border-white/20 flex items-center justify-center shrink-0 shadow-md overflow-hidden">
                    <img
                      src={currentCompany.logo}
                      alt={`${currentCompany.name} logo`}
                      className="w-full h-full object-contain"
                      loading="lazy"
                      onError={(e) => {
                        const target = e.currentTarget;
                        target.style.display = "none";
                        if (target.parentElement) {
                          target.parentElement.classList.remove("bg-white", "p-2");
                          target.parentElement.classList.add("bg-[#2C2E33]");
                          target.parentElement.innerHTML = `<span class="text-xs font-bold text-white">${currentCompany.shortName.slice(0, 3)}</span>`;
                        }
                      }}
                    />
                  </div>
                  <div>
                    <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-white tracking-tight">
                      {currentCompany.name} – {currentRole.title}
                    </h1>
                    <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-400 mt-1">
                      <span className="font-bold text-emerald-400">{currentRole.packageLPA}</span>
                      <span>•</span>
                      <span>{currentRole.trackBadge}</span>
                      <span>•</span>
                      <span>Evaluating against student profile: <strong>{studentProfile.name}</strong></span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Company & Role Switcher Controls */}
              <div className="flex flex-col sm:flex-row lg:flex-col items-start lg:items-end gap-3 shrink-0 bg-[#121316] p-4 rounded-2xl border border-[#2C2E33]">
                <div className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">
                  Switch Active Target:
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  {/* Company Dropdown */}
                  <select
                    value={selectedCompanyId}
                    onChange={(e) => handleCompanyChange(e.target.value)}
                    className="bg-[#1A1B1E] border border-[#2C2E33] text-white rounded-xl px-3 py-1.5 text-xs font-semibold outline-none cursor-pointer focus:border-blue-500"
                  >
                    {PIPELINE_COMPANIES.map((comp) => (
                      <option key={comp.id} value={comp.id}>
                        {comp.shortName}
                      </option>
                    ))}
                  </select>

                  {/* Role Dropdown */}
                  <select
                    value={selectedRoleId}
                    onChange={(e) => handleRoleChange(e.target.value)}
                    className="bg-[#1A1B1E] border border-[#2C2E33] text-white rounded-xl px-3 py-1.5 text-xs font-semibold outline-none cursor-pointer focus:border-blue-500 max-w-xs truncate"
                  >
                    {currentCompany.roles.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.title} ({r.packageLPA})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Glowing Accent */}
            <div className="absolute -right-20 -bottom-20 w-80 h-80 rounded-full bg-blue-600/10 blur-3xl pointer-events-none" />
          </div>

          {/* Hero Status Banner */}
          {allCriteriaPass ? (
            <div className="rounded-3xl p-6 sm:p-8 bg-gradient-to-r from-emerald-950/40 via-emerald-900/30 to-[#1A1B1E] border border-emerald-500/40 shadow-2xl relative overflow-hidden flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0 shadow-lg shadow-emerald-500/20">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <div className="space-y-1">
                  <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold uppercase tracking-wider">
                    ELIGIBLE 🎉
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                    You meet all corporate cutoff requirements for this track!
                  </h2>
                  <p className="text-xs sm:text-sm text-emerald-200/80 leading-relaxed max-w-2xl">
                    Your current CGPA ({studentProfile.cgpa}), active backlogs ({studentProfile.backlogs}), branch ({studentProfile.branch}), and secondary academic scores fulfill the official campus placement criteria.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleLockInTarget}
                className="px-5 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white text-xs sm:text-sm font-bold shadow-lg shadow-emerald-500/25 transition whitespace-nowrap shrink-0 flex items-center gap-2"
              >
                <Lock className="w-4 h-4" />
                <span>Lock Target & View Roadmap</span>
              </button>
            </div>
          ) : (
            <div className="rounded-3xl p-6 sm:p-8 bg-gradient-to-r from-red-950/40 via-red-900/30 to-[#1A1B1E] border border-red-500/40 shadow-2xl relative overflow-hidden flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-2xl bg-red-500/20 border border-red-500/40 flex items-center justify-center text-red-400 shrink-0 shadow-lg shadow-red-500/20">
                  <XCircle className="w-8 h-8" />
                </div>
                <div className="space-y-1">
                  <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-red-500/20 text-red-400 text-xs font-bold uppercase tracking-wider">
                    NOT ELIGIBLE ⚠️
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                    You do not meet one or more corporate cutoff requirements.
                  </h2>
                  <p className="text-xs sm:text-sm text-red-200/80 leading-relaxed max-w-2xl">
                    <strong>Disqualification Reasons:</strong> {failedCriteriaList.join("; ")}.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsEditModalOpen(true)}
                className="px-5 py-3 rounded-xl bg-[#202226] hover:bg-[#2C2E33] border border-red-500/30 text-white text-xs sm:text-sm font-bold transition whitespace-nowrap shrink-0 flex items-center gap-2"
              >
                <Edit3 className="w-4 h-4 text-red-400" />
                <span>Re-check / Edit Details</span>
              </button>
            </div>
          )}

          {/* Detailed Live Comparison Table */}
          <div className="rounded-3xl bg-[#1A1B1E] border border-[#2C2E33] p-6 sm:p-7 space-y-4 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-[#2C2E33]">
              <div>
                <h3 className="text-lg font-bold text-white tracking-tight">
                  Detailed Academic Cutoff Breakdown
                </h3>
                <p className="text-xs text-zinc-400">
                  Automated comparison between company cutoff rules and your authenticated profile record.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsEditModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#121316] hover:bg-[#202226] border border-[#2C2E33] text-zinc-300 hover:text-white text-xs font-semibold transition"
              >
                <Edit3 className="w-3.5 h-3.5 text-blue-400" />
                <span>Edit Academic Details</span>
              </button>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead>
                  <tr className="border-b border-[#2C2E33] text-zinc-400 text-xs font-bold uppercase tracking-wider">
                    <th className="pb-3 pr-4">Criterion</th>
                    <th className="pb-3 px-4">Company Cutoff</th>
                    <th className="pb-3 px-4">Your Record</th>
                    <th className="pb-3 px-4">Result</th>
                    <th className="pb-3 pl-4">Evaluation Feedback</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#2C2E33]/60">
                  {/* Row 1: CGPA */}
                  <tr className="hover:bg-[#161719]/50 transition">
                    <td className="py-3.5 pr-4 font-bold text-white">
                      Cumulative GPA (CGPA)
                    </td>
                    <td className="py-3.5 px-4 text-zinc-300 font-semibold">
                      Min {currentRole.criteria.minCgpa} CGPA
                    </td>
                    <td className="py-3.5 px-4 font-bold text-white">
                      {studentProfile.cgpa} CGPA
                    </td>
                    <td className="py-3.5 px-4">
                      {cgpaPass ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-emerald-500/15 text-emerald-400 font-bold text-xs border border-emerald-500/30">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Eligible
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-red-500/15 text-red-400 font-bold text-xs border border-red-500/30">
                          <XCircle className="w-3.5 h-3.5" /> Disqualified
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 pl-4 text-xs text-zinc-400">
                      {cgpaPass
                        ? `Your CGPA exceeds minimum threshold by +${(studentProfile.cgpa - currentRole.criteria.minCgpa).toFixed(2)}.`
                        : `CGPA is below the minimum required ${currentRole.criteria.minCgpa}.`}
                    </td>
                  </tr>

                  {/* Row 2: Active Backlogs */}
                  <tr className="hover:bg-[#161719]/50 transition">
                    <td className="py-3.5 pr-4 font-bold text-white">
                      Active Backlogs / Arrears
                    </td>
                    <td className="py-3.5 px-4 text-zinc-300 font-semibold">
                      Max {currentRole.criteria.maxBacklogs} Backlogs
                    </td>
                    <td className="py-3.5 px-4 font-bold text-white">
                      {studentProfile.backlogs} Backlogs
                    </td>
                    <td className="py-3.5 px-4">
                      {backlogsPass ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-emerald-500/15 text-emerald-400 font-bold text-xs border border-emerald-500/30">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Eligible
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-red-500/15 text-red-400 font-bold text-xs border border-red-500/30">
                          <XCircle className="w-3.5 h-3.5" /> Disqualified
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 pl-4 text-xs text-zinc-400">
                      {backlogsPass
                        ? "Active backlogs are within the corporate permissible threshold."
                        : `Exceeds maximum allowable backlogs (${currentRole.criteria.maxBacklogs}).`}
                    </td>
                  </tr>

                  {/* Row 3: Academic Branch */}
                  <tr className="hover:bg-[#161719]/50 transition">
                    <td className="py-3.5 pr-4 font-bold text-white">
                      Degree Branch / Discipline
                    </td>
                    <td className="py-3.5 px-4 text-zinc-300 font-semibold max-w-xs truncate">
                      {currentRole.criteria.allowedBranches.join(", ")}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-white max-w-xs truncate">
                      {studentProfile.branch}
                    </td>
                    <td className="py-3.5 px-4">
                      {branchPass ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-emerald-500/15 text-emerald-400 font-bold text-xs border border-emerald-500/30">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Eligible
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-red-500/15 text-red-400 font-bold text-xs border border-red-500/30">
                          <XCircle className="w-3.5 h-3.5" /> Disqualified
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 pl-4 text-xs text-zinc-400">
                      {branchPass
                        ? "Your engineering branch is accredited for this recruitment track."
                        : "Candidate's academic discipline is not eligible for this role."}
                    </td>
                  </tr>

                  {/* Row 4: Graduation Batch */}
                  <tr className="hover:bg-[#161719]/50 transition">
                    <td className="py-3.5 pr-4 font-bold text-white">
                      Graduation Batch (Passing Year)
                    </td>
                    <td className="py-3.5 px-4 text-zinc-300 font-semibold">
                      Class of {currentRole.criteria.eligibleBatches.join(" / ")}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-white">
                      Class of {studentProfile.graduationYear}
                    </td>
                    <td className="py-3.5 px-4">
                      {batchPass ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-emerald-500/15 text-emerald-400 font-bold text-xs border border-emerald-500/30">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Eligible
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-red-500/15 text-red-400 font-bold text-xs border border-red-500/30">
                          <XCircle className="w-3.5 h-3.5" /> Disqualified
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 pl-4 text-xs text-zinc-400">
                      {batchPass
                        ? "Graduation year matches current campus drive cohort."
                        : `Drive is restricted to batches: ${currentRole.criteria.eligibleBatches.join(", ")}.`}
                    </td>
                  </tr>

                  {/* Row 5: 10th & 12th Cutoffs */}
                  <tr className="hover:bg-[#161719]/50 transition">
                    <td className="py-3.5 pr-4 font-bold text-white">
                      Secondary (10th / 12th %)
                    </td>
                    <td className="py-3.5 px-4 text-zinc-300 font-semibold">
                      Min {currentRole.criteria.min10thPercent}% (10th & 12th)
                    </td>
                    <td className="py-3.5 px-4 font-bold text-white">
                      10th: {studentProfile.tenthPercent}% | 12th: {studentProfile.twelfthPercent}%
                    </td>
                    <td className="py-3.5 px-4">
                      {secondaryEducationPass ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-emerald-500/15 text-emerald-400 font-bold text-xs border border-emerald-500/30">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Eligible
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-red-500/15 text-red-400 font-bold text-xs border border-red-500/30">
                          <XCircle className="w-3.5 h-3.5" /> Disqualified
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 pl-4 text-xs text-zinc-400">
                      {secondaryEducationPass
                        ? "Secondary and senior secondary board scores clear the minimum cutoff."
                        : "One or more secondary board percentages fall below required benchmark."}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Next Action Buttons */}
            <div className="pt-4 border-t border-[#2C2E33] flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsEditModalOpen(true)}
                className="py-3 px-5 rounded-xl bg-[#121316] hover:bg-[#202226] border border-[#2C2E33] text-zinc-300 hover:text-white text-xs sm:text-sm font-semibold transition flex items-center justify-center gap-2"
              >
                <Edit3 className="w-4 h-4 text-blue-400" />
                <span>Re-check / Edit My Academic Details</span>
              </button>

              <button
                type="button"
                onClick={handleLockInTarget}
                className="py-3 px-6 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs sm:text-sm font-bold shadow-lg shadow-blue-600/25 transition flex items-center justify-center gap-2"
              >
                <Lock className="w-4 h-4" />
                <span>Lock in as Target & View Selection Roadmap</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </main>
      </div>

      {/* Modal 1: Edit Academic Details Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="fixed inset-0" onClick={() => setIsEditModalOpen(false)} />

          <div className="relative w-full max-w-lg bg-[#1A1B1E] border border-[#2C2E33] rounded-3xl p-6 sm:p-7 shadow-2xl z-10 space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-[#2C2E33]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center border border-blue-500/30">
                  <Edit3 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white tracking-tight">
                    Edit Academic Profile Record
                  </h3>
                  <p className="text-xs text-zinc-400">
                    Adjust parameters to simulate live eligibility recalculation
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-[#202226]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-300 block">
                    Current CGPA *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="10"
                    required
                    value={tempProfile.cgpa}
                    onChange={(e) =>
                      setTempProfile({ ...tempProfile, cgpa: parseFloat(e.target.value) || 0 })
                    }
                    className="w-full bg-[#121316] border border-[#2C2E33] focus:border-blue-500 rounded-xl px-4 py-2 text-sm text-white outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-300 block">
                    Active Backlogs *
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="10"
                    required
                    value={tempProfile.backlogs}
                    onChange={(e) =>
                      setTempProfile({ ...tempProfile, backlogs: parseInt(e.target.value) || 0 })
                    }
                    className="w-full bg-[#121316] border border-[#2C2E33] focus:border-blue-500 rounded-xl px-4 py-2 text-sm text-white outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-300 block">
                  Degree Branch / Discipline *
                </label>
                <select
                  value={tempProfile.branch}
                  onChange={(e) => setTempProfile({ ...tempProfile, branch: e.target.value })}
                  className="w-full bg-[#121316] border border-[#2C2E33] focus:border-blue-500 rounded-xl px-4 py-2 text-sm text-white outline-none cursor-pointer"
                >
                  <option value="Computer Science & Engineering">Computer Science & Engineering (CSE)</option>
                  <option value="Information Technology">Information Technology (IT)</option>
                  <option value="Electronics & Communication">Electronics & Communication (ECE)</option>
                  <option value="Electrical & Electronics">Electrical & Electronics (EEE)</option>
                  <option value="Mechanical Engineering">Mechanical Engineering</option>
                  <option value="Civil Engineering">Civil Engineering</option>
                </select>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-300 block">
                    Grad Year *
                  </label>
                  <input
                    type="number"
                    value={tempProfile.graduationYear}
                    onChange={(e) =>
                      setTempProfile({ ...tempProfile, graduationYear: parseInt(e.target.value) || 2026 })
                    }
                    className="w-full bg-[#121316] border border-[#2C2E33] focus:border-blue-500 rounded-xl px-3 py-2 text-xs text-white outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-300 block">
                    10th % *
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={tempProfile.tenthPercent}
                    onChange={(e) =>
                      setTempProfile({ ...tempProfile, tenthPercent: parseFloat(e.target.value) || 0 })
                    }
                    className="w-full bg-[#121316] border border-[#2C2E33] focus:border-blue-500 rounded-xl px-3 py-2 text-xs text-white outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-300 block">
                    12th % *
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={tempProfile.twelfthPercent}
                    onChange={(e) =>
                      setTempProfile({ ...tempProfile, twelfthPercent: parseFloat(e.target.value) || 0 })
                    }
                    className="w-full bg-[#121316] border border-[#2C2E33] focus:border-blue-500 rounded-xl px-3 py-2 text-xs text-white outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#2C2E33]">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-[#202226] text-zinc-300 hover:text-white text-xs font-semibold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md shadow-blue-600/30 transition"
                >
                  Apply & Recalculate
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 2: Selection Roadmap Modal */}
      {isRoadmapModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="fixed inset-0" onClick={() => setIsRoadmapModalOpen(false)} />

          <div className="relative w-full max-w-2xl bg-[#1A1B1E] border border-[#2C2E33] rounded-3xl p-6 sm:p-8 shadow-2xl z-10 space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-[#2C2E33]">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/25">
                  <Award className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white tracking-tight">
                    {currentCompany.name} • Selection Roadmap
                  </h3>
                  <p className="text-xs text-zinc-400">
                    Target Track: <strong className="text-emerald-400">{currentRole.title}</strong> ({currentRole.packageLPA})
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsRoadmapModalOpen(false)}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-[#202226]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Stages Roadmap Timeline */}
            <div className="space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-blue-400">
                Recommended 4-Stage Preparation Blueprint
              </h4>

              <div className="space-y-3">
                {currentRole.selectionStages.map((stage, idx) => (
                  <div
                    key={stage}
                    className="flex items-start gap-3 p-4 rounded-2xl bg-[#121316] border border-[#2C2E33]"
                  >
                    <div className="w-7 h-7 rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/30 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                      {idx + 1}
                    </div>
                    <div className="space-y-1">
                      <div className="text-sm font-bold text-white">{stage}</div>
                      <div className="text-xs text-zinc-400">
                        {idx === 0
                          ? `Practice quantitative aptitude, logical reasoning, and verbal tests in our Practice portal.`
                          : idx === 1
                          ? `Solve key DSA patterns: ${currentRole.requiredSkills.slice(0, 3).join(", ")} in our Workbook.`
                          : idx === 2
                          ? `Review core CS topics (OOPS, DBMS, OS, Networking) in Prep Hub video masterclasses.`
                          : `Prepare HR situational answers and review real company interview experiences.`}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Jump into Prep Workspace CTA */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-[#FF5722]/10 to-[#F15A24]/10 border border-[#FF5722]/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <div className="text-xs font-bold text-white">
                  Ready to Start Preparing for {currentCompany.shortName}?
                </div>
                <div className="text-[11px] text-zinc-400">
                  Switch to the Preparation Workspace to access practice problems and video lectures.
                </div>
              </div>
              <Link
                href="/dashboard"
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#FF5722] to-[#F15A24] text-white text-xs font-bold shadow-md shadow-[#FF5722]/25 shrink-0 flex items-center gap-1.5"
              >
                <span>Go to Dashboard</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
