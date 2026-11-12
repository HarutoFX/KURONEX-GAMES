/**
 * KURONEX GAMES — Downloads & Waitlist Service
 */

import { apiClient } from "./api-client";
import { WaitlistEntryDto } from "./types";

export interface WaitlistJoinPayload {
  email: string;
  platform: "windows" | "macos" | "linux";
  source?: "download" | "discover";
}

export const downloadsService = {
  async joinWaitlist(
    payload: WaitlistJoinPayload
  ): Promise<{ success: boolean; alreadyRegistered?: boolean; entry: WaitlistEntryDto }> {
    return apiClient<{ success: boolean; alreadyRegistered?: boolean; entry: WaitlistEntryDto }>(
      "/waitlist",
      {
        method: "POST",
        body: JSON.stringify(payload),
      }
    );
  },
};
