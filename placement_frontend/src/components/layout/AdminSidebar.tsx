"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ShieldAlert,
  LayoutDashboard,
  Layers,
  HelpCircle,
  Video,
  Building,
  Users,
  LineChart,
  History,
  Menu,
  X,
} from "lucide-react";

const adminNavItems = [
  { label: "Overview", href: "/admin", icon: LayoutDashboard },
  { label: "DSA Patterns", href: "/admin/dsa/patterns", icon: Layers },
  { label: "DSA Question Bank", href: "/admin/dsa/problems", icon: Layers },
  { label: "Aptitude Bank", href: "/admin/aptitude/questions", icon: HelpCircle },
  { label: "Daily Quiz Manager", href: "/admin/aptitude/daily-quiz", icon: HelpCircle, badge: "10-Q" },
  { label: "Interview Resources", href: "/admin/interviews/videos", icon: Video },
  { label: "Company Requirements", href: "/admin/companies", icon: Building },
  { label: "Student Directory", href: "/admin/students", icon: Users },
  { label: "User Accounts", href: "/admin/users", icon: Users },
  { label: "System Analytics", href: "/admin/analytics", icon: LineChart },
  { label: "Audit Logs", href: "/admin/audit-logs", icon: History },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navContent = (
    <div className="flex flex-col h-full">
      {/* Brand Header */}
      <div className="p-5 border-b border-[#2C2E33] flex items-center justify-between">
        <Link href="/admin" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#FF5722] via-[#F15A24] to-[#ea580c] flex items-center justify-center shadow-lg shadow-[#FF5722]/25 group-hover:scale-105 transition-transform">
            <ShieldAlert className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white tracking-tight leading-tight">
              PrepPilot Admin
            </h2>
            <span className="text-[10px] font-semibold text-[#FF5722] uppercase tracking-wider block">
              Control Center
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
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-[#9CA3AF]">
          Platform Management
        </div>
        {adminNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                isActive
                  ? "bg-gradient-to-r from-[#FF5722] to-[#F15A24] text-white shadow-md shadow-[#FF5722]/20 font-semibold"
                  : "text-[#9CA3AF] hover:text-white hover:bg-[#202226]"
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 ${isActive ? "text-white" : "text-[#9CA3AF]"}`} />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                    isActive
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
          aria-label="Open admin navigation menu"
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
