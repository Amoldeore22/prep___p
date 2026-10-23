"use client";

import React, { useState, useEffect } from "react";
import StudentSidebar from "@/components/layout/StudentSidebar";
import StudentNavbar from "@/components/layout/StudentNavbar";
import { User, Mail, Building, Calendar, Award, ShieldCheck, Check } from "lucide-react";

export default function StudentProfilePage() {
  const [profile, setProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d) => {
        if (d.user) setProfile(d.user);
        setIsLoading(false);
      })
      .catch(() => setIsLoading(false));
  }, []);

  if (isLoading || !profile) {
    return (
      <div className="flex min-h-screen bg-[#121316] text-zinc-100">
        <StudentSidebar />
        <div className="flex-1 flex flex-col">
          <StudentNavbar title="Profile & Account" />
          <div className="p-8 flex items-center justify-center flex-1 text-zinc-400">
            Loading profile...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#121316] text-zinc-100">
      <StudentSidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <StudentNavbar title="Profile & Academic Profile" />

        <main className="p-6 md:p-8 space-y-6 flex-1 overflow-y-auto max-w-4xl w-full mx-auto">
          <div className="glass-panel p-8 rounded-3xl border border-[#2C2E33] bg-[#1A1B1E] space-y-6 shadow-2xl">
            <div className="flex items-center gap-5">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#FF5722] to-[#F15A24] text-white flex items-center justify-center font-extrabold text-2xl shadow-lg shadow-orange-500/20">
                {profile.name?.charAt(0).toUpperCase()}
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">{profile.name}</h2>
                <p className="text-xs text-zinc-400">{profile.email}</p>
                <span className="inline-flex items-center gap-1 mt-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#FF5722]/10 text-[#FF5722] border border-[#FF5722]/30">
                  <ShieldCheck className="w-3 h-3" />
                  Verified Student Account
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-[#2C2E33]">
              <div className="bg-[#202226] p-4 rounded-xl border border-[#2C2E33] space-y-1">
                <span className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider flex items-center gap-1.5">
                  <Building className="w-3.5 h-3.5 text-[#FF5722]" /> Department
                </span>
                <p className="text-sm font-semibold text-white">
                  {profile.department || "Computer Science & Engineering"}
                </p>
              </div>

              <div className="bg-[#202226] p-4 rounded-xl border border-[#2C2E33] space-y-1">
                <span className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-[#FF5722]" /> Graduation Batch
                </span>
                <p className="text-sm font-semibold text-white">
                  {profile.graduationYear || 2026}
                </p>
              </div>

              <div className="bg-[#202226] p-4 rounded-xl border border-[#2C2E33] space-y-1">
                <span className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider flex items-center gap-1.5">
                  <Award className="w-3.5 h-3.5 text-emerald-400" /> Academic CGPA
                </span>
                <p className="text-sm font-semibold text-emerald-400 font-mono">
                  {profile.cgpa ? `${profile.cgpa} / 10.0` : "Not provided"}
                </p>
              </div>

              <div className="bg-[#202226] p-4 rounded-xl border border-[#2C2E33] space-y-1">
                <span className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-amber-400" /> Account Registered
                </span>
                <p className="text-sm font-semibold text-white">
                  {new Date(profile.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
