"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import PipelineSidebar from "@/components/layout/PipelineSidebar";
import StudentNavbar from "@/components/layout/StudentNavbar";
import StepProgressHeader from "./StepProgressHeader";
import { PIPELINE_COMPANIES, PipelineCompany } from "@/data/pipeline-data";
import {
  Search,
  Building2,
  Briefcase,
  Star,
  ArrowRight,
  Sparkles,
  MapPin,
  CheckCircle2,
  X,
  Layers,
  GraduationCap,
} from "lucide-react";

export default function CompaniesStepView() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIndustry, setSelectedIndustry] = useState<string>("All");
  const [targetCompanyId, setTargetCompanyId] = useState<string | null>(null);
  const [toastMsg, setToastMsg] = useState("");

  useEffect(() => {
    try {
      const saved = localStorage.getItem("pp_target_company");
      if (saved) setTargetCompanyId(saved);
    } catch {
      // Ignore
    }
  }, []);

  const handleSetTargetCompany = (company: PipelineCompany, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      if (targetCompanyId === company.id) {
        localStorage.removeItem("pp_target_company");
        localStorage.removeItem("pp_target_company_name");
        setTargetCompanyId(null);
        setToastMsg(`Removed ${company.name} as target.`);
      } else {
        localStorage.setItem("pp_target_company", company.id);
        localStorage.setItem("pp_target_company_name", company.name);
        setTargetCompanyId(company.id);
        setToastMsg(`"${company.name}" set as your target company! 🎯`);
      }
      setTimeout(() => setToastMsg(""), 3500);
    } catch {
      // Ignore
    }
  };

  const industries = ["All", "IT Services", "Product", "Consulting", "BFSI"];

  const filteredCompanies = PIPELINE_COMPANIES.filter((comp) => {
    const matchesIndustry =
      selectedIndustry === "All" || comp.industry === selectedIndustry;
    const matchesSearch =
      comp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      comp.shortName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      comp.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      comp.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesIndustry && matchesSearch;
  });

  return (
    <div className="flex min-h-screen bg-[#121316] text-[#FFFFFF]">
      <PipelineSidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <StudentNavbar title="Placement Pipeline • Step 1: Select Company" />

        <main className="p-4 sm:p-6 md:p-8 space-y-6 md:space-y-8 flex-1 overflow-y-auto max-w-7xl w-full mx-auto">
          {/* Step 1 ➔ Step 2 ➔ Step 3 Progress Bar */}
          <StepProgressHeader currentStep={1} />

          {/* Toast Notification */}
          {toastMsg && (
            <div className="flex items-center gap-2.5 p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-sm shadow-xl animate-in fade-in duration-200">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              <span className="font-semibold">{toastMsg}</span>
            </div>
          )}

          {/* Header Banner */}
          <div className="relative overflow-hidden rounded-3xl p-6 sm:p-8 bg-gradient-to-r from-[#1A1B1E] via-[#202226] to-[#1A1B1E] border border-[#2C2E33] shadow-2xl">
            <div className="relative z-10 space-y-3 max-w-3xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/15 border border-blue-500/30 text-blue-400 text-xs font-semibold">
                <Building2 className="w-3.5 h-3.5" />
                <span>Step 1 of 3: Target Recruiter Selection</span>
              </div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight">
                Select Your Target Company
              </h1>
              <p className="text-xs sm:text-sm text-[#9CA3AF] leading-relaxed">
                Choose a leading campus recruiter to explore their open hiring tracks, package distributions, and run automated live cutoff eligibility checks.
              </p>
            </div>

            {/* Glowing Accent */}
            <div className="absolute -right-20 -bottom-20 w-80 h-80 rounded-full bg-blue-600/10 blur-3xl pointer-events-none" />
          </div>

          {/* Search Bar & Industry Filter Pills */}
          <div className="space-y-4 p-4 sm:p-5 rounded-2xl bg-[#1A1B1E] border border-[#2C2E33]">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
              {/* Search Bar */}
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by company name or keywords (e.g. TCS, Amazon)..."
                  className="w-full bg-[#121316] border border-[#2C2E33] focus:border-blue-500 rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-white placeholder-zinc-500 focus:outline-none transition"
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

              {/* Count */}
              <div className="text-xs text-zinc-400 shrink-0">
                Showing <strong className="text-white font-bold">{filteredCompanies.length}</strong> recruiters
              </div>
            </div>

            {/* Industry Filter Buttons */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
              <span className="text-xs text-zinc-500 font-semibold mr-1 shrink-0">
                Industry:
              </span>
              {industries.map((ind) => (
                <button
                  key={ind}
                  type="button"
                  onClick={() => setSelectedIndustry(ind)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition border whitespace-nowrap ${
                    selectedIndustry === ind
                      ? "bg-blue-600 text-white border-blue-500 shadow-md shadow-blue-600/25"
                      : "bg-[#121316] text-[#9CA3AF] border-[#2C2E33] hover:text-white hover:bg-[#202226]"
                  }`}
                >
                  {ind}
                </button>
              ))}
            </div>
          </div>

          {/* Companies Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCompanies.map((company) => {
              const isTarget = targetCompanyId === company.id;

              return (
                <div
                  key={company.id}
                  className={`group rounded-3xl border transition-all duration-200 bg-[#1A1B1E] p-6 flex flex-col justify-between space-y-5 shadow-xl relative hover:-translate-y-1 ${
                    isTarget
                      ? "border-blue-500/70 ring-1 ring-blue-500/30 shadow-blue-500/10"
                      : "border-[#2C2E33] hover:border-blue-500/40"
                  }`}
                >
                  {/* Top Row: Logo, Name & Target Pin */}
                  <div className="space-y-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-white p-2 border border-white/20 flex items-center justify-center shrink-0 shadow-md group-hover:scale-105 transition-transform overflow-hidden">
                          <img
                            src={company.logo}
                            alt={`${company.name} logo`}
                            className="w-full h-full object-contain"
                            loading="lazy"
                            onError={(e) => {
                              const target = e.currentTarget;
                              target.style.display = "none";
                              if (target.parentElement) {
                                target.parentElement.classList.remove("bg-white", "p-2");
                                target.parentElement.classList.add("bg-[#2C2E33]");
                                target.parentElement.innerHTML = `<span class="text-xs font-bold text-white">${company.shortName.slice(0, 3)}</span>`;
                              }
                            }}
                          />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-base sm:text-lg font-bold text-white tracking-tight leading-snug group-hover:text-blue-400 transition-colors">
                              {company.name}
                            </h3>
                          </div>
                          <span className="text-xs text-zinc-400 font-medium block">
                            {company.industry} • {company.category}
                          </span>
                        </div>
                      </div>

                      {/* Target Pin Button */}
                      <button
                        type="button"
                        onClick={(e) => handleSetTargetCompany(company, e)}
                        title={isTarget ? "Target Company Active" : "Set as My Target Company"}
                        className={`p-2 rounded-xl border transition shrink-0 ${
                          isTarget
                            ? "bg-blue-600/20 text-blue-400 border-blue-500/50 shadow-sm"
                            : "bg-[#121316] text-zinc-500 border-[#2C2E33] hover:text-white hover:border-zinc-600"
                        }`}
                      >
                        <Star className={`w-4 h-4 ${isTarget ? "fill-blue-400 text-blue-400" : ""}`} />
                      </button>
                    </div>

                    {isTarget && (
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-500/15 border border-blue-500/30 text-blue-400 text-[11px] font-bold">
                        <Sparkles className="w-3 h-3" />
                        <span>My Locked Target Company</span>
                      </div>
                    )}

                    <p className="text-xs text-[#9CA3AF] line-clamp-2 leading-relaxed">
                      {company.description}
                    </p>

                    {/* Metrics Row: Package Range & Active Roles */}
                    <div className="grid grid-cols-2 gap-3 p-3 rounded-2xl bg-[#121316] border border-[#2C2E33]/70">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-zinc-500 block">
                          Package Range
                        </span>
                        <span className="text-xs sm:text-sm font-extrabold text-emerald-400">
                          {company.packageRange}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] uppercase font-bold text-zinc-500 block">
                          Active Tracks
                        </span>
                        <span className="text-xs sm:text-sm font-extrabold text-white">
                          {company.activeRolesCount} Roles Available
                        </span>
                      </div>
                    </div>

                    {/* Cutoff Snapshot */}
                    <div className="flex items-center gap-2 text-xs text-zinc-400 bg-[#161719] px-3 py-2 rounded-xl border border-[#2C2E33]">
                      <GraduationCap className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                      <span className="truncate">{company.cutoffSnapshot}</span>
                    </div>
                  </div>

                  {/* Actions Row */}
                  <div className="pt-3 border-t border-[#2C2E33] space-y-2">
                    <Link
                      href={`/pipeline/roles?companyId=${company.id}`}
                      className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs sm:text-sm font-bold shadow-md shadow-blue-600/20 flex items-center justify-center gap-2 transition"
                    >
                      <span>Explore Roles</span>
                      <ArrowRight className="w-4 h-4" />
                    </Link>

                    <button
                      type="button"
                      onClick={(e) => handleSetTargetCompany(company, e)}
                      className={`w-full py-2 rounded-xl text-xs font-semibold transition border ${
                        isTarget
                          ? "bg-blue-600/10 text-blue-400 border-blue-500/30 hover:bg-blue-600/20"
                          : "bg-transparent text-zinc-400 border-[#2C2E33] hover:text-white hover:bg-[#202226]"
                      }`}
                    >
                      {isTarget ? "★ Target Selected (Click to Unset)" : "Set as My Target Company"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </main>
      </div>
    </div>
  );
}
