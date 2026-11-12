import prisma from "@/lib/prisma";
import {
  getLibraryGames,
  updateLibraryGameSlot,
  getDevelopers,
  updateDeveloper,
} from "@/lib/library-store";
import { GAMES_DATA, Game } from "@/lib/games";
import { DbLibrarySlot, DbDeveloperStudio } from "./types";

export const GamesRepository = {
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
    return GAMES_DATA.find((g) => g.id === id) || null;
  },

  async getLibrarySlots(category?: string): Promise<DbLibrarySlot[]> {
    const slots = await getLibraryGames();
    const mapped: DbLibrarySlot[] = slots.map((s) => ({
      id: s.id,
      category: s.category,
      slotNumber: s.slotNumber,
      title: s.title,
      tagline: s.tagline,
      description: s.description,
      coverImage: s.coverImage,
      badge: s.badge,
      accentColor: s.accentColor,
      progressPercent: s.progressPercent,
      developer: s.developer,
      isEmpty: s.isEmpty,
      updatedAt: new Date().toISOString(),
    }));

    if (category && category !== "All") {
      const catLower = category.toLowerCase();
      return mapped.filter((s) => s.category.toLowerCase() === catLower);
    }
    return mapped;
  },

  async updateLibrarySlot(updatedSlot: DbLibrarySlot): Promise<DbLibrarySlot> {
    await updateLibraryGameSlot(updatedSlot);
    return { ...updatedSlot, updatedAt: new Date().toISOString() };
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
    await updateLibraryGameSlot(cleared);
    return cleared;
  },

  async getDevelopers(tier?: string): Promise<DbDeveloperStudio[]> {
    const devs = await getDevelopers();
    const mapped: DbDeveloperStudio[] = devs.map((d) => ({
      id: d.id,
      slug: d.name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      name: d.name,
      tagline: d.tagline,
      icon: d.icon,
      genre: d.genre,
      headquarters: d.headquarters,
      description: d.description,
      gamesCount: d.gamesCount,
      partnerTier: d.partnerTier,
      website: d.website,
      showInTicker: d.showInTicker,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }));
    if (tier && tier !== "All") {
      return mapped.filter((d) => d.partnerTier === tier);
    }
    return mapped;
  },

  async getDeveloperById(id: string): Promise<DbDeveloperStudio | null> {
    const devs = await this.getDevelopers();
    return devs.find((d) => d.id === id) || null;
  },

  async updateDeveloper(dev: DbDeveloperStudio): Promise<DbDeveloperStudio> {
    await updateDeveloper({
      id: dev.id,
      name: dev.name,
      tagline: dev.tagline || "",
      icon: dev.icon,
      genre: dev.genre,
      headquarters: dev.headquarters,
      description: dev.description,
      gamesCount: dev.gamesCount,
      partnerTier: dev.partnerTier,
      website: dev.website || "",
      showInTicker: dev.showInTicker,
    });
    return { ...dev, updatedAt: new Date().toISOString() };
  },

  async deleteDeveloper(id: string): Promise<boolean> {
    try {
      await prisma.developerStudio.delete({ where: { id } });
      return true;
    } catch {
      return false;
    }
  },
};
