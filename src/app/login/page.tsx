"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Mail,
  Lock,
  ArrowRight,
  Loader2,
  AlertCircle,
  CheckCircle2,
  KeyRound,
  X,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { AuthInput } from "@/components/auth/AuthInput";

const REMEMBERED_IDENTIFIER_KEY = "kuronex_remembered_identifier";

export default function LoginPage() {
  const router = useRouter();
  const { login, user } = useAuth();

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{ identifier?: string; password?: string }>({});

  // Interactive Password Recovery State
  const [showRecovery, setShowRecovery] = useState(false);
  const [recoveryStep, setRecoveryStep] = useState<"request" | "reset">("request");
  const [recoveryEmail, setRecoveryEmail] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [recoveryBusy, setRecoveryBusy] = useState(false);
  const [recoveryError, setRecoveryError] = useState<string | null>(null);
  const [recoveryNotice, setRecoveryNotice] = useState<string | null>(null);

  // Restore remembered identifier on client mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(REMEMBERED_IDENTIFIER_KEY);
      if (saved) {
        queueMicrotask(() => {
          setIdentifier(saved);
          setRememberMe(true);
        });
      }
    } catch {
      // ignore
    }
  }, []);

  const validate = () => {
    const errors: { identifier?: string; password?: string } = {};
    if (!identifier.trim()) {
      errors.identifier = "Please enter your gamertag or email address.";
    }
    if (!password) {
      errors.password = "Please enter your password.";
    }
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!validate()) {
      return;
    }

    setIsSubmitting(true);
    const result = await login(identifier.trim(), password);
    setIsSubmitting(false);

    if (!result.success) {
      setErrorMessage(result.error || "Authentication failed. Please verify your credentials.");
    } else {
      try {
        if (rememberMe) {
          localStorage.setItem(REMEMBERED_IDENTIFIER_KEY, identifier.trim());
        } else {
          localStorage.removeItem(REMEMBERED_IDENTIFIER_KEY);
        }
      } catch {
        // ignore
      }

      setSuccessMessage("Authentication verified. Redirecting to platform...");
      setTimeout(() => {
        router.push("/");
      }, 900);
    }
  };

  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setRecoveryError(null);
    setRecoveryNotice(null);

    if (!recoveryEmail.trim() || !recoveryEmail.includes("@")) {
      setRecoveryError("Please enter a valid account email address.");
      return;
    }

    setRecoveryBusy(true);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: recoveryEmail.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        setRecoveryError(data.error || "Unable to initiate password recovery.");
      } else {
        setRecoveryNotice(
          data.debugResetToken
            ? "Reset token issued for local verification. Enter your new password below."
            : data.message || "If the account exists, reset instructions have been issued."
        );
        if (data.debugResetToken) {
          setResetToken(data.debugResetToken);
        }
        setRecoveryStep("reset");
      }
    } catch {
      setRecoveryError("Network error while requesting password reset.");
    } finally {
      setRecoveryBusy(false);
    }
  };

  const handleConfirmReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setRecoveryError(null);
    setRecoveryNotice(null);

    if (!resetToken.trim()) {
      setRecoveryError("Please paste the password reset token.");
      return;
    }
    if (newPassword.length < 8) {
      setRecoveryError("New password must be at least 8 characters long.");
      return;
    }

    setRecoveryBusy(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: resetToken.trim(), newPassword }),
      });
      const data = await res.json();
      if (!res.ok) {
        setRecoveryError(data.error || "Failed to reset password.");
      } else {
        setShowRecovery(false);
        setRecoveryStep("request");
        setResetToken("");
        setNewPassword("");
        setSuccessMessage(data.message || "Password reset successful. Sign in with your new password.");
      }
    } catch {
      setRecoveryError("Network error while resetting password.");
    } finally {
      setRecoveryBusy(false);
    }
  };

  return (
    <AuthLayout
      sectionLabel="PLAYER ACCESS"
      heading="Welcome back."
      subtitle="Your next adventure starts here. Sign in to continue."
      footerText="New to KURONEX?"
      footerLinkText="Create an account."
      footerLinkHref="/register"
    >
      {/* Existing Session Notification */}
      {user && !successMessage && (
        <div
          role="status"
          className="mb-5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs text-emerald-400 flex items-center justify-between"
        >
          <span>
            Signed in as <strong className="text-white">{user.username}</strong>
          </span>
          <Link
            href="/"
            className="font-semibold underline hover:text-white transition-colors ml-2"
          >
            Go to Platform
          </Link>
        </div>
      )}

      {/* General Error Banner */}
      {errorMessage && (
        <div
          role="alert"
          className="mb-5 rounded-xl border border-[#FF263D]/40 bg-[#FF263D]/10 p-3.5 text-xs text-[#FF4054] flex items-start gap-2.5 shadow-[0_4px_16px_rgba(255,38,61,0.12)]"
        >
          <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-[#FF263D]" aria-hidden="true" />
          <span className="leading-relaxed">{errorMessage}</span>
        </div>
      )}

      {/* Success Banner */}
      {successMessage && (
        <div
          role="status"
          className="mb-5 rounded-xl border border-emerald-500/40 bg-emerald-500/10 p-3.5 text-xs text-emerald-400 flex items-center gap-2.5 shadow-[0_4px_16px_rgba(16,185,129,0.12)]"
        >
          <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" aria-hidden="true" />
          <span className="leading-relaxed font-medium">{successMessage}</span>
        </div>
      )}

      {/* Password Recovery Panel */}
      {showRecovery ? (
        <div className="mb-4 rounded-2xl border border-[#292929] bg-[#141414] p-4 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <KeyRound className="h-4 w-4 text-[#FF263D]" />
              <h2 className="text-sm font-bold text-white">Password Recovery</h2>
            </div>
            <button
              type="button"
              onClick={() => {
                setShowRecovery(false);
                setRecoveryError(null);
                setRecoveryNotice(null);
              }}
              aria-label="Close recovery"
              className="text-[#929292] hover:text-white cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {recoveryError && (
            <div className="rounded-xl border border-[#FF263D]/40 bg-[#FF263D]/10 p-2.5 text-xs text-[#FF4054]">
              {recoveryError}
            </div>
          )}
          {recoveryNotice && (
            <div className="rounded-xl border border-emerald-500/40 bg-emerald-500/10 p-2.5 text-xs text-emerald-400">
              {recoveryNotice}
            </div>
          )}

          {recoveryStep === "request" ? (
            <form onSubmit={handleRequestReset} className="space-y-3">
              <div>
                <label className="block text-[11px] font-mono uppercase text-[#929292] mb-1">
                  Account Email
                </label>
                <input
                  type="email"
                  required
                  value={recoveryEmail}
                  onChange={(e) => setRecoveryEmail(e.target.value)}
                  placeholder="player@kuronex.com"
                  className="w-full rounded-xl border border-[#292929] bg-[#181818] px-3.5 py-2.5 text-xs text-white focus:border-[#FF263D] outline-none"
                />
              </div>
              <button
                type="submit"
                disabled={recoveryBusy}
                className="w-full rounded-xl bg-[#FF263D] hover:bg-[#FF4054] py-2.5 text-xs font-bold text-white transition cursor-pointer disabled:opacity-50"
              >
                {recoveryBusy ? "Requesting Reset Token..." : "Send Reset Instructions"}
              </button>
            </form>
          ) : (
            <form onSubmit={handleConfirmReset} className="space-y-3">
              <div>
                <label className="block text-[11px] font-mono uppercase text-[#929292] mb-1">
                  Reset Token
                </label>
                <input
                  type="text"
                  required
                  value={resetToken}
                  onChange={(e) => setResetToken(e.target.value)}
                  placeholder="Paste verification token"
                  className="w-full rounded-xl border border-[#292929] bg-[#181818] px-3.5 py-2.5 text-xs text-white font-mono focus:border-[#FF263D] outline-none"
                />
              </div>
              <div>
                <label className="block text-[11px] font-mono uppercase text-[#929292] mb-1">
                  New Password (8+ chars)
                </label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full rounded-xl border border-[#292929] bg-[#181818] px-3.5 py-2.5 text-xs text-white focus:border-[#FF263D] outline-none"
                />
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setRecoveryStep("request")}
                  className="rounded-xl border border-[#292929] px-3 py-2 text-xs text-[#929292] hover:text-white cursor-pointer"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={recoveryBusy}
                  className="flex-1 rounded-xl bg-[#FF263D] hover:bg-[#FF4054] py-2.5 text-xs font-bold text-white transition cursor-pointer disabled:opacity-50"
                >
                  {recoveryBusy ? "Updating Password..." : "Confirm Password Reset"}
                </button>
              </div>
            </form>
          )}
        </div>
      ) : (
        /* Sign-in Form */
        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <AuthInput
            id="login-identifier"
            name="identifier"
            type="text"
            label="Gamertag or Email"
            placeholder="e.g. ApexTitan or player@kuronex.com"
            required
            autoComplete="username"
            disabled={isSubmitting}
            value={identifier}
            onChange={(e) => {
              setIdentifier(e.target.value);
              if (fieldErrors.identifier) {
                setFieldErrors((prev) => ({ ...prev, identifier: undefined }));
              }
            }}
            icon={Mail}
            error={fieldErrors.identifier}
          />

          <AuthInput
            id="login-password"
            name="password"
            label="Password"
            placeholder="••••••••••••"
            required
            isPassword
            showPassword={showPassword}
            onTogglePassword={() => setShowPassword((prev) => !prev)}
            autoComplete="current-password"
            disabled={isSubmitting}
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              if (fieldErrors.password) {
                setFieldErrors((prev) => ({ ...prev, password: undefined }));
              }
            }}
            icon={Lock}
            error={fieldErrors.password}
            rightAction={
              <button
                type="button"
                onClick={() => {
                  setErrorMessage(null);
                  setRecoveryError(null);
                  setRecoveryNotice(null);
                  setRecoveryEmail(identifier.includes("@") ? identifier : "");
                  setRecoveryStep("request");
                  setShowRecovery(true);
                }}
                className="text-[11px] text-[#929292] hover:text-[#FFFFFF] transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#FF263D] rounded cursor-pointer"
              >
                Forgot password?
              </button>
            }
          />

          {/* Remember Me Checkbox */}
          <div className="flex items-center justify-between pt-1">
            <label className="flex items-center gap-2.5 cursor-pointer select-none group">
              <input
                type="checkbox"
                id="remember-me"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                disabled={isSubmitting}
                className="h-4 w-4 rounded border-[#292929] bg-[#181818] accent-[#FF263D] focus:ring-2 focus:ring-[#FF263D]/40 cursor-pointer"
              />
              <span className="text-xs text-[#929292] group-hover:text-[#FFFFFF] transition-colors">
                Remember me
              </span>
            </label>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full mt-2 inline-flex items-center justify-center gap-2 rounded-xl bg-[#FF263D] hover:bg-[#FF4054] active:bg-[#D91B30] py-3.5 px-6 text-xs font-bold tracking-wide text-[#FFFFFF] shadow-[0_4px_20px_rgba(255,38,61,0.35)] transition-all duration-200 hover:shadow-[0_6px_28px_rgba(255,38,61,0.50)] disabled:opacity-50 disabled:pointer-events-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF263D] focus-visible:ring-offset-2 focus-visible:ring-offset-[#111111] cursor-pointer"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                <span>Authenticating...</span>
              </>
            ) : (
              <>
                <span>Sign In</span>
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </>
            )}
          </button>
        </form>
      )}
    </AuthLayout>
  );
}
