/**
 * KURONEX GAMES — Games Service
 */

import { apiClient } from "./api-client";
import { GameSlotDto } from "./types";

export interface GamesListResponse {
  games: GameSlotDto[];
  count: number;
}

export const gamesService = {
  async getGames(category?: string): Promise<GameSlotDto[]> {
    const data = await apiClient<GamesListResponse>("/library-games", {
      params: category && category !== "All" ? { category } : undefined,
    });
    return data.games || [];
  },

  async getGameById(id: string): Promise<GameSlotDto | null> {
    const games = await this.getGames();
    return games.find((g) => g.id === id) || null;
  },

  async toggleLibrarySlot(slot: GameSlotDto, adminKey?: string): Promise<{ success: boolean; slot?: GameSlotDto }> {
    return apiClient<{ success: boolean; slot: GameSlotDto }>("/admin/games", {
      method: "POST",
      headers: adminKey ? { "x-admin-key": adminKey } : undefined,
      body: JSON.stringify(slot),
    });
  },

  async toggleUserVault(gameId: string): Promise<{ success: boolean; inLibrary: boolean }> {
    return apiClient<{ success: boolean; inLibrary: boolean }>("/user/library", {
      method: "POST",
      body: JSON.stringify({ gameId }),
    });
  },
};

