"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ShieldAlert,
  ShieldCheck,
  Lock,
  User,
  Mail,
  KeyRound,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  ChevronRight,
  Eye,
  EyeOff,
} from "lucide-react";
import { GradientText } from "@/components/ui/gradient-text";
import { useAuth } from "@/context/AuthContext";

export default function AdminAuthPage() {
  const router = useRouter();
  const { refreshUser } = useAuth();

  // Tab State: "login" | "register"
  const [activeTab, setActiveTab] = useState<"login" | "register">("login");

  // Form Fields
  const [identifier, setIdentifier] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passkey, setPasskey] = useState("");
  const [role, setRole] = useState<"super_admin" | "admin">("super_admin");

  // Visibility toggles
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [showPasskey, setShowPasskey] = useState(false);

  // Status & Feedback
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Handle Login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/admin/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier, password: loginPassword }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Authentication failed.");
      }

      await refreshUser();
      setSuccessMsg("Administrator verified. Redirecting to management console...");
      setTimeout(() => {
        router.push("/admin");
      }, 700);
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "Authentication failed.");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Admin Provisioning / Registration
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    if (regPassword !== confirmPassword) {
      setErrorMsg("Password confirmation does not match.");
      return;
    }

    if (regPassword.length < 8) {
      setErrorMsg("Administrator password must be at least 8 characters.");
      return;
    }

    if (!passkey.trim()) {
      setErrorMsg("Master Admin Security Passkey is required to provision an admin account.");
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch("/api/admin/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username,
          email,
          password: regPassword,
          confirmPassword,
          passkey: passkey.trim(),
          role,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to provision administrator account.");
      }

      await refreshUser();
      setSuccessMsg("Administrator account provisioned! Initializing command console...");
      setTimeout(() => {
        router.push("/admin");
      }, 800);
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "Registration failed.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-transparent text-white flex flex-col justify-between selection:bg-[#FF263D]/25 selection:text-white">
      {/* Top Brand Bar */}
      <header className="p-6 sm:px-12 flex items-center justify-between border-b border-[#35151C]/60 bg-[#100607]/70 backdrop-blur-md">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#1A0D10] border border-[#35151C] text-xs font-black text-[#FF263D] shadow-[0_0_15px_rgba(255,38,61,0.25)]">
            K
          </div>
          <span className="font-bold tracking-widest text-xs text-white group-hover:text-[#FF4054] transition">
            KURONEX <span className="text-[#FF263D]">INTERNAL</span>
          </span>
        </Link>

        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-amber-500/20 bg-amber-500/10 text-[10px] font-mono text-amber-400">
          <Lock className="h-3 w-3" />
          <span>RESTRICTED OPERATOR ACCESS</span>
        </div>
      </header>

      {/* Main Authentication Container */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 my-8">
        <div className="w-full max-w-md rounded-3xl border border-[#35151C] bg-[#110709]/95 p-7 sm:p-9 shadow-[0_30px_90px_rgba(0,0,0,0.9)] backdrop-blur-2xl">
          {/* Header Icon & Title */}
          <div className="text-center space-y-2 mb-6">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-[#FF263D]/40 bg-[#FF263D]/10 text-[#FF263D] shadow-[0_0_30px_rgba(255,38,61,0.2)]">
              <ShieldAlert className="h-7 w-7" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
              <GradientText as="span" variant="crimson">Administrator Security Gate</GradientText>
            </h1>
            <p className="text-xs text-[#A1A1AA] leading-relaxed max-w-xs mx-auto">
              Non-public gateway for platform founders and authorized core developers.
            </p>
          </div>

          {/* Dual Tab Toggle */}
          <div className="grid grid-cols-2 p-1 rounded-2xl border border-[#35151C] bg-[#1A0D10] mb-6">
            <button
              type="button"
              onClick={() => {
                setActiveTab("login");
                setErrorMsg("");
                setSuccessMsg("");
              }}
              className={`py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                activeTab === "login"
                  ? "bg-[#FF263D] text-white shadow-md shadow-[#FF263D]/30"
                  : "text-[#A1A1AA] hover:text-white"
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab("register");
                setErrorMsg("");
                setSuccessMsg("");
              }}
              className={`py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                activeTab === "register"
                  ? "bg-[#00E5FF] text-black shadow-md shadow-[#00E5FF]/30 font-extrabold"
                  : "text-[#A1A1AA] hover:text-white"
              }`}
            >
              Provision Admin
            </button>
          </div>

          {/* Alert Messages */}
          {errorMsg && (
            <div className="mb-5 flex items-start gap-2.5 rounded-xl border border-red-500/40 bg-red-500/10 p-3.5 text-xs text-red-400">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="mb-5 flex items-start gap-2.5 rounded-xl border border-emerald-500/40 bg-emerald-500/10 p-3.5 text-xs text-emerald-400">
              <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* ──────────────── TAB 1: ADMIN SIGN IN ──────────────── */}
          {activeTab === "login" && (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#A1A1AA] mb-1.5">
                  Admin Gamertag or Work Email
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#A1A1AA]" />
                  <input
                    type="text"
                    required
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder="admin or admin@kuronex.games"
                    className="w-full rounded-xl border border-[#35151C] bg-[#160B0E] py-2.5 pl-10 pr-4 text-xs text-white placeholder-[#A1A1AA]/50 outline-none focus:border-[#FF263D] transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#A1A1AA] mb-1.5">
                  Administrator Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#A1A1AA]" />
                  <input
                    type={showLoginPassword ? "text" : "password"}
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full rounded-xl border border-[#35151C] bg-[#160B0E] py-2.5 pl-10 pr-10 text-xs text-white placeholder-[#A1A1AA]/50 outline-none focus:border-[#FF263D] transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowLoginPassword(!showLoginPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#A1A1AA] hover:text-white"
                  >
                    {showLoginPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-2 inline-flex items-center justify-center gap-2 rounded-xl bg-[#FF263D] hover:bg-[#FF4054] active:bg-[#D91B30] py-3 px-6 text-xs font-bold text-white shadow-[0_4px_25px_rgba(255,38,61,0.35)] transition-all cursor-pointer disabled:opacity-50"
              >
                <span>{isLoading ? "Verifying Credentials..." : "Access Administrator Console"}</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </form>
          )}

          {/* ──────────────── TAB 2: ADMIN PROVISIONING ──────────────── */}
          {activeTab === "register" && (
            <form onSubmit={handleRegister} className="space-y-3.5">
              <div className="p-3 rounded-xl border border-cyan-500/20 bg-cyan-500/5 text-[11px] text-cyan-300 leading-relaxed flex items-start gap-2">
                <ShieldCheck className="h-4 w-4 shrink-0 text-cyan-400 mt-0.5" />
                <span>
                  Admin accounts created here are stored securely with cryptographic <strong className="font-mono text-white">scrypt</strong> hashing, ready to transfer directly to the production backend database.
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#A1A1AA] mb-1">
                  Admin Gamertag / Name
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#A1A1AA]" />
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="e.g. arish or colleague"
                    className="w-full rounded-xl border border-[#35151C] bg-[#160B0E] py-2 pl-9 pr-3 text-xs text-white placeholder-[#A1A1AA]/50 outline-none focus:border-[#00E5FF] transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#A1A1AA] mb-1">
                  Work / Operator Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#A1A1AA]" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. arish@kuronex.games"
                    className="w-full rounded-xl border border-[#35151C] bg-[#160B0E] py-2 pl-9 pr-3 text-xs text-white placeholder-[#A1A1AA]/50 outline-none focus:border-[#00E5FF] transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#A1A1AA] mb-1">
                  Master Security Key (Admin Setup Passkey)
                </label>
                <div className="relative">
                  <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#00E5FF]" />
                  <input
                    type={showPasskey ? "text" : "password"}
                    required
                    value={passkey}
                    onChange={(e) => setPasskey(e.target.value)}
                    placeholder="Enter team master passkey"
                    className="w-full rounded-xl border border-[#35151C] bg-[#160B0E] py-2 pl-9 pr-10 text-xs text-white placeholder-[#A1A1AA]/50 outline-none focus:border-[#00E5FF] transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasskey(!showPasskey)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#A1A1AA] hover:text-white"
                  >
                    {showPasskey ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                  </button>
                </div>
                <p className="text-[10px] text-[#A1A1AA] mt-1">
                  Passkey configured via server <code className="text-cyan-400 font-mono">ADMIN_SETUP_PASSKEY</code> environment variable.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#A1A1AA] mb-1">
                    Password (8+ chars)
                  </label>
                  <div className="relative">
                    <input
                      type={showRegPassword ? "text" : "password"}
                      required
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full rounded-xl border border-[#35151C] bg-[#160B0E] py-2 pl-3 pr-8 text-xs text-white placeholder-[#A1A1AA]/50 outline-none focus:border-[#00E5FF] transition"
                    />
                    <button
                      type="button"
                      onClick={() => setShowRegPassword(!showRegPassword)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#A1A1AA] hover:text-white"
                    >
                      {showRegPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#A1A1AA] mb-1">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <input
                      type={showRegPassword ? "text" : "password"}
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full rounded-xl border border-[#35151C] bg-[#160B0E] py-2 px-3 text-xs text-white placeholder-[#A1A1AA]/50 outline-none focus:border-[#00E5FF] transition"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#A1A1AA] mb-1">
                  Privilege Level
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setRole("super_admin")}
                    className={`p-2 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                      role === "super_admin"
                        ? "border-[#00E5FF] bg-[#00E5FF]/10 text-[#00E5FF]"
                        : "border-[#35151C] bg-[#160B0E] text-[#A1A1AA]"
                    }`}
                  >
                    <span>SUPER ADMIN</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole("admin")}
                    className={`p-2 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                      role === "admin"
                        ? "border-[#FF263D] bg-[#FF263D]/10 text-[#FF4054]"
                        : "border-[#35151C] bg-[#160B0E] text-[#A1A1AA]"
                    }`}
                  >
                    <span>ADMIN</span>
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-2 inline-flex items-center justify-center gap-2 rounded-xl bg-[#00E5FF] hover:bg-[#38F5FF] text-black py-3 px-6 text-xs font-extrabold shadow-[0_4px_25px_rgba(0,229,255,0.35)] transition-all cursor-pointer disabled:opacity-50"
              >
                <span>{isLoading ? "Provisioning..." : "Provision Administrator Account"}</span>
                <ChevronRight className="h-4 w-4" />
              </button>
            </form>
          )}

          {/* Footer Back Home */}
          <div className="mt-6 pt-5 border-t border-[#35151C] text-center">
            <Link
              href="/"
              className="text-xs text-[#A1A1AA] hover:text-white transition flex items-center justify-center gap-1.5"
            >
              <span>← Return to Public Website</span>
            </Link>
          </div>
        </div>
      </main>

      {/* Footer Legal & Security Notice */}
      <footer className="p-4 sm:px-12 text-center text-[10px] text-[#A1A1AA] border-t border-[#35151C]/60 bg-[#100607]/70">
        KURONEX GAMES Internal Administrative Infrastructure • Cryptographic Session Authorization Active
      </footer>
    </div>
  );
}
