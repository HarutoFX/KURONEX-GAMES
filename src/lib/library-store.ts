import prisma from "./prisma";

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
  teamSize?: string;
  primaryEngine?: string;
  ownerUserId?: string;
}

function parseJsonStringArray(raw: string | null | undefined): string[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.map(String) : [];
  } catch {
    return [];
  }
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function resolveCategoryId(categoryName: string): Promise<string> {
  const target = (categoryName || "Action").trim();
  const categories = await prisma.gameCategory.findMany();
  const matched = categories.find((c) => c.name.toLowerCase() === target.toLowerCase());
  if (matched) return matched.id;

  const created = await prisma.gameCategory.create({
    data: {
      id: `cat_${slugify(target) || "custom"}`,
      slug: slugify(target) || "custom",
      name: target,
      displayOrder: categories.length + 1,
    },
  });
  return created.id;
}

export async function getLibraryGames(): Promise<LibraryGameSlot[]> {
  const slots = await prisma.libraryGameSlot.findMany({
    include: { category: { select: { name: true, displayOrder: true } } },
    orderBy: [{ category: { displayOrder: "asc" } }, { slotNumber: "asc" }],
  });

  return slots.map((s) => ({
    id: s.id,
    category: s.category?.name || "Action",
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
    tags: parseJsonStringArray(s.tags),
  }));
}

export async function updateLibraryGameSlot(updatedSlot: LibraryGameSlot): Promise<boolean> {
  try {
    const categoryId = await resolveCategoryId(updatedSlot.category);
    await prisma.libraryGameSlot.upsert({
      where: { id: updatedSlot.id },
      update: {
        categoryId,
        slotNumber: Number(updatedSlot.slotNumber) || 1,
        title: updatedSlot.title || "",
        tagline: updatedSlot.tagline || "",
        description: updatedSlot.description || "",
        coverImage: updatedSlot.coverImage || "",
        badge: updatedSlot.badge || "SLOT OPEN",
        accentColor: updatedSlot.accentColor || "#FF263D",
        progressPercent: Number(updatedSlot.progressPercent) || 0,
        developer: updatedSlot.developer || "",
        tags: JSON.stringify(Array.isArray(updatedSlot.tags) ? updatedSlot.tags : []),
        isEmpty: Boolean(updatedSlot.isEmpty),
      },
      create: {
        id: updatedSlot.id,
        categoryId,
        slotNumber: Number(updatedSlot.slotNumber) || 1,
        title: updatedSlot.title || "",
        tagline: updatedSlot.tagline || "",
        description: updatedSlot.description || "",
        coverImage: updatedSlot.coverImage || "",
        badge: updatedSlot.badge || "SLOT OPEN",
        accentColor: updatedSlot.accentColor || "#FF263D",
        progressPercent: Number(updatedSlot.progressPercent) || 0,
        developer: updatedSlot.developer || "",
        tags: JSON.stringify(Array.isArray(updatedSlot.tags) ? updatedSlot.tags : []),
        isEmpty: Boolean(updatedSlot.isEmpty),
      },
    });
    return true;
  } catch (error) {
    console.error("Failed to update library game slot:", error);
    return false;
  }
}

export async function saveLibraryGames(games: LibraryGameSlot[]): Promise<boolean> {
  try {
    for (const slot of games) {
      await updateLibraryGameSlot(slot);
    }
    return true;
  } catch (error) {
    console.error("Failed to save library games:", error);
    return false;
  }
}

export async function getDevelopers(): Promise<DeveloperPartner[]> {
  const devs = await prisma.developerStudio.findMany({
    orderBy: [{ partnerTier: "asc" }, { name: "asc" }],
  });

  return devs.map((d) => ({
    id: d.id,
    name: d.name,
    tagline: d.tagline || "",
    icon: d.icon,
    genre: d.genre,
    headquarters: d.headquarters,
    description: d.description,
    gamesCount: d.gamesCount,
    partnerTier: d.partnerTier as DeveloperPartner["partnerTier"],
    website: d.website || "",
    showInTicker: d.showInTicker,
    country: d.country ?? undefined,
    logo: d.logo ?? undefined,
    teamSize: d.teamSize ?? undefined,
    primaryEngine: d.primaryEngine ?? undefined,
    ownerUserId: d.ownerUserId ?? undefined,
  }));
}

export async function updateDeveloper(updatedDev: DeveloperPartner): Promise<boolean> {
  try {
    const slug = `${slugify(updatedDev.name || updatedDev.id) || updatedDev.id}-${updatedDev.id.slice(-4)}`;
    await prisma.developerStudio.upsert({
      where: { id: updatedDev.id },
      update: {
        name: updatedDev.name,
        tagline: updatedDev.tagline || "",
        icon: updatedDev.icon || "Sparkles",
        genre: updatedDev.genre || "Indie",
        headquarters: updatedDev.headquarters || "Global",
        country: updatedDev.country ?? null,
        logo: updatedDev.logo ?? null,
        teamSize: updatedDev.teamSize ?? null,
        primaryEngine: updatedDev.primaryEngine ?? null,
        ownerUserId: updatedDev.ownerUserId ?? null,
        description: updatedDev.description || "",
        gamesCount: Number(updatedDev.gamesCount) || 0,
        partnerTier: updatedDev.partnerTier || "Studio Partner",
        website: updatedDev.website || "",
        showInTicker: Boolean(updatedDev.showInTicker),
      },
      create: {
        id: updatedDev.id,
        slug,
        name: updatedDev.name,
        tagline: updatedDev.tagline || "",
        icon: updatedDev.icon || "Sparkles",
        genre: updatedDev.genre || "Indie",
        headquarters: updatedDev.headquarters || "Global",
        country: updatedDev.country ?? null,
        logo: updatedDev.logo ?? null,
        teamSize: updatedDev.teamSize ?? null,
        primaryEngine: updatedDev.primaryEngine ?? null,
        ownerUserId: updatedDev.ownerUserId ?? null,
        description: updatedDev.description || "",
        gamesCount: Number(updatedDev.gamesCount) || 0,
        partnerTier: updatedDev.partnerTier || "Studio Partner",
        website: updatedDev.website || "",
        showInTicker: Boolean(updatedDev.showInTicker),
      },
    });
    return true;
  } catch (error) {
    console.error("Failed to update developer studio:", error);
    return false;
  }
}

export async function saveDevelopers(devs: DeveloperPartner[]): Promise<boolean> {
  try {
    const existing = await prisma.developerStudio.findMany({ select: { id: true } });
    const incomingIds = new Set(devs.map((d) => d.id));
    const toDelete = existing.filter((e) => !incomingIds.has(e.id)).map((e) => e.id);

    if (toDelete.length > 0) {
      await prisma.developerStudio.deleteMany({
        where: { id: { in: toDelete } },
      });
    }

    for (const dev of devs) {
      await updateDeveloper(dev);
    }
    return true;
  } catch (error) {
    console.error("Failed to save developers:", error);
    return false;
  }
}
