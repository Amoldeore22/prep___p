"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import PipelineSidebar from "@/components/layout/PipelineSidebar";
import StudentNavbar from "@/components/layout/StudentNavbar";
import StepProgressHeader from "./StepProgressHeader";
import { PIPELINE_COMPANIES, PipelineCompany, CompanyRole } from "@/data/pipeline-data";
import {
  ArrowLeft,
  ArrowRight,
  Target,
  Building2,
  Briefcase,
  CheckCircle2,
  Sparkles,
  Layers,
  GraduationCap,
  Star,
  ChevronRight,
  ListOrdered,
} from "lucide-react";

export default function JobRolesStepView({ initialCompanyId }: { initialCompanyId?: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const companyQueryParam = searchParams.get("companyId") || initialCompanyId || "";

  // Find selected company from query or saved target, or fallback to first company (TCS)
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>(() => {
    if (companyQueryParam) return companyQueryParam;
    try {
      const saved = localStorage.getItem("pp_target_company");
      if (saved && PIPELINE_COMPANIES.some((c) => c.id === saved)) return saved;
    } catch {
      // Ignore
    }
    return PIPELINE_COMPANIES[0].id;
  });

  const [savedTargetRoleId, setSavedTargetRoleId] = useState<string | null>(null);
  const [toastMsg, setToastMsg] = useState("");

  useEffect(() => {
    if (companyQueryParam && PIPELINE_COMPANIES.some((c) => c.id === companyQueryParam)) {
      setSelectedCompanyId(companyQueryParam);
    }
  }, [companyQueryParam]);

  useEffect(() => {
    try {
      const savedRole = localStorage.getItem("pp_target_role");
      if (savedRole) setSavedTargetRoleId(savedRole);
    } catch {
      // Ignore
    }
  }, []);

  const currentCompany =
    PIPELINE_COMPANIES.find((c) => c.id === selectedCompanyId) || PIPELINE_COMPANIES[0];

  const handleSetTargetRole = (role: CompanyRole, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      if (savedTargetRoleId === role.id) {
        localStorage.removeItem("pp_target_role");
        localStorage.removeItem("pp_target_role_name");
        setSavedTargetRoleId(null);
        setToastMsg(`Removed ${role.title} as target.`);
      } else {
        localStorage.setItem("pp_target_company", currentCompany.id);
        localStorage.setItem("pp_target_company_name", currentCompany.name);
        localStorage.setItem("pp_target_role", role.id);
        localStorage.setItem("pp_target_role_name", role.title);
        setSavedTargetRoleId(role.id);
        setToastMsg(`"${role.title}" locked in as your target role! 🎯`);
      }
      setTimeout(() => setToastMsg(""), 3500);
    } catch {
      // Ignore
    }
  };

  return (
    <div className="flex min-h-screen bg-[#121316] text-[#FFFFFF]">
      <PipelineSidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <StudentNavbar title={`Placement Pipeline • Step 2: Roles at ${currentCompany.shortName}`} />

        <main className="p-4 sm:p-6 md:p-8 space-y-6 md:space-y-8 flex-1 overflow-y-auto max-w-7xl w-full mx-auto">
          {/* Step 1 ➔ Step 2 ➔ Step 3 Progress Bar */}
          <StepProgressHeader
            currentStep={2}
            companyId={currentCompany.id}
            companyName={currentCompany.shortName}
          />

          {/* Toast Notification */}
          {toastMsg && (
            <div className="flex items-center gap-2.5 p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-sm shadow-xl animate-in fade-in duration-200">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              <span className="font-semibold">{toastMsg}</span>
            </div>
          )}

          {/* Context Header: Selected Company Banner */}
          <div className="relative overflow-hidden rounded-3xl p-6 sm:p-8 bg-gradient-to-r from-[#1A1B1E] via-[#202226] to-[#1A1B1E] border border-[#2C2E33] shadow-2xl">
            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-3 max-w-2xl">
                <div className="flex flex-wrap items-center gap-2">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/15 border border-blue-500/30 text-blue-400 text-xs font-semibold">
                    <Target className="w-3.5 h-3.5" />
                    <span>Step 2 of 3: Hiring Tracks</span>
                  </div>
                  <span className="text-xs px-2.5 py-1 rounded-full bg-[#121316] text-zinc-400 border border-[#2C2E33]">
                    {currentCompany.industry} • {currentCompany.category}
                  </span>
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
                    <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                      Open Placement Tracks at {currentCompany.name}
                    </h1>
                    <span className="text-xs text-emerald-400 font-bold block mt-0.5">
                      Typical CTC Package Range: {currentCompany.packageRange}
                    </span>
                  </div>
                </div>

                <p className="text-xs sm:text-sm text-[#9CA3AF] leading-relaxed">
                  Select a specific recruitment cadre or job track to inspect its technical skill requirements and automated live eligibility cutoffs.
                </p>
              </div>

              {/* Company Switcher Dropdown & Change Company Link */}
              <div className="flex flex-col sm:flex-row md:flex-col items-start md:items-end gap-3 shrink-0">
                <Link
                  href="/pipeline/companies"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#121316] hover:bg-[#202226] border border-[#2C2E33] text-zinc-300 hover:text-white text-xs font-semibold transition"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Change Company (Step 1)</span>
                </Link>

                {/* Quick Switch Dropdown */}
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-zinc-500 font-medium">Switch To:</span>
                  <select
                    value={selectedCompanyId}
                    onChange={(e) => {
                      setSelectedCompanyId(e.target.value);
                      router.push(`/pipeline/roles?companyId=${e.target.value}`);
                    }}
                    className="bg-[#121316] border border-[#2C2E33] text-white rounded-xl px-3 py-1.5 text-xs font-semibold outline-none cursor-pointer focus:border-blue-500"
                  >
                    {PIPELINE_COMPANIES.map((comp) => (
                      <option key={comp.id} value={comp.id}>
                        {comp.shortName} ({comp.roles.length} roles)
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Glowing Accent */}
            <div className="absolute -right-20 -bottom-20 w-80 h-80 rounded-full bg-blue-600/10 blur-3xl pointer-events-none" />
          </div>

          {/* Role Cards Grid */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base sm:text-lg font-bold text-white tracking-tight flex items-center gap-2">
                <span>Available Roles for {currentCompany.shortName}</span>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-500/15 text-blue-400 font-bold border border-blue-500/30">
                  {currentCompany.roles.length} Tracks
                </span>
              </h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {currentCompany.roles.map((role) => {
                const isTargetRole = savedTargetRoleId === role.id;

                return (
                  <div
                    key={role.id}
                    className={`rounded-3xl border transition-all duration-200 bg-[#1A1B1E] p-6 flex flex-col justify-between space-y-6 shadow-xl relative hover:-translate-y-0.5 ${
                      isTargetRole
                        ? "border-blue-500/70 ring-1 ring-blue-500/30 shadow-blue-500/10"
                        : "border-[#2C2E33] hover:border-blue-500/40"
                    }`}
                  >
                    <div className="space-y-5">
                      {/* Role Header */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-1 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-md bg-blue-500/15 text-blue-400 border border-blue-500/30">
                              {role.trackBadge}
                            </span>
                            {isTargetRole && (
                              <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-md bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                                ★ Target Role
                              </span>
                            )}
                          </div>
                          <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight">
                            {role.title}
                          </h3>
                        </div>

                        {/* CTC Package Callout */}
                        <div className="text-right shrink-0 bg-[#121316] px-3.5 py-2 rounded-2xl border border-[#2C2E33]">
                          <span className="text-[10px] uppercase font-bold text-zinc-500 block">
                            Offered CTC
                          </span>
                          <span className="text-sm sm:text-base font-extrabold text-emerald-400">
                            {role.packageLPA}
                          </span>
                        </div>
                      </div>

                      {/* Overview */}
                      <p className="text-xs text-[#9CA3AF] leading-relaxed">
                        {role.overview}
                      </p>

                      {/* Required Skills Chips */}
                      <div className="space-y-1.5">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 block">
                          Key Required Skills
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {role.requiredSkills.map((skill) => (
                            <span
                              key={skill}
                              className="text-xs px-2.5 py-1 rounded-lg bg-[#121316] text-zinc-300 border border-[#2C2E33] font-medium"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Minimum Criteria Summary Box */}
                      <div className="p-3.5 rounded-2xl bg-[#121316] border border-[#2C2E33] space-y-2">
                        <div className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
                          <GraduationCap className="w-3.5 h-3.5 text-blue-400" />
                          <span>Minimum Eligibility Criteria Summary</span>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                          <div className="bg-[#1A1B1E] p-2 rounded-xl border border-[#2C2E33]/70">
                            <span className="text-[10px] text-zinc-500 block">Min CGPA</span>
                            <span className="font-bold text-white">{role.criteria.minCgpa}+</span>
                          </div>
                          <div className="bg-[#1A1B1E] p-2 rounded-xl border border-[#2C2E33]/70">
                            <span className="text-[10px] text-zinc-500 block">Backlogs</span>
                            <span className="font-bold text-white">Max {role.criteria.maxBacklogs}</span>
                          </div>
                          <div className="bg-[#1A1B1E] p-2 rounded-xl border border-[#2C2E33]/70">
                            <span className="text-[10px] text-zinc-500 block">10th / 12th</span>
                            <span className="font-bold text-white">{role.criteria.min10thPercent}%</span>
                          </div>
                          <div className="bg-[#1A1B1E] p-2 rounded-xl border border-[#2C2E33]/70">
                            <span className="text-[10px] text-zinc-500 block">Batches</span>
                            <span className="font-bold text-white">{role.criteria.eligibleBatches.join(", ")}</span>
                          </div>
                        </div>
                        <div className="text-[11px] text-zinc-400 pt-1">
                          <strong className="text-zinc-300">Allowed Branches:</strong>{" "}
                          {role.criteria.allowedBranches.slice(0, 4).join(", ")}
                          {role.criteria.allowedBranches.length > 4 ? " & others" : ""}
                        </div>
                      </div>

                      {/* Selection Stages Preview */}
                      <div className="space-y-1.5">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
                          <ListOrdered className="w-3.5 h-3.5 text-blue-400" />
                          <span>Hiring Selection Stages</span>
                        </span>
                        <div className="flex flex-wrap items-center gap-1.5 text-xs text-zinc-300">
                          {role.selectionStages.map((stage, idx) => (
                            <React.Fragment key={stage}>
                              <span className="px-2.5 py-1 rounded-lg bg-[#161719] border border-[#2C2E33] text-[11px] font-medium text-zinc-300">
                                {stage}
                              </span>
                              {idx < role.selectionStages.length - 1 && (
                                <span className="text-zinc-600 font-bold">➔</span>
                              )}
                            </React.Fragment>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="pt-4 border-t border-[#2C2E33] space-y-2">
                      <Link
                        href={`/pipeline/eligibility?companyId=${currentCompany.id}&roleId=${role.id}`}
                        className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs sm:text-sm font-bold shadow-md shadow-blue-600/25 flex items-center justify-center gap-2 transition"
                      >
                        <span>Check My Eligibility</span>
                        <ArrowRight className="w-4 h-4" />
                      </Link>

                      <button
                        type="button"
                        onClick={(e) => handleSetTargetRole(role, e)}
                        className={`w-full py-2 rounded-xl text-xs font-semibold transition border ${
                          isTargetRole
                            ? "bg-blue-600/10 text-blue-400 border-blue-500/30 hover:bg-blue-600/20"
                            : "bg-transparent text-zinc-400 border-[#2C2E33] hover:text-white hover:bg-[#202226]"
                        }`}
                      >
                        {isTargetRole ? "★ Target Role Saved (Click to Unset)" : "Save as My Target Role"}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
