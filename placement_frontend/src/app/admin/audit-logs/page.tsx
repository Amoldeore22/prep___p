"use client";

import React, { useState, useEffect } from "react";
import AdminSidebar from "@/components/layout/AdminSidebar";
import AdminNavbar from "@/components/layout/AdminNavbar";
import {
  History,
  Search,
  ShieldAlert,
  RefreshCw,
  Terminal,
} from "lucide-react";

interface AuditLog {
  id: string;
  action: string;
  targetResource: string;
  targetId: string | null;
  details: string | null;
  createdAt: string;
  admin: {
    name: string;
    email: string;
  };
}

export default function AdminAuditLogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const loadLogs = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/audit-logs");
      const json = await res.json();
      if (res.ok) {
        setLogs(json.logs || []);
      }
    } catch {
      console.error("Failed to load audit logs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
  }, []);

  const filtered = logs.filter((log) => {
    const q = search.toLowerCase();
    return (
      log.action.toLowerCase().includes(q) ||
      log.targetResource.toLowerCase().includes(q) ||
      log.admin.name.toLowerCase().includes(q) ||
      log.admin.email.toLowerCase().includes(q) ||
      (log.details && log.details.toLowerCase().includes(q))
    );
  });

  return (
    <div className="flex min-h-screen bg-[#121316] text-zinc-100">
      <AdminSidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <AdminNavbar title="System Audit & Security Logs" />

        <main className="flex-1 p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-white">Administrative Audit Trail</h1>
              <p className="text-zinc-400 text-sm mt-1">
                Immutable chronological event log recording administrative changes, question bank modifications, and moderation decisions.
              </p>
            </div>

            <button
              onClick={loadLogs}
              disabled={loading}
              className="px-4 py-2.5 rounded-xl border border-[#2C2E33] bg-[#202226] hover:bg-[#2C2E33] text-zinc-300 text-xs font-semibold flex items-center gap-2 transition self-start sm:self-auto"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
              <span>Refresh Log</span>
            </button>
          </div>

          {/* Search bar */}
          <div className="p-4 rounded-2xl bg-[#1A1B1E] border border-[#2C2E33] flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="relative w-full sm:w-96">
              <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-3" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by action, administrator, or resource..."
                className="w-full bg-[#202226] border border-[#2C2E33] rounded-xl pl-10 pr-4 py-2 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-[#FF5722]"
              />
            </div>
            <span className="text-xs text-zinc-400 font-medium">
              Showing {filtered.length} logged events
            </span>
          </div>

          {/* Table */}
          <div className="rounded-2xl bg-[#1A1B1E] border border-[#2C2E33] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#161719] border-b border-[#2C2E33] text-zinc-400 font-semibold uppercase tracking-wider">
                  <tr>
                    <th className="py-3.5 px-4">Timestamp</th>
                    <th className="py-3.5 px-4">Admin</th>
                    <th className="py-3.5 px-4">Action</th>
                    <th className="py-3.5 px-4">Resource</th>
                    <th className="py-3.5 px-4">Details / Payload</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#2C2E33] text-zinc-300 font-mono">
                  {loading ? (
                    <tr>
                      <td colSpan={5} className="text-center py-12 text-zinc-500 font-sans">
                        Reading audit trail...
                      </td>
                    </tr>
                  ) : filtered.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="text-center py-12 text-zinc-500 font-sans">
                        No audit log entries found matching criteria.
                      </td>
                    </tr>
                  ) : (
                    filtered.map((log) => (
                      <tr key={log.id} className="hover:bg-[#202226] transition">
                        <td className="py-3.5 px-4 text-zinc-400 whitespace-nowrap">
                          {new Date(log.createdAt).toLocaleString()}
                        </td>
                        <td className="py-3.5 px-4 font-sans">
                          <div className="font-semibold text-white">{log.admin.name}</div>
                          <div className="text-[11px] text-zinc-400">{log.admin.email}</div>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-[#FF5722]/10 text-[#FF5722] border border-[#FF5722]/20">
                            {log.action}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-zinc-300 font-sans font-semibold">
                          {log.targetResource}
                        </td>
                        <td className="py-3.5 px-4 text-zinc-400 max-w-md truncate">
                          {log.details ? (
                            <span className="text-[11px] text-zinc-300">{log.details}</span>
                          ) : (
                            <span className="text-zinc-600">—</span>
                          )}
                        </td>
                      </tr>
                    ))
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
