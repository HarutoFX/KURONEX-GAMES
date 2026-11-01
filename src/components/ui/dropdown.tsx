"use client";

import React, { useState, useRef, useEffect, useId } from "react";
import { ChevronDown, Check } from "lucide-react";
import { cn } from "@/lib/utils";

export interface DropdownOption {
  value: string;
  label: string;
  icon?: React.ReactNode;
  badge?: string;
  disabled?: boolean;
}

export interface DropdownProps {
  options: DropdownOption[];
  value: string;
  onChange: (value: string) => void;
  label?: string;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  error?: string;
}

export function Dropdown({
  options,
  value,
  onChange,
  label,
  placeholder = "Select an option...",
  className,
  disabled = false,
  error,
}: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const id = useId();

  const selectedOption = options.find((opt) => opt.value === value);

  // Close on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleOutsideClick);
    }
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [isOpen]);

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return;

    switch (e.key) {
      case "Enter":
      case " ":
        e.preventDefault();
        if (isOpen) {
          if (focusedIndex >= 0 && options[focusedIndex] && !options[focusedIndex].disabled) {
            onChange(options[focusedIndex].value);
            setIsOpen(false);
          }
        } else {
          setIsOpen(true);
        }
        break;
      case "ArrowDown":
        e.preventDefault();
        if (!isOpen) {
          setIsOpen(true);
          setFocusedIndex(0);
        } else {
          setFocusedIndex((prev) => (prev < options.length - 1 ? prev + 1 : 0));
        }
        break;
      case "ArrowUp":
        e.preventDefault();
        if (!isOpen) {
          setIsOpen(true);
          setFocusedIndex(options.length - 1);
        } else {
          setFocusedIndex((prev) => (prev > 0 ? prev - 1 : options.length - 1));
        }
        break;
      case "Escape":
        e.preventDefault();
        setIsOpen(false);
        break;
    }
  };

  return (
    <div className={cn("relative w-full space-y-1.5 text-left", className)} ref={containerRef}>
      {label && (
        <label
          id={`${id}-label`}
          className="block text-xs font-semibold tracking-wide text-[#FFFFFF] select-none"
        >
          {label}
        </label>
      )}

      <button
        type="button"
        disabled={disabled}
        role="combobox"
        aria-labelledby={label ? `${id}-label` : undefined}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-controls={`${id}-listbox`}
        onClick={() => setIsOpen(!isOpen)}
        onKeyDown={handleKeyDown}
        className={cn(
          "flex w-full items-center justify-between gap-2 rounded-xl border bg-[#111111] px-4 py-2.5 text-xs sm:text-sm text-[#FFFFFF] transition-all duration-200 outline-none cursor-pointer",
          "focus-visible:border-[#FF263D] focus-visible:ring-1 focus-visible:ring-[#FF263D]/40",
          disabled ? "opacity-50 cursor-not-allowed" : "hover:border-[#FF263D]/40",
          error ? "border-rose-500/80" : "border-[#292929]"
        )}
      >
        <span className={cn("truncate", !selectedOption && "text-[#929292]")}>
          {selectedOption ? (
            <span className="flex items-center gap-2">
              {selectedOption.icon}
              <span>{selectedOption.label}</span>
            </span>
          ) : (
            placeholder
          )}
        </span>
        <ChevronDown
          className={cn("h-4 w-4 shrink-0 text-[#929292] transition-transform duration-200", isOpen && "rotate-180")}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          id={`${id}-listbox`}
          role="listbox"
          className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-xl border border-[#292929] bg-[#111111] p-1.5 shadow-[0_12px_40px_rgba(0,0,0,0.85)] scrollbar-none backdrop-blur-md"
        >
          {options.map((opt, index) => {
            const isSelected = opt.value === value;
            const isFocused = focusedIndex === index;

            return (
              <div
                key={opt.value}
                role="option"
                aria-selected={isSelected}
                aria-disabled={opt.disabled}
                onClick={() => {
                  if (opt.disabled) return;
                  onChange(opt.value);
                  setIsOpen(false);
                }}
                onMouseEnter={() => setFocusedIndex(index)}
                className={cn(
                  "flex items-center justify-between rounded-lg px-3 py-2 text-xs font-medium transition-colors cursor-pointer select-none",
                  isSelected
                    ? "bg-[#181818] text-[#FFFFFF] font-semibold"
                    : isFocused
                    ? "bg-[#181818]/80 text-[#FFFFFF]"
                    : "text-[#929292] hover:text-[#FFFFFF] hover:bg-[#181818]",
                  opt.disabled && "opacity-40 cursor-not-allowed pointer-events-none"
                )}
              >
                <div className="flex items-center gap-2 truncate">
                  {opt.icon}
                  <span className="truncate">{opt.label}</span>
                  {opt.badge && (
                    <span className="rounded-full border border-[#292929] bg-[#181818] px-1.5 py-0.5 text-[9px] font-mono text-[#FF263D]">
                      {opt.badge}
                    </span>
                  )}
                </div>

                {isSelected && <Check className="h-3.5 w-3.5 text-[#FF263D] shrink-0" />}
              </div>
            );
          })}
        </div>
      )}

      {error && <p className="text-[11px] text-rose-400">{error}</p>}
    </div>
  );
}

