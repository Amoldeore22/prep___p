"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  GraduationCap,
  ShieldAlert,
  ArrowRight,
  ArrowLeft,
  Lock,
  Mail,
  AlertCircle,
  Eye,
  EyeOff,
  Loader2,
  CheckCircle2,
} from "lucide-react";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectParam = searchParams.get("redirect") || "";
  const roleParam = searchParams.get("role") || "";

  const [portalMode, setPortalMode] = useState<"student" | "admin">(
    roleParam === "admin" ? "admin" : "student"
  );
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handlePortalSwitch = (mode: "student" | "admin") => {
    setPortalMode(mode);
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Login failed");
        setIsLoading(false);
        return;
      }

      // Successful login - hard navigation to trigger edge cookie middleware refresh
      const target = redirectParam || data.redirectTo || (data.user?.role === "ADMIN" ? "/admin" : "/gateway");
      window.location.href = target;
    } catch {
      setError("Network error. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-[#1A1B1E] border border-[#2C2E33] p-6 sm:p-8 rounded-2xl shadow-2xl space-y-6">
      {/* Mode Switcher Tabs */}
      <div className="grid grid-cols-2 p-1 rounded-xl bg-[#161719] border border-[#2C2E33] text-xs font-semibold">
        <button
          type="button"
          onClick={() => handlePortalSwitch("student")}
          className={`py-2.5 rounded-lg flex items-center justify-center gap-2 transition ${
            portalMode === "student"
              ? "bg-gradient-to-r from-[#FF5722] to-[#F15A24] text-white shadow-md shadow-[#FF5722]/20"
              : "text-[#9CA3AF] hover:text-white"
          }`}
        >
          <GraduationCap className="w-4 h-4" /> Student Portal
        </button>
        <button
          type="button"
          onClick={() => handlePortalSwitch("admin")}
          className={`py-2.5 rounded-lg flex items-center justify-center gap-2 transition ${
            portalMode === "admin"
              ? "bg-gradient-to-r from-[#FF5722] to-[#F15A24] text-white shadow-md shadow-[#FF5722]/20"
              : "text-[#9CA3AF] hover:text-white"
          }`}
        >
          <ShieldAlert className="w-4 h-4" /> Administrator
        </button>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 flex items-start gap-3 text-red-400 text-sm">
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}


      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-[#A1A1AA]">
            {portalMode === "admin" ? "Admin Email Address" : "Student Email Address"}
          </label>
          <div className="mt-1.5 relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#9CA3AF]">
              <Mail className="h-4 w-4" />
            </div>
            <input
              type="email"
              required
              autoComplete="off"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@college.edu"
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#202226] border border-[#2C2E33] text-white placeholder-[#9CA3AF] text-sm focus:outline-none focus:border-[#FF5722] focus:ring-1 focus:ring-[#FF5722] transition"
            />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between">
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#A1A1AA]">
              Password
            </label>
            <Link
              href="/forgot-password"
              className="text-xs text-[#FF5722] hover:text-[#F15A24] transition font-medium"
            >
              Forgot password?
            </Link>
          </div>
          <div className="mt-1.5 relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#9CA3AF]">
              <Lock className="h-4 w-4" />
            </div>
            <input
              type={showPassword ? "text" : "password"}
              required
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-[#202226] border border-[#2C2E33] text-white placeholder-[#9CA3AF] text-sm focus:outline-none focus:border-[#FF5722] focus:ring-1 focus:ring-[#FF5722] transition"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#9CA3AF] hover:text-white"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-semibold text-white shadow-lg transition disabled:opacity-50 bg-gradient-to-r from-[#FF5722] to-[#F15A24] hover:from-[#F15A24] hover:to-[#ea580c] shadow-[#FF5722]/25"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" /> Signing In...
            </>
          ) : (
            <>
              Sign In to {portalMode === "admin" ? "Admin Control Center" : "Student Dashboard"}{" "}
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      {/* Footer link for registration */}
      <div className="pt-4 border-t border-[#2C2E33] text-center text-xs text-[#9CA3AF]">
        New Student?{" "}
        <Link href="/register" className="text-[#FF5722] hover:text-[#F15A24] font-semibold transition">
          Create a Student Account
        </Link>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-[#121316] text-[#FFFFFF] flex flex-col justify-center items-center px-4 py-12">
      <div className="w-full max-w-md space-y-6">
        <div>
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-medium text-[#9CA3AF] hover:text-white px-3 py-1.5 rounded-xl bg-[#1A1B1E] border border-[#2C2E33] hover:border-[#3E424B] transition group shadow-sm"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-[#9CA3AF] group-hover:text-[#FF5722] group-hover:-translate-x-0.5 transition-all" />
            <span>Back to Home</span>
          </Link>
        </div>

        <div className="text-center">
          <Link href="/" className="inline-flex items-center gap-3 mb-3 group">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#FF5722] via-[#F15A24] to-[#ea580c] flex items-center justify-center shadow-xl shadow-[#FF5722]/25 group-hover:scale-105 transition-transform">
              <GraduationCap className="w-7 h-7 text-white" />
            </div>
            <div className="text-left">
              <span className="text-2xl font-bold tracking-tight text-white block">PrepPilot</span>
              <span className="text-[10px] tracking-widest uppercase font-semibold text-[#FF5722]">
                Secure Authentication
              </span>
            </div>
          </Link>
          <h1 className="text-2xl font-bold text-white mt-2">Welcome to PrepPilot</h1>
          <p className="text-sm text-[#9CA3AF] mt-1">
            Sign in to continue your placement preparation.
          </p>
        </div>

        <Suspense fallback={<div className="text-center py-8 text-[#9CA3AF]">Loading sign in...</div>}>
          <LoginForm />
        </Suspense>

      </div>
    </div>
  );
}
