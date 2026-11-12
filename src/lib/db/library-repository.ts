import {
  getUserLibrary,
  updateUserLibrary,
  getGameLibraryStats,
} from "@/lib/auth";

export const LibraryRepository = {
  async getUserLibrary(userId: string): Promise<string[]> {
    return getUserLibrary(userId);
  },

  async addToLibrary(userId: string, gameId: string): Promise<string[]> {
    return updateUserLibrary(userId, gameId, "add");
  },

  async removeFromLibrary(userId: string, gameId: string): Promise<string[]> {
    return updateUserLibrary(userId, gameId, "remove");
  },

  async toggleLibrary(
    userId: string,
    gameId: string
  ): Promise<{ inLibrary: boolean; library: string[] }> {
    const before = await getUserLibrary(userId);
    const library = await updateUserLibrary(userId, gameId, "toggle");
    return {
      inLibrary: !before.includes(gameId.trim()),
      library,
    };
  },

  async getGameLibraryStats(): Promise<Record<string, number>> {
    return getGameLibraryStats();
  },
};
