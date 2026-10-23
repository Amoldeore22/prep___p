"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import AdminSidebar from "@/components/layout/AdminSidebar";
import AdminNavbar from "@/components/layout/AdminNavbar";
import {
  Users,
  Search,
  ChevronLeft,
  ChevronRight,
  Download,
  GraduationCap,
  ExternalLink,
  Code2,
  HelpCircle,
  FileText,
  Calendar,
} from "lucide-react";

interface StudentItem {
  id: string;
  name: string;
  email: string;
  department: string;
  graduationYear: number | null;
  cgpa: number | null;
  createdAt: string;
  solvedCount: number;
  attemptedCount: number;
  quizCount: number;
  notesCount: number;
}

export default function AdminStudentsDirectoryPage() {
  const [students, setStudents] = useState<StudentItem[]>([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 15, totalPages: 1 });
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const loadStudents = async (p = 1, query = search) => {
    try {
      setLoading(true);
      const res = await fetch(`/api/admin/students?page=${p}&limit=15&search=${encodeURIComponent(query)}`);
      const json = await res.json();
      if (res.ok) {
        setStudents(json.students || []);
        setPagination(json.pagination || { total: 0, page: 1, limit: 15, totalPages: 1 });
      }
    } catch {
      console.error("Failed to load students");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStudents(1, search);
  }, [search]);

  const handleExportCSV = () => {
    if (students.length === 0) return;
    const headers = ["Name", "Email", "Department", "Graduation Year", "CGPA", "DSA Solved", "Quiz Attempts", "Registered Date"];
    const rows = students.map((s) => [
      `"${s.name}"`,
      `"${s.email}"`,
      `"${s.department}"`,
      s.graduationYear || "",
      s.cgpa || "",
      s.solvedCount,
      s.quizCount,
      `"${new Date(s.createdAt).toISOString()}"`,
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `placement_students_export_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex min-h-screen bg-[#121316] text-zinc-100">
      <AdminSidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <AdminNavbar title="Student Directory & Monitoring" />

        <main className="flex-1 p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-white">Student Academic Directory</h1>
              <p className="text-zinc-400 text-sm mt-1">
                Monitor student placement readiness, track problem solving frequency, and inspect individual performance.
              </p>
            </div>

            <button
              onClick={handleExportCSV}
              disabled={students.length === 0}
              className="px-4 py-2.5 rounded-xl border border-[#2C2E33] bg-[#202226] hover:bg-[#2C2E33] text-zinc-300 text-xs font-semibold flex items-center gap-2 transition self-start sm:self-auto"
            >
              <Download className="w-4 h-4" />
              <span>Export Student Data (CSV)</span>
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
                placeholder="Search by student name, email, or branch..."
                className="w-full bg-[#202226] border border-[#2C2E33] rounded-xl pl-10 pr-4 py-2 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-[#FF5722]"
              />
            </div>
            <span className="text-xs text-zinc-400 font-medium">
              Total Enrolled: <strong className="text-white">{pagination.total}</strong> students
            </span>
          </div>

          {/* Table */}
          <div className="rounded-2xl bg-[#1A1B1E] border border-[#2C2E33] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#161719] border-b border-[#2C2E33] text-zinc-400 font-semibold uppercase tracking-wider">
                  <tr>
                    <th className="py-3.5 px-4">Student</th>
                    <th className="py-3.5 px-4">Academic Info</th>
                    <th className="py-3.5 px-4 text-center">DSA Solved</th>
                    <th className="py-3.5 px-4 text-center">Aptitude Quizzes</th>
                    <th className="py-3.5 px-4 text-center">Notes</th>
                    <th className="py-3.5 px-4">Enrolled Date</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#2C2E33] text-zinc-300">
                  {loading ? (
                    <tr>
                      <td colSpan={7} className="text-center py-12 text-zinc-500">
                        Loading student records...
                      </td>
                    </tr>
                  ) : students.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center py-12 text-zinc-500">
                        No student profiles match your search criteria.
                      </td>
                    </tr>
                  ) : (
                    students.map((student) => (
                      <tr key={student.id} className="hover:bg-[#202226] transition">
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-[#FF5722]/15 text-[#FF5722] border border-[#FF5722]/30 flex items-center justify-center font-bold text-xs">
                              {student.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <div className="font-semibold text-white">{student.name}</div>
                              <div className="text-[11px] text-zinc-400">{student.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="text-zinc-200 font-medium">{student.department}</div>
                          <div className="text-[11px] text-zinc-500 flex items-center gap-2">
                            {student.graduationYear && <span>Batch {student.graduationYear}</span>}
                            {student.cgpa && (
                              <span className="text-amber-400 font-semibold">
                                CGPA: {student.cgpa}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            {student.solvedCount} solved
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-[#FF5722]/10 text-[#FF5722] border border-[#FF5722]/20">
                            {student.quizCount} tests
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <span className="text-zinc-400 font-medium">{student.notesCount}</span>
                        </td>
                        <td className="py-3.5 px-4 text-zinc-400">
                          {new Date(student.createdAt).toLocaleDateString()}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <Link
                            href={`/admin/students/${student.id}`}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#202226] hover:bg-[#2C2E33] text-zinc-200 text-xs font-semibold transition border border-[#2C2E33]"
                          >
                            <span>Inspect Progress</span>
                            <ExternalLink className="w-3 h-3 text-zinc-400" />
                          </Link>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            <div className="p-4 border-t border-[#2C2E33] flex items-center justify-between text-xs text-zinc-400">
              <div>
                Page {pagination.page} of {pagination.totalPages}
              </div>
              <div className="flex items-center gap-2">
                <button
                  disabled={pagination.page <= 1}
                  onClick={() => loadStudents(pagination.page - 1)}
                  className="p-1.5 rounded-lg border border-[#2C2E33] disabled:opacity-40 hover:bg-[#202226] transition"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  disabled={pagination.page >= pagination.totalPages}
                  onClick={() => loadStudents(pagination.page + 1)}
                  className="p-1.5 rounded-lg border border-[#2C2E33] disabled:opacity-40 hover:bg-[#202226] transition"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
