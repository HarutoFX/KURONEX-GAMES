/**
 * KURONEX GAMES — Developer & Studio Portal Service
 */

import { apiClient, ApiError } from "./api-client";
import { DeveloperPartnerDto, DeveloperSubmissionDto, ClientBuildDto } from "./types";

export interface DevelopersListResponse {
  developers: DeveloperPartnerDto[];
  count: number;
}

export interface StudioProfileDto {
  id?: string;
  studioName: string;
  tagline: string;
  headquarters: string;
  website: string;
  teamSize: string;
  primaryEngine: string;
  bio: string;
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
    });
  },

  async getStudioPortalOverview(): Promise<{ submissions: DeveloperSubmissionDto[]; vaultAdds: number }> {
    try {
      const res = await apiClient<{ submissions: DeveloperSubmissionDto[]; vaultAdds?: number }>(
        "/developer/submissions"
      );
      return {
        submissions: res.submissions || [],
        vaultAdds: typeof res.vaultAdds === "number" ? res.vaultAdds : 0,
      };
    } catch (err) {
      if (err instanceof ApiError && (err.status === 401 || err.status === 403)) {
        return { submissions: [], vaultAdds: 0 };
      }
      throw err;
    }
  },

  async getStudioSubmissions(): Promise<DeveloperSubmissionDto[]> {
    const overview = await this.getStudioPortalOverview();
    return overview.submissions;
  },

  async submitGameForReview(
    submission: Partial<DeveloperSubmissionDto>
  ): Promise<{ success: boolean; submission: DeveloperSubmissionDto }> {
    return apiClient<{ success: boolean; submission: DeveloperSubmissionDto }>(
      "/developer/submissions",
      {
        method: "POST",
        body: JSON.stringify(submission),
      }
    );
  },

  async getStudioBuilds(): Promise<ClientBuildDto[]> {
    try {
      const res = await apiClient<{ builds: ClientBuildDto[] }>("/developer/builds");
      return res.builds || [];
    } catch (err) {
      if (err instanceof ApiError && (err.status === 401 || err.status === 403)) {
        return [];
      }
      throw err;
    }
  },

  async registerBuild(
    build: Partial<ClientBuildDto>
  ): Promise<{ success: boolean; build: ClientBuildDto }> {
    return apiClient<{ success: boolean; build: ClientBuildDto }>("/developer/builds", {
      method: "POST",
      body: JSON.stringify(build),
    });
  },

  async getStudioProfile(): Promise<StudioProfileDto | null> {
    try {
      const res = await apiClient<{ profile: StudioProfileDto }>("/developer/profile");
      return res.profile || null;
    } catch (err) {
      if (err instanceof ApiError && (err.status === 401 || err.status === 403)) {
        return null;
      }
      throw err;
    }
  },

  async updateStudioProfile(
    profile: StudioProfileDto
  ): Promise<{ success: boolean; profile: StudioProfileDto }> {
    return apiClient<{ success: boolean; profile: StudioProfileDto }>("/developer/profile", {
      method: "PUT",
      body: JSON.stringify(profile),
    });
  },
};
