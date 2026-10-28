"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  ChevronLeft,
  Eye,
  EyeOff,
  Lock,
  Mail,
  User,
  Check,
  AlertCircle,
  Loader2,
  ShieldCheck,
} from "lucide-react";
import { AuroraText } from "@/registry/magicui/aurora-text";
import { useAuth } from "@/context/AuthContext";

export default function RegisterPage() {
  const router = useRouter();
  const { register, user } = useAuth();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    // Validation
    if (username.trim().length < 3) {
      setErrorMessage("Gamertag must be at least 3 characters long.");
      return;
    }

    if (!email.includes("@") || !email.includes(".")) {
      setErrorMessage("Please enter a valid email address.");
      return;
    }

    if (password.length < 6) {
      setErrorMessage("Password must be at least 6 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match. Please verify both fields.");
      return;
    }

    if (!termsAccepted) {
      setErrorMessage("Please agree to the Player Terms and Code of Conduct.");
      return;
    }

    setIsSubmitting(true);
    const result = await register(username, email, password);
    setIsSubmitting(false);

    if (!result.success) {
      setErrorMessage(result.error || "Registration failed. Please try again.");
    } else {
      setSuccessMessage("Account created successfully! Initializing your player profile...");
      setTimeout(() => {
        router.push("/");
      }, 1200);
    }
  };

  return (
    <main className="relative min-h-screen w-full flex flex-col justify-between p-4 sm:p-6 md:p-8 text-[#F5F5F5] antialiased">
      {/* ─── Top Navigation Bar ────────────────────────────────────────── */}
      <header className="relative z-10 w-full max-w-6xl mx-auto flex items-center justify-between py-2">
        <Link
          href="/"
          className="group inline-flex items-center gap-2 text-xs font-semibold text-[#8F9298] hover:text-[#F5F5F5] transition"
        >
          <ChevronLeft className="h-4 w-4 transition group-hover:-translate-x-1" />
          <span>Back to Home</span>
        </Link>

        {/* Brand Logo */}
        <Link href="/" className="group flex items-center gap-3">
          <div className="relative flex h-8 w-8 items-center justify-center rounded-xl border border-white/10 bg-[#07080A] shadow-[0_0_16px_rgba(255,38,61,0.12)] backdrop-blur-md transition-all duration-300 group-hover:border-[rgba(255,38,61,0.4)] group-hover:shadow-[0_0_24px_rgba(255,38,61,0.25)]">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <linearGradient id="kGradRegister" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#FF4054" />
                  <stop offset="100%" stopColor="#FF263D" />
                </linearGradient>
                <linearGradient id="kCoreRegister" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#FFFFFF" />
                  <stop offset="100%" stopColor="#FF4054" />
                </linearGradient>
              </defs>
              <path d="M4 4H8V20H4V4Z" fill="url(#kGradRegister)" />
              <path d="M9.5 12.2L16.2 4H20.5L13.2 12.2L20.8 20H16.5L9.5 12.2Z" fill="url(#kGradRegister)" />
              <path d="M5.2 5.5H6.8V18.5H5.2V5.5Z" fill="url(#kCoreRegister)" opacity="0.9" />
              <path d="M11 12.2L16 6H18L13 12.2L18.2 18.5H16.2L11 12.2Z" fill="url(#kCoreRegister)" opacity="0.9" />
            </svg>
            <span className="absolute -bottom-0.5 -right-0.5 h-1.5 w-1.5 rounded-full bg-[#FF263D] shadow-[0_0_6px_#FF263D]" />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold tracking-[0.2em] text-[#F5F5F5]">
              KURONEX
            </span>
            <span className="rounded border border-[rgba(255,38,61,0.25)] bg-[rgba(255,38,61,0.10)] px-1.5 py-0.5 text-[9px] font-extrabold tracking-[0.16em] text-[#FF263D]">
              GAMES
            </span>
          </div>
        </Link>
      </header>

      {/* ─── Centered Register Card ────────────────────────────────────── */}
      <div className="relative z-10 w-full max-w-md mx-auto my-auto py-8">
        <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-[#07080A]/85 p-8 sm:p-10 shadow-[0_0_60px_rgba(255,38,61,0.08)] backdrop-blur-2xl transition duration-300 hover:border-white/15">
          {/* Subtle top glow line */}
          <div className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 h-48 w-48 rounded-full bg-[radial-gradient(circle,rgba(255,38,61,0.18)_0%,transparent_70%)] blur-2xl" />

          {/* Eyebrow badge */}
          <div className="text-center mb-6">
            <div className="eyebrow mb-3">
              <span className="eyebrow-dot" aria-hidden="true" />
              NEW PLAYER ONBOARDING
            </div>

            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#F5F5F5]">
              <AuroraText>Join Kuronex.</AuroraText>
            </h1>

            <p className="mt-2 text-xs sm:text-sm text-[#8F9298]">
              Claim your unique gamertag and build your own game library.
            </p>
          </div>

          {/* Already logged in notice */}
          {user && !successMessage && (
            <div className="mb-6 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-3.5 text-center text-xs font-medium text-emerald-400 flex items-center justify-between">
              <span>Already active as <strong>{user.username}</strong></span>
              <Link href="/" className="underline font-bold hover:text-white">Go to Home</Link>
            </div>
          )}

          {/* Error Alert */}
          {errorMessage && (
            <div className="mb-6 rounded-2xl border border-[#FF263D]/40 bg-[#FF263D]/10 p-3.5 text-xs font-medium text-[#FF4054] shadow-[0_0_20px_rgba(255,38,61,0.15)] flex items-center gap-2.5">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Success Alert */}
          {successMessage && (
            <div className="mb-6 rounded-2xl border border-emerald-500/40 bg-emerald-500/10 p-3.5 text-xs font-medium text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.15)] flex items-center gap-2.5">
              <Check className="h-4 w-4 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-3.5">
            {/* Gamertag Field */}
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#8F9298] mb-1.5">
                Gamertag / Username
              </label>
              <div className="relative flex items-center">
                <User className="absolute left-4 h-4 w-4 text-[#8F9298] pointer-events-none" />
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="e.g. ApexTitan, NovaStriker"
                  className="w-full rounded-2xl border border-white/10 bg-[rgba(15,20,28,0.7)] py-3 pl-11 pr-4 text-sm text-[#F5F5F5] placeholder-[#606368] outline-none transition focus:border-[#FF263D]/60 focus:shadow-[0_0_20px_rgba(255,38,61,0.2)]"
                />
              </div>
            </div>

            {/* Email Field */}
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#8F9298] mb-1.5">
                Email Address
              </label>
              <div className="relative flex items-center">
                <Mail className="absolute left-4 h-4 w-4 text-[#8F9298] pointer-events-none" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="player@kuronex.com"
                  className="w-full rounded-2xl border border-white/10 bg-[rgba(15,20,28,0.7)] py-3 pl-11 pr-4 text-sm text-[#F5F5F5] placeholder-[#606368] outline-none transition focus:border-[#FF263D]/60 focus:shadow-[0_0_20px_rgba(255,38,61,0.2)]"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#8F9298] mb-1.5">
                Password
              </label>
              <div className="relative flex items-center">
                <Lock className="absolute left-4 h-4 w-4 text-[#8F9298] pointer-events-none" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  className="w-full rounded-2xl border border-white/10 bg-[rgba(15,20,28,0.7)] py-3 pl-11 pr-11 text-sm text-[#F5F5F5] placeholder-[#606368] outline-none transition focus:border-[#FF263D]/60 focus:shadow-[0_0_20px_rgba(255,38,61,0.2)]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 text-[#8F9298] hover:text-[#F5F5F5] transition cursor-pointer"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Confirm Password Field */}
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#8F9298] mb-1.5">
                Confirm Password
              </label>
              <div className="relative flex items-center">
                <ShieldCheck className="absolute left-4 h-4 w-4 text-[#8F9298] pointer-events-none" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repeat your password"
                  className="w-full rounded-2xl border border-white/10 bg-[rgba(15,20,28,0.7)] py-3 pl-11 pr-4 text-sm text-[#F5F5F5] placeholder-[#606368] outline-none transition focus:border-[#FF263D]/60 focus:shadow-[0_0_20px_rgba(255,38,61,0.2)]"
                />
              </div>
            </div>

            {/* Terms and conditions */}
            <div className="pt-1">
              <label className="flex items-start gap-2.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={termsAccepted}
                  onChange={(e) => setTermsAccepted(e.target.checked)}
                  className="mt-0.5 h-4 w-4 rounded border-white/20 bg-white/5 accent-[#FF263D] cursor-pointer"
                />
                <span className="text-[11px] leading-tight text-[#8F9298]">
                  I agree to the{" "}
                  <a href="#terms" className="text-[#FF4054] underline hover:text-white">
                    Terms of Service
                  </a>{" "}
                  and{" "}
                  <a href="#privacy" className="text-[#FF4054] underline hover:text-white">
                    Privacy Policy
                  </a>
                  .
                </span>
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full mt-3 inline-flex items-center justify-center gap-2 rounded-2xl border border-transparent bg-gradient-to-r from-[#FF4054] via-[#FF263D] to-[#b91c1c] py-3.5 px-6 text-xs font-bold tracking-wide text-white shadow-[0_10px_35px_rgba(255,38,61,0.35)] transition-all duration-200 hover:translate-y-[-1px] hover:shadow-[0_15px_45px_rgba(255,38,61,0.55)] disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Registering Account...</span>
                </>
              ) : (
                <>
                  <span>Create Account</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          {/* Social Sign Up Divider */}
          <div className="relative my-6 text-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/10" />
            </div>
            <span className="relative bg-[#07080A] px-3 text-[10px] uppercase tracking-widest text-[#606368]">
              Or register with
            </span>
          </div>

          {/* Social Buttons */}
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setErrorMessage("Third-party OAuth is coming soon. Please register directly above.")}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] py-2.5 px-3 text-xs font-semibold text-[#C5C7CC] hover:border-white/25 hover:bg-white/[0.07] transition cursor-pointer"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.761H12.545z" />
              </svg>
              <span>Google</span>
            </button>

            <button
              type="button"
              onClick={() => setErrorMessage("Third-party OAuth is coming soon. Please register directly above.")}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] py-2.5 px-3 text-xs font-semibold text-[#C5C7CC] hover:border-white/25 hover:bg-white/[0.07] transition cursor-pointer"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.929 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.894.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
              </svg>
              <span>Discord</span>
            </button>
          </div>

          {/* Footer link to Login */}
          <div className="mt-8 text-center text-xs text-[#8F9298]">
            <span>Already registered? </span>
            <Link href="/login" className="font-semibold text-[#FF4054] hover:underline">
              Sign In to Account
            </Link>
          </div>
        </div>
      </div>

      {/* ─── Page Footer ─────────────────────────────────────────────────── */}
      <footer className="relative z-10 w-full max-w-6xl mx-auto py-4 text-center text-[11px] text-[#8F9298] flex flex-col sm:flex-row items-center justify-between gap-3">
        <span>© 2026 KURONEX GAMES Inc. All rights reserved.</span>
        <div className="flex items-center gap-6">
          <Link href="#privacy" className="hover:text-[#F5F5F5] transition">Privacy Policy</Link>
          <Link href="#terms" className="hover:text-[#F5F5F5] transition">Terms of Service</Link>
          <Link href="#support" className="hover:text-[#F5F5F5] transition">Support</Link>
        </div>
      </footer>
    </main>
  );
}
