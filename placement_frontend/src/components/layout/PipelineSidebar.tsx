"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Building2,
  Target,
  ShieldCheck,
  GraduationCap,
  LogOut,
  Menu,
  X,
} from "lucide-react";

export default function PipelineSidebar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      window.location.href = "/";
    } catch {
      window.location.href = "/";
    }
  };

  const navItems = [
    {
      label: "Companies",
      icon: Building2,
      href: "/pipeline/companies",
      aliasHrefs: ["/companies", "/student/companies"],
      stepNumber: "Step 1",
      desc: "Target Recruiters",
    },
    {
      label: "Job Roles",
      icon: Target,
      href: "/pipeline/roles",
      aliasHrefs: ["/roles", "/student/job-roles"],
      stepNumber: "Step 2",
      desc: "Hiring Tracks & CTC",
    },
    {
      label: "Eligibility Check",
      icon: ShieldCheck,
      href: "/pipeline/eligibility",
      aliasHrefs: ["/eligibility", "/student/eligibility"],
      stepNumber: "Step 3",
      desc: "Cutoff Evaluation",
    },
  ];

  const isItemActive = (item: typeof navItems[0]) => {
    if (pathname === item.href || pathname.startsWith(item.href + "/")) return true;
    return item.aliasHrefs.some((alias) => pathname === alias || pathname.startsWith(alias + "/"));
  };

  const navContent = (
    <div className="flex flex-col h-full">
      {/* Brand Header */}
      <div className="p-5 border-b border-[#2C2E33] flex items-center justify-between">
        <Link href="/gateway" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#3B82F6] via-[#2563EB] to-[#1D4ED8] flex items-center justify-center shadow-lg shadow-blue-500/25 group-hover:scale-105 transition-transform">
            <Building2 className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white tracking-tight leading-tight">
              PrepPilot
            </h2>
            <span className="text-[10px] font-semibold text-blue-400 uppercase tracking-wider block">
              Placement Pipeline
            </span>
          </div>
        </Link>
        <button
          onClick={() => setMobileOpen(false)}
          className="md:hidden p-1.5 rounded-lg text-[#9CA3AF] hover:text-white hover:bg-[#202226]"
          aria-label="Close navigation"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto">
        <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-[#9CA3AF]">
          3-Step Guided Pipeline
        </div>

        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isItemActive(item);

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center justify-between px-3.5 py-3 rounded-xl text-sm font-medium transition-all ${
                active
                  ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-600/25 font-semibold"
                  : "text-[#9CA3AF] hover:text-white hover:bg-[#202226]"
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 ${active ? "text-white" : "text-[#9CA3AF]"}`} />
                <div>
                  <div className="leading-tight">{item.label}</div>
                  <div className={`text-[10px] ${active ? "text-blue-100" : "text-zinc-500"}`}>
                    {item.desc}
                  </div>
                </div>
              </div>
              <span
                className={`text-[9px] px-2 py-0.5 rounded-full font-bold ${
                  active
                    ? "bg-white/20 text-white"
                    : "bg-[#202226] text-zinc-400 border border-[#2C2E33]"
                }`}
              >
                {item.stepNumber}
              </span>
            </Link>
          );
        })}

        {/* Gateway Selection Link */}
        <div className="pt-3 border-t border-[#2C2E33] mt-4">
          <Link
            href="/gateway"
            onClick={() => setMobileOpen(false)}
            className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl text-xs font-medium text-[#9CA3AF] hover:text-white hover:bg-[#202226] transition"
          >
            <GraduationCap className="w-3.5 h-3.5" />
            <span>Switch Workspaces</span>
          </Link>
        </div>

        {/* Sign Out */}
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-[#9CA3AF] hover:text-red-400 hover:bg-red-500/10 transition-colors pt-3"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </nav>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside className="hidden md:flex w-64 bg-[#121316] border-r border-[#2C2E33] flex-col shrink-0 min-h-screen">
        {navContent}
      </aside>

      {/* Mobile Drawer Trigger */}
      <div className="md:hidden fixed bottom-4 right-4 z-50">
        <button
          onClick={() => setMobileOpen(true)}
          className="p-3.5 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-xl shadow-blue-500/30 flex items-center justify-center"
          aria-label="Open pipeline menu"
        >
          <Menu className="w-6 h-6" />
        </button>
      </div>

      {/* Mobile Drawer Overlay */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
            onClick={() => setMobileOpen(false)}
          />
          <div className="relative w-72 max-w-[80vw] bg-[#121316] border-r border-[#2C2E33] z-10 shadow-2xl flex flex-col">
            {navContent}
          </div>
        </div>
      )}
    </>
  );
}
