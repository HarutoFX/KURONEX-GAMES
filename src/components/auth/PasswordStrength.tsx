"use client";

import React, { useMemo } from "react";

interface PasswordStrengthProps {
  password: string;
}

export function PasswordStrength({ password }: PasswordStrengthProps) {
  const { score, label, colorClass } = useMemo(() => {
    if (!password) {
      return { score: 0, label: "", colorClass: "bg-[#292929]" };
    }

    if (password.length < 6) {
      return { score: 1, label: "Too short (min 6)", colorClass: "bg-[#FF263D]" };
    }

    let calculatedScore = 1;

    const hasLower = /[a-z]/.test(password);
    const hasUpper = /[A-Z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecial = /[^A-Za-z0-9]/.test(password);

    if (password.length >= 8) calculatedScore++;
    if ((hasLower && hasUpper) || (hasLower && hasNumber) || (hasUpper && hasNumber)) calculatedScore++;
    if (password.length >= 10 && hasSpecial) calculatedScore++;

    calculatedScore = Math.min(calculatedScore, 4);

    let strengthLabel = "Weak";
    let color = "bg-[#FF263D]";

    switch (calculatedScore) {
      case 2:
        strengthLabel = "Fair";
        color = "bg-[#F59E0B]";
        break;
      case 3:
        strengthLabel = "Good";
        color = "bg-[#10B981]";
        break;
      case 4:
        strengthLabel = "Strong";
        color = "bg-[#00E5FF]";
        break;
      default:
        strengthLabel = "Weak";
        color = "bg-[#FF263D]";
        break;
    }

    return { score: calculatedScore, label: strengthLabel, colorClass: color };
  }, [password]);

  if (!password) return null;

  return (
    <div className="w-full mt-2" aria-live="polite">
      <div className="flex items-center justify-between text-[11px] mb-1.5">
        <span className="text-[#929292]">Password Strength</span>
        <span className="font-semibold text-[#FFFFFF]">{label}</span>
      </div>
      <div className="grid grid-cols-4 gap-1.5 h-1">
        {[1, 2, 3, 4].map((step) => (
          <div
            key={step}
            className={`h-full rounded-full transition-colors duration-200 ${
              step <= score ? colorClass : "bg-[#292929]"
            }`}
          />
        ))}
      </div>
    </div>
  );
}

