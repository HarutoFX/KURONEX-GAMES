import path from "path";
import { DbUser } from "./types";
import { safeReadJsonSync, atomicWriteJsonSync } from "./atomic-store";

const USERS_FILE = path.join(process.cwd(), "src", "data", "users.json");

interface UserWithLibrary extends DbUser {
  library?: string[];
}

function readUsers(): UserWithLibrary[] {
  return safeReadJsonSync<UserWithLibrary[]>(USERS_FILE, []);
}

function writeUsers(users: UserWithLibrary[]): void {
  atomicWriteJsonSync(USERS_FILE, users);
}

export const LibraryRepository = {
  async getUserLibrary(userId: string): Promise<string[]> {
    const users = readUsers();
    const user = users.find((u) => u.id === userId);
    return user?.library || [];
  },

  async addToLibrary(userId: string, gameId: string): Promise<string[]> {
    const cleanGameId = gameId.trim();
    if (!cleanGameId) return [];

    const users = readUsers();
    const userIndex = users.findIndex((u) => u.id === userId);
    if (userIndex === -1) return [];

    const currentLib = users[userIndex].library || [];
    // Strict duplicate prevention
    if (!currentLib.includes(cleanGameId)) {
      users[userIndex].library = [...currentLib, cleanGameId];
      users[userIndex].updatedAt = new Date().toISOString();
      writeUsers(users);
      return users[userIndex].library;
    }

    return currentLib;
  },

  async removeFromLibrary(userId: string, gameId: string): Promise<string[]> {
    const cleanGameId = gameId.trim();
    const users = readUsers();
    const userIndex = users.findIndex((u) => u.id === userId);
    if (userIndex === -1) return [];

    const currentLib = users[userIndex].library || [];
    users[userIndex].library = currentLib.filter((id) => id !== cleanGameId);
    users[userIndex].updatedAt = new Date().toISOString();
    writeUsers(users);

    return users[userIndex].library;
  },

  async toggleLibrary(
    userId: string,
    gameId: string
  ): Promise<{ inLibrary: boolean; library: string[] }> {
    const cleanGameId = gameId.trim();
    const users = readUsers();
    const userIndex = users.findIndex((u) => u.id === userId);
    if (userIndex === -1) return { inLibrary: false, library: [] };

    const currentLib = users[userIndex].library || [];
    const exists = currentLib.includes(cleanGameId);

    let updatedLib: string[];
    if (exists) {
      updatedLib = currentLib.filter((id) => id !== cleanGameId);
    } else {
      updatedLib = [...currentLib, cleanGameId];
    }

    users[userIndex].library = updatedLib;
    users[userIndex].updatedAt = new Date().toISOString();
    writeUsers(users);

    return {
      inLibrary: !exists,
      library: updatedLib,
    };
  },

  async getGameLibraryStats(): Promise<Record<string, number>> {
    const users = readUsers();
    const counts: Record<string, number> = {};

    for (const u of users) {
      if (Array.isArray(u.library)) {
        for (const gameId of u.library) {
          counts[gameId] = (counts[gameId] || 0) + 1;
        }
      }
    }

    return counts;
  },
};

