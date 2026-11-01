"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";
import { AlertOctagon, RotateCcw } from "lucide-react";
import { Button } from "./button";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onReset?: () => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("ErrorBoundary caught an unhandled error:", error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    this.props.onReset?.();
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <ErrorDisplay
          error={this.state.error}
          onReset={this.handleReset}
        />
      );
    }

    return this.props.children;
  }
}

export function ErrorDisplay({
  error,
  onReset,
}: {
  error: Error | null;
  onReset?: () => void;
}) {
  return (
    <div
      role="alert"
      className="my-12 flex flex-col items-center justify-center rounded-2xl border border-rose-500/30 bg-[#111111] p-8 text-center max-w-xl mx-auto shadow-[0_20px_50px_rgba(0,0,0,0.85)]"
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-rose-500/30 bg-rose-500/10 text-rose-400 mb-4">
        <AlertOctagon className="h-6 w-6" />
      </div>

      <h3 className="text-base font-bold text-[#FFFFFF] mb-1">
        Application Subsystem Error
      </h3>

      <p className="text-xs text-[#929292] max-w-md leading-relaxed mb-4">
        An unexpected error occurred while rendering this module. Your data remains secure.
      </p>

      {error && (
        <pre className="mb-6 w-full max-w-md overflow-x-auto rounded-xl border border-[#292929] bg-[#080808] p-3 text-left font-mono text-[11px] text-rose-300 scrollbar-none">
          {error.message || "Unknown error"}
        </pre>
      )}

      {onReset && (
        <Button
          variant="primary"
          size="sm"
          onClick={onReset}
          leftIcon={<RotateCcw className="h-3.5 w-3.5" />}
        >
          Try Again
        </Button>
      )}
    </div>
  );
}

