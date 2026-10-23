"use client";

import React, { useState, useEffect } from "react";
import { User, Bell } from "lucide-react";

export default function StudentNavbar({ title = "Student Portal" }: { title?: string }) {
  const [user, setUser] = useState<{ name: string; email: string; department?: string; branch?: string } | null>(null);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (data.user) setUser(data.user);
      })
      .catch(() => {});
  }, []);

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
              <div className="text-[11px] text-[#9CA3AF]">{user.branch || user.department || user.email}</div>
            </div>
            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#FF5722] to-[#F15A24] border border-[#FF5722]/30 flex items-center justify-center text-white font-bold text-xs shadow-md shadow-[#FF5722]/25">
              {user.name.charAt(0).toUpperCase()}
            </div>
          </div>
        ) : (
          <div className="w-9 h-9 rounded-full bg-[#202226] animate-pulse" />
        )}
      </div>
    </header>
  );
}
