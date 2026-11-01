import path from "path";
import { DbLibrarySlot, DbDeveloperStudio } from "./types";
import { safeReadJsonSync, atomicWriteJsonSync } from "./atomic-store";
import { GAMES_DATA, Game } from "@/lib/games";

const LIBRARY_FILE = path.join(process.cwd(), "src", "data", "library-games.json");
const DEVELOPERS_FILE = path.join(process.cwd(), "src", "data", "developers.json");

function readLibrarySlots(): DbLibrarySlot[] {
  return safeReadJsonSync<DbLibrarySlot[]>(LIBRARY_FILE, []);
}

function writeLibrarySlots(slots: DbLibrarySlot[]): void {
  atomicWriteJsonSync(LIBRARY_FILE, slots);
}

function readDevelopers(): DbDeveloperStudio[] {
  return safeReadJsonSync<DbDeveloperStudio[]>(DEVELOPERS_FILE, []);
}

function writeDevelopers(devs: DbDeveloperStudio[]): void {
  atomicWriteJsonSync(DEVELOPERS_FILE, devs);
}

export const GamesRepository = {
  // ─── CATALOGUE GAMES ──────────────────────────────────────────────────────
  async getCatalogueGames(params?: {
    category?: string;
    query?: string;
    page?: number;
    limit?: number;
  }): Promise<{ games: Game[]; total: number }> {
    let list = [...GAMES_DATA];

    if (params?.category && params.category !== "All") {
      const catLower = params.category.toLowerCase();
      list = list.filter((g) => g.category.toLowerCase() === catLower);
    }

    if (params?.query) {
      const q = params.query.toLowerCase();
      list = list.filter(
        (g) =>
          g.title.toLowerCase().includes(q) ||
          g.developer.toLowerCase().includes(q) ||
          g.genre.toLowerCase().includes(q) ||
          g.projectCode.toLowerCase().includes(q)
      );
    }

    const total = list.length;
    const page = params?.page || 1;
    const limit = params?.limit || total;
    const skip = (page - 1) * limit;

    return {
      games: list.slice(skip, skip + limit),
      total,
    };
  },

  async getGameById(id: string): Promise<Game | null> {
    const game = GAMES_DATA.find((g) => g.id === id);
    return game || null;
  },

  // ─── CARTRIDGE VAULT SLOTS ────────────────────────────────────────────────
  async getLibrarySlots(category?: string): Promise<DbLibrarySlot[]> {
    const slots = readLibrarySlots();
    if (category && category !== "All") {
      const catLower = category.toLowerCase();
      return slots.filter((s) => s.category.toLowerCase() === catLower);
    }
    return slots;
  },

  async updateLibrarySlot(updatedSlot: DbLibrarySlot): Promise<DbLibrarySlot> {
    const slots = readLibrarySlots();
    const index = slots.findIndex((s) => s.id === updatedSlot.id);

    const slotToSave = {
      ...updatedSlot,
      updatedAt: new Date().toISOString(),
    };

    if (index !== -1) {
      slots[index] = slotToSave;
    } else {
      slots.push(slotToSave);
    }

    writeLibrarySlots(slots);
    return slotToSave;
  },

  async clearLibrarySlot(slotId: string, category: string): Promise<DbLibrarySlot> {
    const cleared: DbLibrarySlot = {
      id: slotId,
      category,
      slotNumber: parseInt(slotId.split("-")[1] || "1", 10),
      title: "",
      tagline: "",
      description: "",
      coverImage: "",
      badge: "SLOT OPEN",
      accentColor: "#FF263D",
      progressPercent: 0,
      developer: "",
      isEmpty: true,
      updatedAt: new Date().toISOString(),
    };

    return this.updateLibrarySlot(cleared);
  },

  // ─── DEVELOPER PARTNER STUDIOS ────────────────────────────────────────────
  async getDevelopers(tier?: string): Promise<DbDeveloperStudio[]> {
    const devs = readDevelopers();
    if (tier && tier !== "All") {
      return devs.filter((d) => d.partnerTier === tier);
    }
    return devs;
  },

  async getDeveloperById(id: string): Promise<DbDeveloperStudio | null> {
    const devs = readDevelopers();
    return devs.find((d) => d.id === id) || null;
  },

  async updateDeveloper(dev: DbDeveloperStudio): Promise<DbDeveloperStudio> {
    const devs = readDevelopers();
    const index = devs.findIndex((d) => d.id === dev.id);

    const devToSave = {
      ...dev,
      updatedAt: new Date().toISOString(),
    };

    if (index !== -1) {
      devs[index] = devToSave;
    } else {
      devs.push(devToSave);
    }

    writeDevelopers(devs);
    return devToSave;
  },

  async deleteDeveloper(id: string): Promise<boolean> {
    const devs = readDevelopers();
    const filtered = devs.filter((d) => d.id !== id);
    if (filtered.length === devs.length) return false;

    writeDevelopers(filtered);
    return true;
  },
};

