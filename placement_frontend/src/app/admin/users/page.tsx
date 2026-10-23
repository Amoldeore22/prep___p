"use client";

import React, { useState, useEffect } from "react";
import AdminSidebar from "@/components/layout/AdminSidebar";
import AdminNavbar from "@/components/layout/AdminNavbar";
import {
  Users,
  Search,
  ShieldCheck,
  GraduationCap,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  X,
} from "lucide-react";

interface UserAccount {
  id: string;
  name: string;
  email: string;
  role: "STUDENT" | "ADMIN";
  department: string | null;
  graduationYear: number | null;
  cgpa: number | null;
  createdAt: string;
  _count: {
    progress: number;
    quizAttempts: number;
    notes: number;
    auditLogs: number;
  };
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [msg, setMsg] = useState<{ text: string; isError: boolean } | null>(null);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/users");
      const json = await res.json();
      if (res.ok) {
        setUsers(json.users || []);
      }
    } catch {
      console.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleRoleToggle = async (user: UserAccount) => {
    const nextRole = user.role === "ADMIN" ? "STUDENT" : "ADMIN";
    const confirmText =
      nextRole === "ADMIN"
        ? `Grant Administrator privileges to ${user.name} (${user.email})?`
        : `Revoke Administrator privileges from ${user.name}? They will be converted to a Student account.`;

    if (!confirm(confirmText)) return;

    try {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          targetUserId: user.id,
          newRole: nextRole,
        }),
      });
      const json = await res.json();
      if (res.ok) {
        setMsg({ text: `Role updated for ${user.name} to ${nextRole}`, isError: false });
        loadUsers();
      } else {
        setMsg({ text: json.error || "Failed to update role", isError: true });
      }
    } catch {
      setMsg({ text: "Network error updating role", isError: true });
    }
  };

  const filtered = users.filter((u) => {
    const q = search.toLowerCase();
    return (
      u.name.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      (u.department && u.department.toLowerCase().includes(q))
    );
  });

  return (
    <div className="flex min-h-screen bg-[#121316] text-zinc-100">
      <AdminSidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <AdminNavbar title="User & Access Control Management" />

        <main className="flex-1 p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-white">System User Accounts</h1>
              <p className="text-zinc-400 text-sm mt-1">
                Manage roles, privileged access, and campus placement portal memberships.
              </p>
            </div>

            <button
              onClick={loadUsers}
              disabled={loading}
              className="px-4 py-2.5 rounded-xl border border-[#2C2E33] bg-[#202226] hover:bg-[#2C2E33] text-zinc-300 text-xs font-semibold flex items-center gap-2 transition self-start sm:self-auto"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
              <span>Refresh</span>
            </button>
          </div>

          {msg && (
            <div
              className={`p-4 rounded-xl border text-sm flex items-center justify-between ${
                msg.isError
                  ? "bg-rose-500/10 border-rose-500/30 text-rose-400"
                  : "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
              }`}
            >
              <div className="flex items-center gap-2">
                {msg.isError ? <AlertTriangle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
                <span>{msg.text}</span>
              </div>
              <button onClick={() => setMsg(null)} className="text-zinc-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Search Bar */}
          <div className="p-4 rounded-2xl bg-[#1A1B1E] border border-[#2C2E33] flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-3" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name, email, department..."
                className="w-full bg-[#202226] border border-[#2C2E33] rounded-xl pl-10 pr-4 py-2 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-[#FF5722]"
              />
            </div>
            <span className="text-xs text-zinc-400 font-medium">
              {filtered.length} total account{filtered.length !== 1 ? "s" : ""}
            </span>
          </div>

          {/* Table */}
          <div className="rounded-2xl bg-[#1A1B1E] border border-[#2C2E33] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#141518] border-b border-[#2C2E33] text-zinc-400 font-semibold uppercase tracking-wider">
                  <tr>
                    <th className="py-3.5 px-4">Account Holder</th>
                    <th className="py-3.5 px-4">Role & Access</th>
                    <th className="py-3.5 px-4">Academic Details</th>
                    <th className="py-3.5 px-4 text-center">Activity Footprint</th>
                    <th className="py-3.5 px-4">Joined Date</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#2C2E33] text-zinc-300">
                  {loading ? (
                    <tr>
                      <td colSpan={6} className="text-center py-12 text-zinc-500">
                        Loading accounts...
                      </td>
                    </tr>
                  ) : filtered.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-12 text-zinc-500">
                        No accounts found.
                      </td>
                    </tr>
                  ) : (
                    filtered.map((u) => {
                      const isAdmin = u.role === "ADMIN";
                      return (
                        <tr key={u.id} className="hover:bg-[#202226]/50 transition">
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-3">
                              <div
                                className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
                                  isAdmin
                                    ? "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                                    : "bg-[#FF5722]/10 text-[#FF5722] border border-[#FF5722]/30"
                                }`}
                              >
                                {u.name.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <div className="font-semibold text-white">{u.name}</div>
                                <div className="text-[11px] text-zinc-400">{u.email}</div>
                              </div>
                            </div>
                          </td>
                          <td className="py-3.5 px-4">
                            <span
                              className={`px-2.5 py-1 rounded-full text-[10px] font-bold flex items-center gap-1.5 w-fit ${
                                isAdmin
                                  ? "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                                  : "bg-[#FF5722]/10 text-[#FF5722] border border-[#FF5722]/20"
                              }`}
                            >
                              {isAdmin ? <ShieldCheck className="w-3 h-3" /> : <GraduationCap className="w-3 h-3" />}
                              <span>{u.role}</span>
                            </span>
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="text-zinc-200">{u.department || "Not specified"}</div>
                            <div className="text-[11px] text-zinc-500">
                              {u.graduationYear ? `Batch ${u.graduationYear}` : ""}
                              {u.cgpa ? ` • CGPA: ${u.cgpa}` : ""}
                            </div>
                          </td>
                          <td className="py-3.5 px-4 text-center">
                            <div className="text-zinc-400">
                              {isAdmin ? (
                                <span className="text-rose-400 font-semibold">
                                  {u._count.auditLogs} audit actions
                                </span>
                              ) : (
                                <span>
                                  {u._count.progress} solved / {u._count.quizAttempts} quizzes
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="py-3.5 px-4 text-zinc-400">
                            {new Date(u.createdAt).toLocaleDateString()}
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <button
                              onClick={() => handleRoleToggle(u)}
                              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition border ${
                                isAdmin
                                  ? "border-[#2C2E33] bg-[#202226] text-zinc-300 hover:bg-[#282a30]"
                                  : "border-rose-500/30 bg-rose-500/10 text-rose-400 hover:bg-rose-500/20"
                              }`}
                            >
                              {isAdmin ? "Demote to Student" : "Promote to Admin"}
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
