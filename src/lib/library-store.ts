import path from "path";
import { atomicWriteJsonSync, safeReadJsonSync } from "@/lib/db/atomic-store";

export interface LibraryGameSlot {
  id: string;
  category: string;
  slotNumber: number;
  title: string;
  tagline: string;
  description: string;
  coverImage: string;
  badge: string;
  accentColor: string;
  progressPercent: number;
  developer: string;
  isEmpty: boolean;
  tags?: string[];
}

export interface DeveloperPartner {
  id: string;
  name: string;
  tagline: string;
  icon: string;
  genre: string;
  headquarters: string;
  description: string;
  gamesCount: number;
  partnerTier: "Premier Partner" | "Studio Partner" | "Indie Pioneer";
  website: string;
  showInTicker: boolean;
  country?: string;
  logo?: string;
}

const GAMES_FILE = path.join(process.cwd(), "src", "data", "library-games.json");
const DEVELOPERS_FILE = path.join(process.cwd(), "src", "data", "developers.json");

export function getLibraryGames(): LibraryGameSlot[] {
  return safeReadJsonSync<LibraryGameSlot[]>(GAMES_FILE, []);
}

export function saveLibraryGames(games: LibraryGameSlot[]): boolean {
  try {
    atomicWriteJsonSync(GAMES_FILE, games);
    return true;
  } catch (error) {
    console.error("Failed to write library games:", error);
    return false;
  }
}

export function updateLibraryGameSlot(updatedSlot: LibraryGameSlot): boolean {
  const games = getLibraryGames();
  const index = games.findIndex((g) => g.id === updatedSlot.id);
  if (index !== -1) {
    games[index] = updatedSlot;
  } else {
    games.push(updatedSlot);
  }
  return saveLibraryGames(games);
}

export function getDevelopers(): DeveloperPartner[] {
  return safeReadJsonSync<DeveloperPartner[]>(DEVELOPERS_FILE, []);
}

export function saveDevelopers(devs: DeveloperPartner[]): boolean {
  try {
    atomicWriteJsonSync(DEVELOPERS_FILE, devs);
    return true;
  } catch (error) {
    console.error("Failed to write developers:", error);
    return false;
  }
}

export function updateDeveloper(updatedDev: DeveloperPartner): boolean {
  const devs = getDevelopers();
  const index = devs.findIndex((d) => d.id === updatedDev.id);
  if (index !== -1) {
    devs[index] = updatedDev;
  } else {
    devs.push(updatedDev);
  }
  return saveDevelopers(devs);
}

