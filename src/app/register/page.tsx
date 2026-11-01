"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { User, Mail, Lock, ShieldCheck, ArrowRight, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { AuthInput } from "@/components/auth/AuthInput";
import { PasswordStrength } from "@/components/auth/PasswordStrength";

interface FormErrors {
  username?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  terms?: string;
}

export default function RegisterPage() {
  const router = useRouter();
  const { register, user } = useAuth();

  const [accountType, setAccountType] = useState<"player" | "developer">(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (params.get("type") === "developer") {
        return "developer";
      }
    }
    return "player";
  });
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FormErrors>({});

  const validateField = (field: keyof FormErrors, value?: string): string | undefined => {
    switch (field) {
      case "username": {
        const val = (value !== undefined ? value : username).trim();
        if (!val) return "Please enter a gamertag.";
        if (val.length < 3) return "Gamertag must be at least 3 characters.";
        if (!/^[a-zA-Z0-9_-]+$/.test(val)) return "Gamertag can only contain letters, numbers, hyphens, and underscores.";
        return undefined;
      }
      case "email": {
        const val = (value !== undefined ? value : email).trim();
        if (!val) return "Please enter an email address.";
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) return "Please enter a valid email address.";
        return undefined;
      }
      case "password": {
        const val = value !== undefined ? value : password;
        if (!val) return "Please enter a password.";
        if (val.length < 6) return "Password must be at least 6 characters long.";
        return undefined;
      }
      case "confirmPassword": {
        const val = value !== undefined ? value : confirmPassword;
        if (!val) return "Please confirm your password.";
        if (val !== password) return "Passwords do not match.";
        return undefined;
      }
      case "terms": {
        if (!termsAccepted) return "You must agree to the Terms of Service and Privacy Policy.";
        return undefined;
      }
      default:
        return undefined;
    }
  };

  const validateAll = (): boolean => {
    const errors: FormErrors = {};
    const uErr = validateField("username");
    if (uErr) errors.username = uErr;

    const eErr = validateField("email");
    if (eErr) errors.email = eErr;

    const pErr = validateField("password");
    if (pErr) errors.password = pErr;

    const cErr = validateField("confirmPassword");
    if (cErr) errors.confirmPassword = cErr;

    if (!termsAccepted) {
      errors.terms = "You must agree to the Terms of Service and Privacy Policy.";
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!validateAll()) {
      return;
    }

    setIsSubmitting(true);
    const result = await register(username.trim(), email.trim(), password, accountType);
    setIsSubmitting(false);

    if (!result.success) {
      setErrorMessage(result.error || "Registration could not be completed. Please try again.");
    } else {
      if (accountType === "developer") {
        setSuccessMessage("Developer account created! Redirecting to Studio Workspace...");
        setTimeout(() => {
          router.push("/developers");
        }, 1000);
      } else {
        setSuccessMessage("Account created successfully! Initializing your player vault...");
        setTimeout(() => {
          router.push("/library");
        }, 1000);
      }
    }
  };

  return (
    <AuthLayout
      sectionLabel={accountType === "developer" ? "DEVELOPER REGISTRATION" : "PLAYER REGISTRATION"}
      heading={accountType === "developer" ? "Join Developer Program." : "Create your account."}
      subtitle={
        accountType === "developer"
          ? "Access the Kuronex Studio Portal to submit games and configure client binary releases."
          : "Join Kuronex to curate your personal vault and play on the upcoming desktop client."
      }
      footerText="Already have an account?"
      footerLinkText="Sign in."
      footerLinkHref="/login"
    >
      {/* Existing Session Notification */}
      {user && !successMessage && (
        <div
          role="status"
          className="mb-5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs text-emerald-400 flex items-center justify-between"
        >
          <span>
            Already active as <strong className="text-white">{user.username}</strong>
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

      {/* Registration Form */}
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        {/* Account Role Selector */}
        <div className="rounded-2xl border border-white/10 bg-[#07080A] p-1.5 flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setAccountType("player")}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer ${
              accountType === "player"
                ? "bg-[#FF263D] text-white shadow-md shadow-[#FF263D]/25"
                : "text-[#929292] hover:text-white"
            }`}
          >
            <span>🎮 Player Account</span>
          </button>
          <button
            type="button"
            onClick={() => setAccountType("developer")}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer ${
              accountType === "developer"
                ? "bg-[#00E5FF] text-black shadow-md shadow-[#00E5FF]/25 font-extrabold"
                : "text-[#929292] hover:text-white"
            }`}
          >
            <span>💻 Developer Studio</span>
          </button>
        </div>
        {/* Gamertag Field */}
        <AuthInput
          id="register-username"
          name="username"
          type="text"
          label="Gamertag"
          placeholder="e.g. ApexTitan"
          required
          autoComplete="username"
          disabled={isSubmitting}
          value={username}
          onChange={(e) => {
            const val = e.target.value;
            setUsername(val);
            if (fieldErrors.username) {
              setFieldErrors((prev) => ({ ...prev, username: validateField("username", val) }));
            }
          }}
          onBlur={() => {
            setFieldErrors((prev) => ({ ...prev, username: validateField("username") }));
          }}
          icon={User}
          error={fieldErrors.username}
        />

        {/* Email Address Field */}
        <AuthInput
          id="register-email"
          name="email"
          type="email"
          label="Email address"
          placeholder="player@kuronex.com"
          required
          autoComplete="email"
          disabled={isSubmitting}
          value={email}
          onChange={(e) => {
            const val = e.target.value;
            setEmail(val);
            if (fieldErrors.email) {
              setFieldErrors((prev) => ({ ...prev, email: validateField("email", val) }));
            }
          }}
          onBlur={() => {
            setFieldErrors((prev) => ({ ...prev, email: validateField("email") }));
          }}
          icon={Mail}
          error={fieldErrors.email}
        />

        {/* Password Field with Strength Meter */}
        <div>
          <AuthInput
            id="register-password"
            name="password"
            label="Password"
            placeholder="At least 6 characters"
            required
            isPassword
            showPassword={showPassword}
            onTogglePassword={() => setShowPassword((prev) => !prev)}
            autoComplete="new-password"
            disabled={isSubmitting}
            value={password}
            onChange={(e) => {
              const val = e.target.value;
              setPassword(val);
              if (fieldErrors.password) {
                setFieldErrors((prev) => ({ ...prev, password: validateField("password", val) }));
              }
              if (confirmPassword && fieldErrors.confirmPassword) {
                setFieldErrors((prev) => ({
                  ...prev,
                  confirmPassword: val !== confirmPassword ? "Passwords do not match." : undefined,
                }));
              }
            }}
            onBlur={() => {
              setFieldErrors((prev) => ({ ...prev, password: validateField("password") }));
            }}
            icon={Lock}
            error={fieldErrors.password}
          />

          {/* Real-time Password Strength Indicator */}
          <PasswordStrength password={password} />
        </div>

        {/* Confirm Password Field */}
        <AuthInput
          id="register-confirm-password"
          name="confirmPassword"
          label="Confirm password"
          placeholder="Repeat your password"
          required
          isPassword
          showPassword={showConfirmPassword}
          onTogglePassword={() => setShowConfirmPassword((prev) => !prev)}
          autoComplete="new-password"
          disabled={isSubmitting}
          value={confirmPassword}
          onChange={(e) => {
            const val = e.target.value;
            setConfirmPassword(val);
            if (fieldErrors.confirmPassword) {
              setFieldErrors((prev) => ({
                ...prev,
                confirmPassword: val !== password ? "Passwords do not match." : undefined,
              }));
            }
          }}
          onBlur={() => {
            setFieldErrors((prev) => ({ ...prev, confirmPassword: validateField("confirmPassword") }));
          }}
          icon={ShieldCheck}
          error={fieldErrors.confirmPassword}
        />

        {/* Terms and Conditions Checkbox */}
        <div className="pt-1">
          <label className="flex items-start gap-2.5 cursor-pointer select-none group">
            <input
              type="checkbox"
              id="register-terms"
              checked={termsAccepted}
              onChange={(e) => {
                setTermsAccepted(e.target.checked);
                if (fieldErrors.terms) {
                  setFieldErrors((prev) => ({ ...prev, terms: undefined }));
                }
              }}
              disabled={isSubmitting}
              className="mt-0.5 h-4 w-4 rounded border-[#292929] bg-[#181818] accent-[#FF263D] focus:ring-2 focus:ring-[#FF263D]/40 cursor-pointer"
            />
            <span className="text-xs text-[#929292] leading-relaxed group-hover:text-[#FFFFFF] transition-colors">
              I agree to the{" "}
              <Link href="#terms" className="text-[#FF263D] hover:underline">
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link href="#privacy" className="text-[#FF263D] hover:underline">
                Privacy Policy
              </Link>
              .
            </span>
          </label>
          {fieldErrors.terms && (
            <div role="alert" className="mt-1.5 flex items-center gap-1.5 text-xs text-[#FF263D]">
              <AlertCircle className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              <span>{fieldErrors.terms}</span>
            </div>
          )}
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
              <span>Creating Account...</span>
            </>
          ) : (
            <>
              <span>Create Account</span>
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </>
          )}
        </button>
      </form>
    </AuthLayout>
  );
}
