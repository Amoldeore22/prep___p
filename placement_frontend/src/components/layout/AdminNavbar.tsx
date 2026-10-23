"use client";

import React, { useState, useEffect } from "react";
import { ShieldCheck, LogOut } from "lucide-react";

export default function AdminNavbar({ title = "Admin Portal" }: { title?: string }) {
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (data.user) setUser(data.user);
      })
      .catch(() => {});
  }, []);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      window.location.href = "/";
    } catch {
      window.location.href = "/";
    }
  };

  return (
    <header className="h-16 bg-[#121316]/90 backdrop-blur-md border-b border-[#2C2E33] px-6 flex items-center justify-between sticky top-0 z-40">
      <div className="flex items-center gap-3">
        <h1 className="text-lg font-bold text-white tracking-tight">{title}</h1>
      </div>

      <div className="flex items-center gap-4">
        {user ? (
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <div className="text-xs font-semibold text-white">{user.name}</div>
              <div className="text-[11px] text-rose-400">System Admin</div>
            </div>
            <div className="w-9 h-9 rounded-full bg-rose-600/30 border border-rose-500/50 flex items-center justify-center text-rose-300 font-bold text-xs shadow-inner">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
        ) : (
          <div className="w-9 h-9 rounded-full bg-[#202226] animate-pulse" />
        )}

        <button
          onClick={handleLogout}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-[#9CA3AF] hover:text-red-400 hover:bg-red-500/10 border border-[#2C2E33] hover:border-red-500/20 transition-colors"
          title="Sign Out"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Sign Out</span>
        </button>
      </div>
    </header>
  );
}
