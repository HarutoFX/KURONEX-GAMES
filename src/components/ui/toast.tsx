"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ToastItem {
  id: string;
  title?: string;
  message: string;
  type?: "success" | "error" | "info" | "warning";
  duration?: number;
}

interface ToastContextType {
  showToast: (message: string, type?: ToastItem["type"], title?: string, duration?: number) => void;
  dismissToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    (message: string, type: ToastItem["type"] = "success", title?: string, duration = 4000) => {
      const id = `toast_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
      setToasts((prev) => [...prev, { id, message, type, title, duration }]);

      if (duration > 0) {
        setTimeout(() => {
          dismissToast(id);
        }, duration);
      }
    },
    [dismissToast]
  );

  return (
    <ToastContext.Provider value={{ showToast, dismissToast }}>
      {children}

      {/* Floating Toast Notification Viewport */}
      <div
        aria-live="polite"
        className="fixed bottom-4 right-4 z-50 flex max-w-sm flex-col gap-2.5 pointer-events-none"
      >
        {toasts.map((t) => (
          <div
            key={t.id}
            role="status"
            className={cn(
              "pointer-events-auto flex items-start gap-3 rounded-2xl border bg-[#111111]/95 p-4 shadow-[0_16px_50px_rgba(0,0,0,0.85)] backdrop-blur-xl animate-in slide-in-from-bottom-3 duration-200",
              t.type === "success" && "border-emerald-500/30 text-emerald-400",
              t.type === "error" && "border-rose-500/40 text-rose-400",
              t.type === "warning" && "border-amber-500/30 text-amber-400",
              (!t.type || t.type === "info") && "border-[#FF263D]/40 text-[#FF4054]"
            )}
          >
            <div className="mt-0.5 shrink-0">
              {t.type === "success" && <CheckCircle2 className="h-4 w-4" />}
              {t.type === "error" && <AlertCircle className="h-4 w-4" />}
              {t.type === "warning" && <AlertTriangle className="h-4 w-4" />}
              {(!t.type || t.type === "info") && <Info className="h-4 w-4" />}
            </div>

            <div className="flex-1 min-w-0 text-left">
              {t.title && <h5 className="text-xs font-bold text-[#FFFFFF]">{t.title}</h5>}
              <p className="text-xs text-[#FFFFFF]/90 leading-relaxed">{t.message}</p>
            </div>

            <button
              type="button"
              onClick={() => dismissToast(t.id)}
              aria-label="Dismiss notification"
              className="rounded-lg p-1 text-[#929292] hover:text-[#FFFFFF] hover:bg-[#181818] transition-colors cursor-pointer"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    // Graceful fallback if invoked outside provider
    return {
      showToast: (msg: string) => console.log("[Toast]", msg),
      dismissToast: () => {},
    };
  }
  return context;
}
