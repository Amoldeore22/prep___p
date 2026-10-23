"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Code2,
  CalendarCheck,
  Brain,
  Video,
  Building2,
  FileText,
  BarChart3,
  User,
  GraduationCap,
  LogOut,
  Menu,
  X,
  ChevronDown,
  BookOpen,
  Database,
  Layers,
  FileCode2,
  TerminalSquare,
} from "lucide-react";

export default function StudentSidebar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  // Determine active section for auto-expansion
  const isPrepHubActive = pathname.startsWith("/prephub");
  const isPracticeActive =
    pathname === "/dsa" ||
    pathname.startsWith("/dsa/") ||
    pathname === "/aptitude" ||
    pathname.startsWith("/aptitude/");

  const [prepHubOpen, setPrepHubOpen] = useState(true);
  const [practiceOpen, setPracticeOpen] = useState(true);

  // Keep section open when route changes into it
  useEffect(() => {
    if (isPrepHubActive) setPrepHubOpen(true);
    if (isPracticeActive) setPracticeOpen(true);
  }, [pathname, isPrepHubActive, isPracticeActive]);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      window.location.href = "/";
    } catch {
      window.location.href = "/";
    }
  };

  const prepHubItems = [
    { label: "CPP", href: "/prephub/cpp", icon: FileCode2, desc: "C++ & STL" },
    { label: "OOPS", href: "/prephub/oops", icon: Layers, desc: "OOP Paradigms" },
    { label: "DBMS", href: "/prephub/dbms", icon: Database, desc: "Database Systems" },
    { label: "SQL", href: "/prephub/sql", icon: TerminalSquare, desc: "Queries & Joins" },
  ];

  const practiceItems = [
    { label: "Aptitude Practice", href: "/aptitude/practice", icon: Brain },
    { label: "Daily Aptitude Quiz", href: "/aptitude/daily", icon: CalendarCheck, badge: "10 Qs" },
    { label: "DSA Patterns", href: "/dsa", icon: Code2, badge: "Workbook" },
  ];

  const remainingItems = [
    { label: "Interview Hub", href: "/interviews", icon: Video },
    { label: "Company Requirements", href: "/companies", icon: Building2 },
    { label: "My Notes", href: "/notes", icon: FileText },
    { label: "My Progress", href: "/progress", icon: BarChart3 },
    { label: "Profile", href: "/profile", icon: User },
  ];

  const isItemActive = (href: string) => {
    if (href === "/dashboard") return pathname === "/dashboard";
    return pathname === href || pathname.startsWith(href + "/");
  };

  const navContent = (
    <div className="flex flex-col h-full">
      {/* Brand Header */}
      <div className="p-5 border-b border-[#2C2E33] flex items-center justify-between">
        <Link href="/dashboard" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#FF5722] via-[#F15A24] to-[#ea580c] flex items-center justify-center shadow-lg shadow-[#FF5722]/25 group-hover:scale-105 transition-transform">
            <GraduationCap className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white tracking-tight leading-tight">
              PrepPilot
            </h2>
            <span className="text-[10px] font-semibold text-[#FF5722] uppercase tracking-wider block">
              Student Workspace
            </span>
          </div>
        </Link>
        <button
          onClick={() => setMobileOpen(false)}
          className="md:hidden p-1.5 rounded-lg text-[#9CA3AF] hover:text-white hover:bg-[#202226]"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto">
        <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-[#9CA3AF]">
          Core Navigation
        </div>

        {/* 1. Dashboard (at top) */}
        <Link
          href="/dashboard"
          onClick={() => setMobileOpen(false)}
          className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
            pathname === "/dashboard"
              ? "bg-gradient-to-r from-[#FF5722] to-[#F15A24] text-white shadow-md shadow-[#FF5722]/25 font-semibold"
              : "text-[#9CA3AF] hover:text-white hover:bg-[#202226]"
          }`}
        >
          <div className="flex items-center gap-3">
            <LayoutDashboard className={`w-4 h-4 ${pathname === "/dashboard" ? "text-white" : "text-[#9CA3AF]"}`} />
            <span>Dashboard</span>
          </div>
        </Link>

        {/* 2. Prep Hub (Expandable Dropdown immediately below Dashboard) */}
        <div className="space-y-1">
          <button
            type="button"
            onClick={() => setPrepHubOpen((prev) => !prev)}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
              isPrepHubActive
                ? "text-white bg-[#1A1B1E] border border-[#FF5722]/30 font-semibold"
                : "text-[#9CA3AF] hover:text-white hover:bg-[#202226]"
            }`}
          >
            <div className="flex items-center gap-3">
              <BookOpen className={`w-4 h-4 ${isPrepHubActive ? "text-[#FF5722]" : "text-[#9CA3AF]"}`} />
              <span>Prep Hub</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-[9px] px-1.5 py-0.5 rounded-full font-bold bg-[#FF5722]/15 text-[#FF5722] border border-[#FF5722]/30">
                Videos
              </span>
              <ChevronDown
                className={`w-4 h-4 text-[#9CA3AF] transition-transform duration-200 ${
                  prepHubOpen ? "rotate-180" : ""
                }`}
              />
            </div>
          </button>

          {prepHubOpen && (
            <div className="ml-3 pl-3 border-l border-[#2C2E33] space-y-1 py-1">
              {prepHubItems.map((item) => {
                const Icon = item.icon;
                const active = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                      active
                        ? "bg-gradient-to-r from-[#FF5722] to-[#F15A24] text-white shadow-sm shadow-[#FF5722]/20 font-semibold"
                        : "text-[#9CA3AF] hover:text-white hover:bg-[#202226]"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className={`w-3.5 h-3.5 ${active ? "text-white" : "text-[#9CA3AF]"}`} />
                      <span>{item.label}</span>
                    </div>
                    <span className={`text-[10px] ${active ? "text-white/80" : "text-zinc-500"}`}>
                      {item.desc}
                    </span>
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        {/* 3. Practice (Expandable Dropdown below Prep Hub) */}
        <div className="space-y-1">
          <button
            type="button"
            onClick={() => setPracticeOpen((prev) => !prev)}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
              isPracticeActive
                ? "text-white bg-[#1A1B1E] border border-[#FF5722]/30 font-semibold"
                : "text-[#9CA3AF] hover:text-white hover:bg-[#202226]"
            }`}
          >
            <div className="flex items-center gap-3">
              <Brain className={`w-4 h-4 ${isPracticeActive ? "text-[#FF5722]" : "text-[#9CA3AF]"}`} />
              <span>Practice</span>
            </div>
            <ChevronDown
              className={`w-4 h-4 text-[#9CA3AF] transition-transform duration-200 ${
                practiceOpen ? "rotate-180" : ""
              }`}
            />
          </button>

          {practiceOpen && (
            <div className="ml-3 pl-3 border-l border-[#2C2E33] space-y-1 py-1">
              {practiceItems.map((item) => {
                const Icon = item.icon;
                const active = isItemActive(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                      active
                        ? "bg-gradient-to-r from-[#FF5722] to-[#F15A24] text-white shadow-sm shadow-[#FF5722]/20 font-semibold"
                        : "text-[#9CA3AF] hover:text-white hover:bg-[#202226]"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className={`w-3.5 h-3.5 ${active ? "text-white" : "text-[#9CA3AF]"}`} />
                      <span>{item.label}</span>
                    </div>
                    {item.badge && (
                      <span
                        className={`text-[9px] px-1.5 py-0.5 rounded-full font-semibold ${
                          active
                            ? "bg-white/20 text-white"
                            : "bg-[#FF5722]/10 text-[#FF5722] border border-[#FF5722]/20"
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        {/* 4. Remaining Navigation Items */}
        {remainingItems.map((item) => {
          const Icon = item.icon;
          const active = isItemActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                active
                  ? "bg-gradient-to-r from-[#FF5722] to-[#F15A24] text-white shadow-md shadow-[#FF5722]/25 font-semibold"
                  : "text-[#9CA3AF] hover:text-white hover:bg-[#202226]"
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 ${active ? "text-white" : "text-[#9CA3AF]"}`} />
                <span>{item.label}</span>
              </div>
            </Link>
          );
        })}

        {/* Switch Workspaces Gateway Link */}
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

        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-[#9CA3AF] hover:text-red-400 hover:bg-red-500/10 transition-colors pt-2"
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
          className="p-3.5 rounded-2xl bg-gradient-to-r from-[#FF5722] to-[#F15A24] text-white shadow-xl shadow-[#FF5722]/30 flex items-center justify-center"
          aria-label="Open navigation menu"
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

