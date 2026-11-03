"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  Database,
  Copy,
  Check,
  Download,
  Terminal,
  FileCode,
  ShieldCheck,
} from "lucide-react";

interface BackendExportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function BackendExportModal({ isOpen, onClose }: BackendExportModalProps) {
  const [activeTab, setActiveTab] = useState<"sql" | "prisma" | "json">("sql");
  const [copied, setCopied] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState<{
    count: number;
    sqlScript: string;
    prismaSeed: string;
    adminUsers: unknown[];
  } | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    async function loadExport() {
      setIsLoading(true);
      try {
        const res = await fetch("/api/admin/export-backend");
        if (res.ok) {
          const json = await res.json();
          setData(json);
        }
      } catch (err) {
        console.error("Failed to load backend credential export:", err);
      } finally {
        setIsLoading(false);
      }
    }

    loadExport();
  }, [isOpen]);

  if (!isOpen) return null;

  const currentContent =
    activeTab === "sql"
      ? data?.sqlScript || ""
      : activeTab === "prisma"
      ? data?.prismaSeed || ""
      : JSON.stringify(data?.adminUsers || [], null, 2);

  const handleCopy = () => {
    if (!currentContent) return;
    navigator.clipboard.writeText(currentContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!currentContent) return;
    const filename =
      activeTab === "sql"
        ? "admin-seed.sql"
        : activeTab === "prisma"
        ? "seed.ts"
        : "admin-credentials.json";
    const blob = new Blob([currentContent], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md">
      <div className="relative w-full max-w-2xl rounded-3xl border border-[#35151C] bg-[#110709] p-6 sm:p-8 shadow-[0_25px_80px_rgba(0,0,0,0.9)] space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#35151C]">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#00E5FF]/40 bg-[#00E5FF]/10 text-[#00E5FF]">
              <Database className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                Backend Credential Migration Exporter
              </h3>
              <p className="text-[11px] text-[#A1A1AA]">
                Transfer verified administrator credentials into your future PostgreSQL, Prisma, or Supabase backend.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-[#A1A1AA] hover:bg-[#1A0D10] hover:text-white transition cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Info Banner */}
        <div className="p-3 rounded-xl border border-emerald-500/20 bg-emerald-500/5 text-xs text-emerald-300 leading-relaxed flex items-start gap-2.5">
          <ShieldCheck className="h-4 w-4 shrink-0 text-emerald-400 mt-0.5" />
          <div>
            <strong>Ready for Production Migration:</strong> All passwords use industry-standard{" "}
            <code className="text-white font-mono">scrypt</code> 64-byte hashes and cryptographic salts. You will never need to recreate admin accounts or force password resets.
          </div>
        </div>

        {/* Format Selector Tabs */}
        <div className="flex items-center justify-between gap-2 border-b border-[#35151C] pb-2">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveTab("sql")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                activeTab === "sql"
                  ? "bg-[#FF263D] text-white shadow-md shadow-[#FF263D]/25"
                  : "text-[#A1A1AA] hover:text-white bg-[#160B0E]"
              }`}
            >
              <Database className="h-3.5 w-3.5" />
              <span>PostgreSQL / SQL</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("prisma")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                activeTab === "prisma"
                  ? "bg-[#00E5FF] text-black font-extrabold shadow-md shadow-[#00E5FF]/25"
                  : "text-[#A1A1AA] hover:text-white bg-[#160B0E]"
              }`}
            >
              <FileCode className="h-3.5 w-3.5" />
              <span>Prisma Seed</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("json")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                activeTab === "json"
                  ? "bg-white text-black font-extrabold shadow-md"
                  : "text-[#A1A1AA] hover:text-white bg-[#160B0E]"
              }`}
            >
              <Terminal className="h-3.5 w-3.5" />
              <span>JSON Export</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopy}
              className="inline-flex items-center gap-1.5 rounded-xl border border-[#35151C] bg-[#160B0E] px-3 py-1.5 text-xs font-bold text-white hover:border-[#FF263D]/40 transition cursor-pointer"
            >
              {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
              <span>{copied ? "Copied!" : "Copy"}</span>
            </button>
            <button
              type="button"
              onClick={handleDownload}
              className="inline-flex items-center gap-1.5 rounded-xl bg-[#1A0D10] border border-[#35151C] px-3 py-1.5 text-xs font-bold text-white hover:border-cyan-500/40 transition cursor-pointer"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Download</span>
            </button>
          </div>
        </div>

        {/* Code Preview Box */}
        <div className="relative rounded-2xl border border-[#35151C] bg-[#0A0406] p-4 max-h-72 overflow-y-auto font-mono text-[11px] text-[#A1A1AA] leading-relaxed select-all">
          {isLoading ? (
            <div className="py-12 text-center text-xs text-[#A1A1AA]">
              Generating migration artifact...
            </div>
          ) : (
            <pre className="whitespace-pre-wrap break-all text-white/90">{currentContent}</pre>
          )}
        </div>

        {/* CLI Helper Note */}
        <div className="p-3 rounded-xl border border-[#35151C] bg-[#160B0E] text-[11px] text-[#A1A1AA] flex items-center justify-between">
          <span>You can also run this anytime from terminal:</span>
          <code className="text-cyan-400 font-mono bg-black/40 px-2 py-0.5 rounded">
            node scripts/export-admin-credentials.js
          </code>
        </div>
      </div>
    </div>
  );
}

