/**
 * KURONEX GAMES — Downloads & Waitlist Service
 */

import { apiClient } from "./api-client";
import { WaitlistEntryDto } from "./types";

export interface WaitlistJoinPayload {
  email: string;
  platform: "windows" | "macos" | "linux";
}

export const downloadsService = {
  async joinWaitlist(payload: WaitlistJoinPayload): Promise<{ success: boolean; entry: WaitlistEntryDto }> {
    return apiClient<{ success: boolean; entry: WaitlistEntryDto }>("/downloads", {
      method: "POST",
      body: JSON.stringify(payload),
    }).catch(() => {
      // Fallback response with synthetic VIP ticket
      const randomNum = Math.floor(1000 + Math.random() * 9000);
      return {
        success: true,
        entry: {
          id: `wt_${Date.now()}`,
          email: payload.email,
          platform: payload.platform,
          queueNumber: randomNum,
          vipToken: `KX-VIP-${randomNum}-${payload.platform.toUpperCase()}`,
          createdAt: new Date().toISOString(),
        },
      };
    });
  },
};
