/**
 * KURONEX GAMES — Developer & Studio Portal Service
 */

import { apiClient } from "./api-client";
import { DeveloperPartnerDto, DeveloperSubmissionDto, ClientBuildDto } from "./types";

export interface DevelopersListResponse {
  developers: DeveloperPartnerDto[];
  count: number;
}

export const developersService = {
  async getDevelopers(tier?: string): Promise<DeveloperPartnerDto[]> {
    const data = await apiClient<DevelopersListResponse>("/developers", {
      params: tier && tier !== "All" ? { tier } : undefined,
    });
    return data.developers || [];
  },

  async submitPitch(data: {
    studioName: string;
    email: string;
    projectTitle: string;
    message: string;
  }): Promise<{ success: boolean; message: string }> {
    return apiClient<{ success: boolean; message: string }>("/developers/pitch", {
      method: "POST",
      body: JSON.stringify(data),
    }).catch(() => {
      // Fallback for mock preview
      return { success: true, message: "Studio application received. Our review team will reach out." };
    });
  },

  async getStudioSubmissions(): Promise<DeveloperSubmissionDto[]> {
    return apiClient<{ submissions: DeveloperSubmissionDto[] }>("/developer/submissions")
      .then((res) => res.submissions || [])
      .catch(() => {
        // Fallback demo data for developer studio preview
        return [
          {
            id: "sub_frostbound_omega",
            studioName: "Kuronex Studios",
            contactEmail: "lead@frostbound.dev",
            title: "Frostbound: Omega",
            category: "Action",
            targetEngine: "Unreal Engine 5.4",
            targetOs: ["Windows", "Linux"],
            readinessPercent: 88,
            coverImageUrl: "/images/frostbound.jpg",
            status: "Approved",
            pitchSummary: "Hardcore survival action in a frozen neo-cyber wasteland. Native Vulkan pipeline.",
            submittedAt: "2026-10-24T14:20:00.000Z",
            clientArtifact: {
              binaryName: "frostbound_client_x64.exe",
              versionTag: "v0.8.4-alpha",
              channel: "Alpha",
            },
          },
          {
            id: "sub_voidstrike_recon",
            studioName: "Void Interactive Labs",
            contactEmail: "ops@voidstrike.gg",
            title: "Voidstrike: Recon",
            category: "Sci-Fi",
            targetEngine: "Custom C++23 Vulkan Engine",
            targetOs: ["Windows"],
            readinessPercent: 94,
            coverImageUrl: "/images/voidstrike.jpg",
            status: "Published",
            pitchSummary: "Zero-latency 6v6 extraction shooter with deterministic client prediction.",
            submittedAt: "2026-10-28T09:12:00.000Z",
            clientArtifact: {
              binaryName: "voidstrike_win64.exe",
              versionTag: "v1.0.0-rc3",
              channel: "Release",
            },
          },
        ];
      });
  },

  async submitGameForReview(submission: Partial<DeveloperSubmissionDto>): Promise<{ success: boolean; submission: DeveloperSubmissionDto }> {
    return apiClient<{ success: boolean; submission: DeveloperSubmissionDto }>("/developer/submissions", {
      method: "POST",
      body: JSON.stringify(submission),
    }).catch(() => {
      const mockSub: DeveloperSubmissionDto = {
        id: `sub_${Date.now()}`,
        studioName: submission.studioName || "My Studio",
        contactEmail: submission.contactEmail || "studio@kuronex.dev",
        title: submission.title || "Untitled Game",
        category: submission.category || "Action",
        targetEngine: submission.targetEngine || "Unreal Engine 5",
        targetOs: submission.targetOs || ["Windows"],
        readinessPercent: submission.readinessPercent || 50,
        coverImageUrl: submission.coverImageUrl || "/images/neon_haven.jpg",
        status: "In Review",
        pitchSummary: submission.pitchSummary || "Desktop client submission.",
        submittedAt: new Date().toISOString(),
      };
      return { success: true, submission: mockSub };
    });
  },

  async getStudioBuilds(): Promise<ClientBuildDto[]> {
    return apiClient<{ builds: ClientBuildDto[] }>("/developer/builds")
      .then((res) => res.builds || [])
      .catch(() => {
        return [
          {
            id: "bld_kx_091",
            gameTitle: "Voidstrike: Recon",
            versionTag: "v1.0.0-rc3",
            channel: "Release",
            targetOs: "Windows (DirectX 12)",
            executableName: "voidstrike_win64.exe",
            buildSizeBytes: 42949672960, // 40 GB
            sha256Hash: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
            releaseNotes: "Optimized Vulkan shader pipeline and integrated Kuronex Client overlay.",
            releasedAt: "2026-10-29T18:00:00.000Z",
            status: "Active",
          },
          {
            id: "bld_kx_090",
            gameTitle: "Frostbound: Omega",
            versionTag: "v0.8.4-alpha",
            channel: "Alpha",
            targetOs: "Linux (Vulkan)",
            executableName: "frostbound_linux_x86_64",
            buildSizeBytes: 26843545600, // 25 GB
            sha256Hash: "8f434346648f6b96df89dda901c5176b10a6d83961dd3c1ac88b59b2dc327aa4",
            releaseNotes: "Native Linux Flatpak build with Proton DXVK fallback disabled.",
            releasedAt: "2026-10-25T11:30:00.000Z",
            status: "Active",
          },
        ];
      });
  },
};
