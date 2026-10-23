"use client";

import React from "react";
import Link from "next/link";
import { Check, ChevronRight, Building2, Target, ShieldCheck } from "lucide-react";

interface StepProgressHeaderProps {
  currentStep: 1 | 2 | 3;
  companyId?: string;
  roleId?: string;
  companyName?: string;
  roleTitle?: string;
}

export default function StepProgressHeader({
  currentStep,
  companyId,
  roleId,
  companyName,
  roleTitle,
}: StepProgressHeaderProps) {
  const steps = [
    {
      num: 1,
      label: "Select Company",
      icon: Building2,
      href: "/pipeline/companies",
      activeText: companyName || "Choose recruiter",
    },
    {
      num: 2,
      label: "Choose Job Role",
      icon: Target,
      href: companyId ? `/pipeline/roles?companyId=${companyId}` : "/pipeline/roles",
      activeText: roleTitle || "Select track",
    },
    {
      num: 3,
      label: "Check Eligibility",
      icon: ShieldCheck,
      href:
        companyId && roleId
          ? `/pipeline/eligibility?companyId=${companyId}&roleId=${roleId}`
          : "/pipeline/eligibility",
      activeText: "Live cutoff evaluation",
    },
  ];

  return (
    <div className="bg-[#1A1B1E] border border-[#2C2E33] rounded-2xl p-4 sm:p-5 shadow-xl space-y-3">
      {/* Step Indicator Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {steps.map((step, idx) => {
          const isCurrent = currentStep === step.num;
          const isCompleted = currentStep > step.num;
          const StepIcon = step.icon;

          return (
            <div key={step.num} className="flex items-center gap-3">
              <Link
                href={step.href}
                className={`flex-1 flex items-center gap-3 p-3 rounded-xl border transition-all ${
                  isCurrent
                    ? "bg-gradient-to-r from-blue-600/20 via-blue-500/15 to-indigo-600/20 border-blue-500/50 text-white shadow-md shadow-blue-500/10 ring-1 ring-blue-500/30"
                    : isCompleted
                    ? "bg-[#161719] border-emerald-500/30 text-zinc-300 hover:border-emerald-500/60"
                    : "bg-[#161719] border-[#2C2E33] text-zinc-500 hover:border-zinc-700 hover:text-zinc-400"
                }`}
              >
                {/* Step Circle Badge */}
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 transition ${
                    isCurrent
                      ? "bg-blue-600 text-white shadow-md shadow-blue-600/30"
                      : isCompleted
                      ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
                      : "bg-[#202226] text-zinc-500 border border-[#2C2E33]"
                  }`}
                >
                  {isCompleted ? <Check className="w-4 h-4 text-emerald-400" /> : step.num}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                      Step {step.num}
                    </span>
                    {isCurrent && (
                      <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-blue-500/20 text-blue-400 border border-blue-500/30">
                        Current
                      </span>
                    )}
                  </div>
                  <div className="text-xs sm:text-sm font-bold text-white truncate">
                    {step.label}
                  </div>
                  <div className="text-[11px] text-zinc-400 truncate">
                    {step.activeText}
                  </div>
                </div>
              </Link>

              {idx < steps.length - 1 && (
                <div className="hidden sm:flex text-zinc-600">
                  <ChevronRight className="w-4 h-4" />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
