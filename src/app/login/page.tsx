"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Mail, Lock, ArrowRight, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
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
      // Remember me handling for identifier only (never passwords or tokens)
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

      {/* Sign-in Form */}
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        {/* Identifier Field */}
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

        {/* Password Field */}
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
                setErrorMessage("Password recovery is currently assisted through support@kuronex.com");
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
    </AuthLayout>
  );
}
