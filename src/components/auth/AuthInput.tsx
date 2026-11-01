"use client";

import React from "react";
import { Eye, EyeOff, AlertCircle } from "lucide-react";

interface AuthInputProps {
  id: string;
  name?: string;
  type?: string;
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
  placeholder?: string;
  required?: boolean;
  autoComplete?: string;
  disabled?: boolean;
  icon?: React.ComponentType<{ className?: string }>;
  error?: string | null;
  rightAction?: React.ReactNode;
  isPassword?: boolean;
  showPassword?: boolean;
  onTogglePassword?: () => void;
  maxLength?: number;
}

export function AuthInput({
  id,
  name,
  type = "text",
  label,
  value,
  onChange,
  onBlur,
  placeholder,
  required = false,
  autoComplete,
  disabled = false,
  icon: Icon,
  error,
  rightAction,
  isPassword = false,
  showPassword = false,
  onTogglePassword,
  maxLength,
}: AuthInputProps) {
  const inputType = isPassword ? (showPassword ? "text" : "password") : type;
  const hasError = Boolean(error);
  const errorId = `${id}-error`;

  return (
    <div className="w-full">
      {/* Label and optional right action */}
      <div className="flex items-center justify-between mb-1.5">
        <label
          htmlFor={id}
          className="block text-[11px] font-semibold uppercase tracking-wider text-[#929292]"
        >
          {label}
          {required && <span className="text-[#FF263D] ml-0.5" aria-hidden="true">*</span>}
        </label>
        {rightAction && <div>{rightAction}</div>}
      </div>

      {/* Input Container */}
      <div className="relative flex items-center">
        {Icon && (
          <div className="absolute left-3.5 flex items-center pointer-events-none text-[#929292]" aria-hidden="true">
            <Icon className="h-4 w-4" />
          </div>
        )}

        <input
          id={id}
          name={name || id}
          type={inputType}
          required={required}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          placeholder={placeholder}
          autoComplete={autoComplete}
          disabled={disabled}
          maxLength={maxLength}
          aria-invalid={hasError}
          aria-describedby={hasError ? errorId : undefined}
          className={`w-full rounded-xl border bg-[#181818] py-3 text-sm text-[#FFFFFF] placeholder-[#555555] transition-all duration-200 outline-none ${
            Icon ? "pl-10" : "pl-4"
          } ${isPassword ? "pr-11" : "pr-4"} ${
            hasError
              ? "border-[#FF263D] focus:ring-2 focus:ring-[#FF263D]/40"
              : "border-[#292929] hover:border-[#383838] focus:border-[#FF263D] focus:ring-1 focus:ring-[#FF263D]/40"
          } disabled:opacity-50 disabled:cursor-not-allowed`}
        />

        {/* Password Visibility Toggle */}
        {isPassword && onTogglePassword && (
          <button
            type="button"
            onClick={onTogglePassword}
            disabled={disabled}
            className="absolute right-3.5 p-1 text-[#929292] hover:text-[#FFFFFF] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF263D] rounded-lg cursor-pointer"
            aria-label={showPassword ? `Hide ${label.toLowerCase()}` : `Show ${label.toLowerCase()}`}
            aria-pressed={showPassword}
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        )}
      </div>

      {/* Inline Field Error */}
      {error && (
        <div
          id={errorId}
          role="alert"
          className="mt-1.5 flex items-center gap-1.5 text-xs text-[#FF263D]"
        >
          <AlertCircle className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}

