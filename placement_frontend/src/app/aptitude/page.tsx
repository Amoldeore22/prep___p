"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import StudentSidebar from "@/components/layout/StudentSidebar";
import StudentNavbar from "@/components/layout/StudentNavbar";
import {
  HelpCircle,
  Sparkles,
  Calendar,
  Layers,
  ArrowRight,
  CheckCircle2,
  Trophy,
  Target,
  BrainCircuit,
  Zap,
} from "lucide-react";

export default function AptitudeHubPage() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/analytics/student")
      .then((res) => res.json())
      .then((data) => {
        if (data.aptitude) setStats(data.aptitude);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="flex min-h-screen bg-[#121316] text-zinc-100">
      <StudentSidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <StudentNavbar title="Placement Aptitude Center" />

        <main className="flex-1 p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-8">
          {/* Header Banner */}
          <div className="relative overflow-hidden rounded-3xl bg-[#1A1B1E] border border-[#2C2E33] p-8 shadow-2xl">
            <div className="relative z-10 max-w-2xl space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FF5722]/10 border border-[#FF5722]/20 text-[#FF5722] text-xs font-semibold">
                <BrainCircuit className="w-3.5 h-3.5" />
                <span>Placement Aptitude Standard Assessment</span>
              </div>
              <h1 className="text-3xl font-extrabold tracking-tight text-white">
                Master Quantitative, Logical & Verbal Aptitude
              </h1>
              <p className="text-zinc-400 text-sm leading-relaxed">
                Campus placement assessment tests filter over 70% of candidates. Practice daily standardized 10-question tests or drill specific modules at your own pace.
              </p>
            </div>
            <div className="absolute right-0 bottom-0 translate-x-8 translate-y-8 opacity-5 pointer-events-none">
              <HelpCircle className="w-96 h-96 text-white" />
            </div>
          </div>

          {/* Cards for Options */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Daily Quiz Card */}
            <div className="p-8 rounded-3xl bg-[#1A1B1E] border border-[#2C2E33] hover:border-[#FF5722]/50 transition duration-300 flex flex-col justify-between space-y-6 group">
              <div className="space-y-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#FF5722] to-[#F15A24] flex items-center justify-center text-white shadow-lg shadow-orange-500/20">
                  <Calendar className="w-7 h-7" />
                </div>
                <div>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#FF5722]/10 text-[#FF5722] border border-[#FF5722]/20 mb-2">
                    <Trophy className="w-3 h-3" /> Official Daily Assessment
                  </div>
                  <h2 className="text-xl font-bold text-white group-hover:text-[#FF5722] transition">
                    Daily 10-Question Test
                  </h2>
                  <p className="text-zinc-400 text-sm mt-1 leading-relaxed">
                    A deterministic, server-evaluated 10-question test refreshed daily across Quantitative, Logical, Verbal, and Data Interpretation. One official attempt recorded on your profile.
                  </p>
                </div>

                <div className="space-y-2 text-xs text-zinc-300 pt-2 border-t border-[#2C2E33]">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Exact same questions for all campus students today</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>15-minute countdown timer with immediate feedback</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Server-side scoring & detailed answer explanations</span>
                  </div>
                </div>
              </div>

              <Link
                href="/aptitude/daily"
                className="w-full py-3.5 px-5 rounded-2xl bg-gradient-to-r from-[#FF5722] to-[#F15A24] hover:from-[#F15A24] hover:to-[#ea580c] text-white font-bold text-sm flex items-center justify-center gap-2 transition shadow-lg shadow-orange-500/20"
              >
                <span>Take Today's Daily Quiz</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Practice Drills Card */}
            <div className="p-8 rounded-3xl bg-[#1A1B1E] border border-[#2C2E33] hover:border-zinc-500/50 transition duration-300 flex flex-col justify-between space-y-6 group">
              <div className="space-y-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-zinc-700 to-zinc-600 flex items-center justify-center text-white shadow-lg shadow-black/20">
                  <Layers className="w-7 h-7" />
                </div>
                <div>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-zinc-800 text-zinc-300 border border-zinc-700 mb-2">
                    <Zap className="w-3 h-3" /> Unlimited Practice
                  </div>
                  <h2 className="text-xl font-bold text-white group-hover:text-zinc-200 transition">
                    Category Practice Drills
                  </h2>
                  <p className="text-zinc-400 text-sm mt-1 leading-relaxed">
                    Filter questions by category and difficulty to master areas where you need improvement. Practice without time constraints and review step-by-step mathematical explanations.
                  </p>
                </div>

                <div className="space-y-2 text-xs text-zinc-300 pt-2 border-t border-[#2C2E33]">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Quantitative Aptitude (Percentages, Profit/Loss, Time-Speed)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Logical Reasoning (Coding-Decoding, Blood Relations, Syllogisms)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Verbal Ability & Reading Comprehension</span>
                  </div>
                </div>
              </div>

              <Link
                href="/aptitude/practice"
                className="w-full py-3.5 px-5 rounded-2xl bg-[#202226] hover:bg-[#2C2E33] text-white font-bold text-sm flex items-center justify-center gap-2 transition border border-[#2C2E33]"
              >
                <span>Browse Practice Library</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
