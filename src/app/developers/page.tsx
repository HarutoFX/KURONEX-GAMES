"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  Send,
  Check,
  Gamepad2,
  HardDriveDownload,
  Building2,
  LayoutDashboard,
  Sparkles,
  Code2,
} from "lucide-react";
import { GradientText } from "@/components/ui/gradient-text";
import { DeveloperMarquee } from "@/components/developers/DeveloperMarquee";
import type { DeveloperPartner } from "@/lib/library-store";
import { SiteNavbar, SiteFooter } from "@/components/ui/navigation";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { developersService } from "@/services/developers.service";
import { DeveloperSubmissionDto, ClientBuildDto } from "@/services/types";

// Portal Sub-components
import { StudioOverviewTab } from "@/components/developers/portal/StudioOverviewTab";
import { GameSubmissionsTab } from "@/components/developers/portal/GameSubmissionsTab";
import { ClientBuildsTab } from "@/components/developers/portal/ClientBuildsTab";
import { StudioProfileTab } from "@/components/developers/portal/StudioProfileTab";

const TIERS = ["All", "Premier Partner", "Studio Partner", "Indie Pioneer"] as const;
type PortalTab = "overview" | "submissions" | "builds" | "profile";

export default function DevelopersPage() {
  const { user } = useAuth();
  const isUserDeveloper =
    user?.role?.toLowerCase() === "developer" ||
    user?.role?.toLowerCase() === "admin" ||
    user?.role?.toLowerCase() === "super_admin";

  // Mode: "showcase" (public presentation) or "portal" (developer workspace)
  const [userModeOverride, setUserModeOverride] = useState<"showcase" | "portal" | null>(null);
  const viewMode = userModeOverride !== null ? userModeOverride : isUserDeveloper ? "portal" : "showcase";
  const [portalTab, setPortalTab] = useState<PortalTab>("overview");

  // Public Showcase State
  const [developers, setDevelopers] = useState<DeveloperPartner[]>([]);
  const [selectedTier, setSelectedTier] = useState<string>("All");
  const [pitchForm, setPitchForm] = useState({ studioName: "", email: "", projectTitle: "", message: "" });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [pitchError, setPitchError] = useState<string | null>(null);
  const [isSubmittingPitch, setIsSubmittingPitch] = useState(false);

  // Portal State
  const [submissions, setSubmissions] = useState<DeveloperSubmissionDto[]>([]);
  const [builds, setBuilds] = useState<ClientBuildDto[]>([]);
  const [vaultAdds, setVaultAdds] = useState<number>(0);

  useEffect(() => {
    let ignore = false;
    async function loadPublicData() {
      try {
        const devs = await developersService.getDevelopers();
        if (!ignore) {
          setDevelopers(devs as unknown as DeveloperPartner[]);
        }
      } catch (err) {
        console.error("Failed to load developer directory:", err);
      }
    }
    loadPublicData();
    return () => {
      ignore = true;
    };
  }, []);

  useEffect(() => {
    let ignore = false;
    async function loadPortalData() {
      if (!isUserDeveloper) {
        return;
      }
      try {
        const [overview, blds] = await Promise.all([
          developersService.getStudioPortalOverview(),
          developersService.getStudioBuilds(),
        ]);
        if (!ignore) {
          setSubmissions(overview.submissions);
          setVaultAdds(overview.vaultAdds);
          setBuilds(blds);
        }
      } catch (err) {
        console.error("Failed to load developer portal data:", err);
      }
    }
    loadPortalData();
    return () => {
      ignore = true;
    };
  }, [isUserDeveloper]);

  const filteredDevs = useMemo(() => {
    if (selectedTier === "All") return developers;
    return developers.filter((d) => d.partnerTier === selectedTier);
  }, [developers, selectedTier]);

  const handlePitchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPitchError(null);
    if (!pitchForm.studioName.trim() || !pitchForm.email.trim()) {
      setPitchError("Studio name and contact email are required.");
      return;
    }
    setIsSubmittingPitch(true);
    try {
      await developersService.submitPitch(pitchForm);
      setIsSubmitted(true);
    } catch (err) {
      setPitchError(err instanceof Error ? err.message : "Failed to submit studio application.");
    } finally {
      setIsSubmittingPitch(false);
    }
  };

  const handleNewSubmission = async (newSub: Partial<DeveloperSubmissionDto>) => {
    const res = await developersService.submitGameForReview(newSub);
    if (res.submission) {
      setSubmissions((prev) => [res.submission, ...prev]);
    }
  };

  const handleNewBuild = async (newBuild: Partial<ClientBuildDto>) => {
    const res = await developersService.registerBuild(newBuild);
    if (res.build) {
      setBuilds((prev) => [res.build, ...prev]);
    }
  };

  return (
    <div className="relative min-h-screen w-full text-[#FFFFFF] antialiased selection:bg-[#FF263D]/25 selection:text-white flex flex-col justify-between">
      {/* ─── 1. NAVBAR ────────────────────────────────────────── */}
      <SiteNavbar activeItem="Developers" />

      {/* ─── 2. MAIN VIEW ─────────────────────────────────────── */}
      <main className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 pt-28 sm:pt-36 pb-20 flex-1">
        {/* Mode Switcher Bar */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl border border-white/10 bg-[#07080A]/80 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <span
              className={`h-2.5 w-2.5 rounded-full ${
                viewMode === "portal" ? "bg-cyan-400 shadow-[0_0_8px_#00E5FF]" : "bg-[#FF263D] shadow-[0_0_8px_#FF263D]"
              }`}
            />
            <div>
              <div className="text-xs font-mono font-bold text-white flex items-center gap-2">
                <span>{viewMode === "portal" ? "DEVELOPER STUDIO PORTAL" : "PUBLIC PARTNER DIRECTORY"}</span>
                {isUserDeveloper && (
                  <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-2 py-0.2 rounded-full font-sans">
                    Authenticated Developer
                  </span>
                )}
              </div>
              <p className="text-[11px] text-[#929292]">
                {viewMode === "portal"
                  ? "Manage game submissions and desktop client binary releases"
                  : "Explore partner game studios building for the Kuronex platform"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setUserModeOverride("showcase")}
              className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition cursor-pointer ${
                viewMode === "showcase"
                  ? "bg-white/10 text-white border border-white/20"
                  : "text-[#929292] hover:text-white"
              }`}
            >
              Public Directory
            </button>
            <button
              onClick={() => setUserModeOverride("portal")}
              className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                viewMode === "portal"
                  ? "bg-[#00E5FF]/10 text-[#00E5FF] border border-[#00E5FF]/40 shadow-[0_0_15px_rgba(0,229,255,0.15)]"
                  : "text-[#929292] hover:text-white"
              }`}
            >
              <Code2 className="h-3.5 w-3.5" />
              <span>Studio Workspace</span>
            </button>
          </div>
        </div>

        {/* ─── CONDITIONAL RENDER: DEVELOPER PORTAL vs PUBLIC DIRECTORY ─── */}
        {viewMode === "portal" ? (
          <div className="space-y-6">
            {/* Portal Tab Navigation */}
            <div className="flex items-center gap-2 overflow-x-auto border-b border-[#292929] pb-3">
              <button
                onClick={() => setPortalTab("overview")}
                className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition cursor-pointer whitespace-nowrap ${
                  portalTab === "overview"
                    ? "bg-[#FF263D] text-white shadow-lg shadow-[#FF263D]/20"
                    : "border border-white/5 bg-white/[0.02] text-[#929292] hover:text-white"
                }`}
              >
                <LayoutDashboard className="h-3.5 w-3.5" />
                <span>Studio Dashboard</span>
              </button>

              <button
                onClick={() => setPortalTab("submissions")}
                className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition cursor-pointer whitespace-nowrap ${
                  portalTab === "submissions"
                    ? "bg-[#FF263D] text-white shadow-lg shadow-[#FF263D]/20"
                    : "border border-white/5 bg-white/[0.02] text-[#929292] hover:text-white"
                }`}
              >
                <Gamepad2 className="h-3.5 w-3.5" />
                <span>Game Submissions ({submissions.length})</span>
              </button>

              <button
                onClick={() => setPortalTab("builds")}
                className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition cursor-pointer whitespace-nowrap ${
                  portalTab === "builds"
                    ? "bg-[#FF263D] text-white shadow-lg shadow-[#FF263D]/20"
                    : "border border-white/5 bg-white/[0.02] text-[#929292] hover:text-white"
                }`}
              >
                <HardDriveDownload className="h-3.5 w-3.5" />
                <span>Client Builds ({builds.length})</span>
              </button>

              <button
                onClick={() => setPortalTab("profile")}
                className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition cursor-pointer whitespace-nowrap ${
                  portalTab === "profile"
                    ? "bg-[#FF263D] text-white shadow-lg shadow-[#FF263D]/20"
                    : "border border-white/5 bg-white/[0.02] text-[#929292] hover:text-white"
                }`}
              >
                <Building2 className="h-3.5 w-3.5" />
                <span>Studio Profile</span>
              </button>
            </div>

            {/* Active Tab Panel */}
            {portalTab === "overview" && (
              <StudioOverviewTab
                submissions={submissions}
                builds={builds}
                vaultAdds={vaultAdds}
                onNewSubmission={() => setPortalTab("submissions")}
                onNewBuild={() => setPortalTab("builds")}
              />
            )}
            {portalTab === "submissions" && (
              <GameSubmissionsTab
                submissions={submissions}
                onSubmitNew={handleNewSubmission}
              />
            )}
            {portalTab === "builds" && (
              <ClientBuildsTab
                builds={builds}
                onNewBuild={handleNewBuild}
              />
            )}
            {portalTab === "profile" && <StudioProfileTab />}
          </div>
        ) : (
          /* ─── PUBLIC DIRECTORY (PLAYERS & VISITORS) ─── */
          <div>
            <div className="max-w-4xl mx-auto text-center space-y-4">
              <div className="eyebrow mx-auto">
                <span className="eyebrow-dot" aria-hidden="true" />
                STUDIO NETWORK & CREATOR ECOSYSTEM
              </div>
              <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-[#FFFFFF] leading-tight">
                <GradientText as="span">Our Partner Studios.</GradientText>
              </h1>
              <p className="mt-4 text-base sm:text-lg text-[#929292] leading-relaxed max-w-2xl mx-auto">
                Meet the innovative game companies, independent teams, and craft studios shaping
                the future of native client gaming on Kuronex.
              </p>
            </div>

            {/* ─── CONTINUOUS MOVING SPONSOR/PARTNER STRIP ─── */}
            <div className="mt-14">
              <div className="text-center mb-3">
                <span className="font-mono text-[10px] font-bold tracking-widest text-[#929292] uppercase">
                  • ACTIVE PARTNER STUDIOS •
                </span>
              </div>
              <DeveloperMarquee developers={developers} />
            </div>

            {/* ─── TIER FILTER PILLS ─── */}
            <div className="mt-16 flex items-center justify-center gap-2 overflow-x-auto pb-2 scrollbar-none">
              {TIERS.map((tier) => (
                <button
                  key={tier}
                  type="button"
                  onClick={() => setSelectedTier(tier)}
                  className={`rounded-full px-5 py-2 text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                    selectedTier === tier
                      ? "bg-[#FF263D] text-white shadow-[0_0_20px_rgba(255,38,61,0.35)]"
                      : "border border-[#292929] bg-[#111111] text-[#929292] hover:text-white hover:border-[#383838]"
                  }`}
                >
                  {tier}
                </button>
              ))}
            </div>

            {/* ─── PARTNERS GRID ─── */}
            <div className="mt-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredDevs.map((dev) => (
                <div
                  key={dev.id}
                  className="rounded-3xl border border-[#292929] bg-[#111111] p-6 hover:border-[#FF263D]/40 transition duration-300 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <span className="font-mono text-xs font-bold text-[#FF4054]">
                        {dev.country || dev.headquarters}
                      </span>
                      <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-0.5 text-[10px] font-mono text-[#929292]">
                        {dev.partnerTier}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 mb-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-[#181818] text-base font-extrabold text-white">
                        {dev.logo || dev.icon}
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-white">{dev.name}</h3>
                        <span className="text-xs text-[#929292]">{dev.genre}</span>
                      </div>
                    </div>

                    <p className="text-xs text-[#929292] leading-relaxed">
                      {dev.tagline}
                    </p>
                  </div>

                  <div className="mt-6 pt-4 border-t border-[#292929] flex items-center justify-between">
                    <span className="text-[11px] font-mono text-[#929292]">Kuronex Ecosystem</span>
                    <a
                      href={dev.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-bold text-[#FF4054] hover:text-white transition"
                    >
                      Visit Studio ↗
                    </a>
                  </div>
                </div>
              ))}
            </div>

            {/* ─── DEVELOPER ONBOARDING BANNER ─── */}
            <div className="mt-20 rounded-3xl border border-cyan-500/30 bg-gradient-to-r from-[#031B24] via-[#07080A] to-[#031B24] p-8 text-center space-y-4">
              <span className="inline-flex items-center gap-1.5 font-mono text-xs font-bold text-[#00E5FF] tracking-wider uppercase">
                <Sparkles className="h-3.5 w-3.5" />
                CREATOR ECOSYSTEM & CLIENT REVENUE SHARE
              </span>
              <h2 className="text-2xl sm:text-4xl font-extrabold text-white">
                Launch Your Game on the Kuronex Client
              </h2>
              <p className="max-w-2xl mx-auto text-xs sm:text-sm text-[#929292] leading-relaxed">
                Kuronex offers 0% platform take on your first $500k in revenue, native Vulkan/DirectX 12 
                packaging, instant delta patching, and deep client analytics.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
                <Link
                  href="/register?type=developer"
                  className="rounded-xl bg-[#00E5FF] px-6 py-3 text-xs font-bold text-black shadow-[0_0_25px_rgba(0,229,255,0.3)] hover:brightness-110 transition"
                >
                  Register as Developer
                </Link>
                <button
                  onClick={() => setUserModeOverride("portal")}
                  className="rounded-xl border border-white/15 bg-white/5 px-6 py-3 text-xs font-bold text-white hover:bg-white/10 transition cursor-pointer"
                >
                  Explore Studio Workspace
                </button>
              </div>
            </div>

            {/* ─── PITCH CONTACT FORM ─── */}
            <div className="mt-12 rounded-3xl border border-[#292929] bg-[#111111] p-8 max-w-2xl mx-auto">
              <div className="text-center mb-6">
                <h3 className="text-xl font-bold text-white">Direct Studio Application</h3>
                <p className="text-xs text-[#929292] mt-1">
                  Tell our developer partnership team about your project.
                </p>
              </div>

              {isSubmitted ? (
                <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-6 text-center space-y-2">
                  <Check className="h-8 w-8 text-emerald-400 mx-auto" />
                  <h4 className="text-sm font-bold text-white">Studio Pitch Received</h4>
                  <p className="text-xs text-[#929292]">
                    Our partner relations team will review your project and follow up within 48 hours.
                  </p>
                </div>
              ) : (
                <form onSubmit={handlePitchSubmit} className="space-y-4">
                  {pitchError && (
                    <div className="rounded-xl border border-[#FF263D]/40 bg-[#FF263D]/10 px-4 py-2.5 text-xs text-[#FF4054]">
                      {pitchError}
                    </div>
                  )}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-mono uppercase text-[#929292] mb-1">
                        Studio Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={pitchForm.studioName}
                        onChange={(e) => setPitchForm({ ...pitchForm, studioName: e.target.value })}
                        placeholder="Studio / Team Name"
                        className="w-full rounded-xl border border-[#292929] bg-[#181818] px-4 py-2.5 text-xs text-white focus:border-[#FF263D] outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-mono uppercase text-[#929292] mb-1">
                        Contact Email *
                      </label>
                      <input
                        type="email"
                        required
                        value={pitchForm.email}
                        onChange={(e) => setPitchForm({ ...pitchForm, email: e.target.value })}
                        placeholder="dev@studio.com"
                        className="w-full rounded-xl border border-[#292929] bg-[#181818] px-4 py-2.5 text-xs text-white focus:border-[#FF263D] outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-mono uppercase text-[#929292] mb-1">
                      Current Project Title
                    </label>
                    <input
                      type="text"
                      value={pitchForm.projectTitle}
                      onChange={(e) => setPitchForm({ ...pitchForm, projectTitle: e.target.value })}
                      placeholder="e.g. Project Odyssey"
                      className="w-full rounded-xl border border-[#292929] bg-[#181818] px-4 py-2.5 text-xs text-white focus:border-[#FF263D] outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono uppercase text-[#929292] mb-1">
                      Project Details & Pitch
                    </label>
                    <textarea
                      rows={3}
                      value={pitchForm.message}
                      onChange={(e) => setPitchForm({ ...pitchForm, message: e.target.value })}
                      placeholder="Game engine, target release window, gameplay summary, and playable build links..."
                      className="w-full rounded-xl border border-[#292929] bg-[#181818] p-3 text-xs text-white focus:border-[#FF263D] outline-none leading-relaxed"
                    />
                  </div>

                  <Button type="submit" variant="primary" className="w-full" disabled={isSubmittingPitch}>
                    <Send className="h-3.5 w-3.5 mr-2" />
                    <span>{isSubmittingPitch ? "Submitting Application..." : "Submit Studio Application"}</span>
                  </Button>
                </form>
              )}
            </div>
          </div>
        )}
      </main>

      {/* ─── 3. BOTTOM FOOTER ─────────────────────────────────── */}
      <SiteFooter />
    </div>
  );
}
