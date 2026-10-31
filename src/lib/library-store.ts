import fs from "fs";
import path from "path";

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
}

const GAMES_FILE = path.join(process.cwd(), "src", "data", "library-games.json");
const DEVELOPERS_FILE = path.join(process.cwd(), "src", "data", "developers.json");

function ensureFile(filePath: string, defaultContent: string) {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, defaultContent, "utf-8");
  }
}

export function getLibraryGames(): LibraryGameSlot[] {
  try {
    ensureFile(GAMES_FILE, "[]");
    const data = fs.readFileSync(GAMES_FILE, "utf-8");
    return JSON.parse(data || "[]");
  } catch (error) {
    console.error("Failed to read library games:", error);
    return [];
  }
}

export function saveLibraryGames(games: LibraryGameSlot[]): boolean {
  try {
    ensureFile(GAMES_FILE, "[]");
    fs.writeFileSync(GAMES_FILE, JSON.stringify(games, null, 2), "utf-8");
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
  try {
    ensureFile(DEVELOPERS_FILE, "[]");
    const data = fs.readFileSync(DEVELOPERS_FILE, "utf-8");
    return JSON.parse(data || "[]");
  } catch (error) {
    console.error("Failed to read developers:", error);
    return [];
  }
}

export function saveDevelopers(devs: DeveloperPartner[]): boolean {
  try {
    ensureFile(DEVELOPERS_FILE, "[]");
    fs.writeFileSync(DEVELOPERS_FILE, JSON.stringify(devs, null, 2), "utf-8");
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

