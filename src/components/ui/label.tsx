import React from "react";
import { cn } from "@/lib/utils";

export type LabelProps = React.LabelHTMLAttributes<HTMLLabelElement>;

export function Label({ className, children, ...props }: LabelProps) {
  return (
    <label
      className={cn(
        "text-xs font-bold text-[#FFFFFF] tracking-wide block select-none",
        className
      )}
      {...props}
    >
      {children}
    </label>
  );
}

export default Label;

