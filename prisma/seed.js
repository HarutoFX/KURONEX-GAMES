/* eslint-disable @typescript-eslint/no-require-imports */
/**
 * KURONEX GAMES — Idempotent Prisma Database Seed
 * Populates roles, permissions, categories, studios, games, vault slots,
 * users, announcements, settings, audit logs, builds, and promotions into SQLite/PostgreSQL.
 */

const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

function readJsonSafe(filePath, fallback) {
  try {
    if (!fs.existsSync(filePath)) return fallback;
    const raw = fs.readFileSync(filePath, "utf-8");
    const parsed = JSON.parse(raw || "null");
    return parsed ?? fallback;
  } catch (err) {
    console.warn(`[SEED WARN] Could not parse ${filePath}:`, err.message);
    return fallback;
  }
}

function slugify(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.scryptSync(password, salt, 64).toString("hex");
  return { hash, salt };
}

const ROLE_DEFINITIONS = [
  { id: "role_super_admin", name: "SUPER_ADMIN", description: "Unrestricted root platform authority" },
  { id: "role_admin", name: "ADMIN", description: "Platform administrator" },
  { id: "role_moderator", name: "MODERATOR", description: "Community and user moderation" },
  { id: "role_game_manager", name: "GAME_MANAGER", description: "Catalogue and slot curation" },
  { id: "role_content_manager", name: "CONTENT_MANAGER", description: "Announcements, studios, and promotions" },
  { id: "role_analyst", name: "ANALYST", description: "Read-only telemetry, downloads, and audit logs" },
  { id: "role_developer", name: "DEVELOPER", description: "Partner studio portal operator" },
  { id: "role_player", name: "PLAYER", description: "Standard storefront player" },
];

const ROLE_PERMISSION_MAP = {
  SUPER_ADMIN: ["*"],
  ADMIN: [
    "system:settings:write",
    "system:audit:read",
    "users:read",
    "users:roles:write",
    "users:delete",
    "users:suspend",
    "games:read",
    "games:write",
    "games:slots:write",
    "developers:read",
    "developers:write",
    "announcements:read",
    "announcements:write",
    "promotions:write",
    "analytics:read",
    "downloads:read",
    "reviews:read",
    "reviews:moderate",
    "library:manage",
  ],
  MODERATOR: [
    "users:read",
    "users:suspend",
    "announcements:read",
    "reviews:read",
    "reviews:moderate",
    "library:manage",
  ],
  GAME_MANAGER: [
    "games:read",
    "games:write",
    "games:slots:write",
    "developers:read",
    "library:manage",
  ],
  CONTENT_MANAGER: [
    "announcements:read",
    "announcements:write",
    "developers:read",
    "developers:write",
    "promotions:write",
    "games:read",
    "library:manage",
  ],
  ANALYST: [
    "analytics:read",
    "downloads:read",
    "system:audit:read",
    "users:read",
    "games:read",
    "library:manage",
  ],
  DEVELOPER: ["games:read", "developers:read", "library:manage"],
  PLAYER: ["library:manage", "reviews:read"],
};

const CATEGORIES = [
  { id: "cat_action", slug: "action", name: "Action", description: "High-intensity combat and movement titles", displayOrder: 1 },
  { id: "cat_rpg", slug: "rpg", name: "RPG", description: "Deep role-playing worlds and progression systems", displayOrder: 2 },
  { id: "cat_scifi", slug: "sci-fi", name: "Sci-Fi", description: "Futuristic universes and speculative mechanics", displayOrder: 3 },
  { id: "cat_strategy", slug: "strategy", name: "Strategy", description: "Tactical infiltration and grand command", displayOrder: 4 },
  { id: "cat_survival", slug: "survival", name: "Survival", description: "Harsh environments and resource mastery", displayOrder: 5 },
  { id: "cat_shooter", slug: "shooter", name: "Shooter", description: "Precision gunplay and extraction operations", displayOrder: 6 },
];

const STATIC_GAMES = [
  {
    id: "neon-haven",
    projectCode: "KX-01",
    title: "Neon Haven",
    tagline: "Overdrive Protocol",
    genre: "Cyberpunk Action RPG",
    category: "Action",
    phase: "Public Beta",
    statusBadge: "FEATURED",
    accentColor: "#FF263D",
    description:
      "Navigate an ultra-dense dystopian megacity. Hack cyberware implants, execute high-speed parkour maneuvers, and dismantle rogue AI megacorporations.",
    progressPercent: 94,
    coverImage: "/images/neon_haven.jpg",
    platforms: ["Windows", "Linux", "Web"],
    storageSize: "28.4 GB",
    developer: "Kuronex Studios",
    price: "Free to Play",
    featured: true,
  },
  {
    id: "voidstrike",
    projectCode: "KX-02",
    title: "Voidstrike: Infinite",
    tagline: "Deep Void Tactical Combat",
    genre: "Space Combat Roguelite",
    category: "Shooter",
    phase: "Early Access",
    statusBadge: "TRENDING",
    accentColor: "#00E5FF",
    description:
      "Pilot high-agility interceptors through fractured wormholes. Customize modular kinetic cannons and survive unstable quantum anomalies.",
    progressPercent: 88,
    coverImage: "/images/voidstrike.jpg",
    platforms: ["Windows", "macOS", "Linux"],
    storageSize: "16.8 GB",
    developer: "Aether Dynamics",
    price: "$24.99",
    featured: true,
  },
  {
    id: "frostbound",
    projectCode: "KX-03",
    title: "Frostbound",
    tagline: "Absolute Zero Survival",
    genre: "Glacial Survival RPG",
    category: "Survival",
    phase: "Alpha Playtest",
    statusBadge: "PLAYTEST",
    accentColor: "#38BDF8",
    description:
      "Braving perpetual blizzard wastelands where every heat source is vital. Build geothermal outposts and research forgotten cryo-technology.",
    progressPercent: 79,
    coverImage: "/images/frostbound.jpg",
    platforms: ["Windows", "Linux"],
    storageSize: "22.1 GB",
    developer: "SubZero Interactive",
    price: "$29.99",
    featured: false,
  },
  {
    id: "nightfall-realms",
    projectCode: "KX-04",
    title: "Nightfall Realms",
    tagline: "The Shattered Eclipse",
    genre: "Dark Fantasy Souls-like",
    category: "RPG",
    phase: "Closed Beta",
    statusBadge: "UPCOMING",
    accentColor: "#A855F7",
    description:
      "Wield ancient runic sorcery against corrupted primordial deities in an decaying gothic kingdom devoid of daylight.",
    progressPercent: 86,
    coverImage: "/images/nightfall_realms.jpg",
    platforms: ["Windows", "Linux"],
    storageSize: "44.6 GB",
    developer: "Shadowfall Works",
    price: "$39.99",
    featured: true,
  },
  {
    id: "project-kaiju",
    projectCode: "KX-05",
    title: "Project Kaiju",
    tagline: "Colossal Mech Defense",
    genre: "Mech Action Simulator",
    category: "Action",
    phase: "Technical Alpha",
    statusBadge: "IN DEV",
    accentColor: "#F59E0B",
    description:
      "Command 60-meter bipedal mechanized titans defending Pacific megastructures against gargantuan biological leviathans.",
    progressPercent: 72,
    coverImage: "/images/project_kaiju.jpg",
    platforms: ["Windows"],
    storageSize: "36.2 GB",
    developer: "Ironclad Collective",
    price: "TBA",
    featured: false,
  },
  {
    id: "echoes-of-solara",
    projectCode: "KX-06",
    title: "Echoes of Solara",
    tagline: "Chronos Unbound",
    genre: "Sci-Fi Time-Dilation Adventure",
    category: "Sci-Fi",
    phase: "Alpha Playtest",
    statusBadge: "PLAYTEST",
    accentColor: "#10B981",
    description:
      "Manipulate localized causality and temporal paradoxes to solve orbital Dyson swarm failures across multiple timelines.",
    progressPercent: 82,
    coverImage: "/images/echoes_of_solara.jpg",
    platforms: ["Windows", "macOS", "Web"],
    storageSize: "12.4 GB",
    developer: "Singularity Media",
    price: "$19.99",
    featured: false,
  },
  {
    id: "twin-ashes",
    projectCode: "KX-07",
    title: "Twin Ashes",
    tagline: "Cooperative Breach & Clear",
    genre: "Tactical Extraction Shooter",
    category: "Shooter",
    phase: "Public Release",
    statusBadge: "AVAILABLE",
    accentColor: "#EF4444",
    description:
      "High-stakes squad operations in radioactive quarantine zones. Coordinate breach points, rescue survivors, and extract before orbital strikes.",
    progressPercent: 100,
    coverImage: "/images/twin_ashes.jpg",
    platforms: ["Windows", "Linux"],
    storageSize: "32.0 GB",
    developer: "Apex Syndicate",
    price: "$29.99",
    featured: false,
  },
  {
    id: "parallel-minds",
    projectCode: "KX-08",
    title: "Parallel Minds",
    tagline: "Cognitive Infiltration",
    genre: "Psychological Cyber-Stealth",
    category: "Strategy",
    phase: "Beta Access",
    statusBadge: "TRENDING",
    accentColor: "#EC4899",
    description:
      "Infiltrate target neural subconsciousness to alter memories, bypass mental firewalls, and extract buried corporate secrets.",
    progressPercent: 91,
    coverImage: "/images/parallel_minds.jpg",
    platforms: ["Windows", "macOS", "Linux"],
    storageSize: "18.3 GB",
    developer: "NeuroForge Lab",
    price: "$24.99",
    featured: false,
  },
  {
    id: "the-last-grove",
    projectCode: "KX-09",
    title: "The Last Grove",
    tagline: "Bioluminescent Sanctuary",
    genre: "Atmospheric Nature Exploration",
    category: "RPG",
    phase: "Public Release",
    statusBadge: "VERIFIED",
    accentColor: "#14B8A6",
    description:
      "Restore life to an alien biome devastated by industrial extraction. Cultivate symbiotic flora and discover hidden celestial relics.",
    progressPercent: 100,
    coverImage: "/images/the_last_grove.jpg",
    platforms: ["Windows", "macOS", "Linux", "Web"],
    storageSize: "9.2 GB",
    developer: "Verdant Horizon",
    price: "$14.99",
    featured: false,
  },
];

async function seed() {
  const dataDir = path.join(process.cwd(), "src", "data");
  console.log("[SEED] Starting idempotent Kuronex database seed...");

  // 1. Roles & Permissions
  const allPermissions = new Set();
  for (const perms of Object.values(ROLE_PERMISSION_MAP)) {
    for (const p of perms) allPermissions.add(p);
  }

  for (const scope of allPermissions) {
    const id = `perm_${scope.replace(/[^a-zA-Z0-9]+/g, "_")}`;
    await prisma.permission.upsert({
      where: { scope },
      update: {},
      create: { id, scope, description: `RBAC permission: ${scope}` },
    });
  }

  const roleIdByName = {};
  for (const r of ROLE_DEFINITIONS) {
    const upserted = await prisma.role.upsert({
      where: { name: r.name },
      update: { description: r.description },
      create: r,
    });
    roleIdByName[r.name] = upserted.id;

    const scopes = ROLE_PERMISSION_MAP[r.name] || [];
    for (const scope of scopes) {
      const perm = await prisma.permission.findUnique({ where: { scope } });
      if (perm) {
        await prisma.rolePermission.upsert({
          where: { roleId_permissionId: { roleId: upserted.id, permissionId: perm.id } },
          update: {},
          create: { roleId: upserted.id, permissionId: perm.id },
        });
      }
    }
  }

  // 2. Categories
  const catIdByName = {};
  for (const cat of CATEGORIES) {
    const upserted = await prisma.gameCategory.upsert({
      where: { name: cat.name },
      update: { description: cat.description, displayOrder: cat.displayOrder },
      create: cat,
    });
    catIdByName[cat.name.toLowerCase()] = upserted.id;
  }

  // 3. Developer Studios
  const developersJson = readJsonSafe(path.join(dataDir, "developers.json"), []);
  const studioIdByName = {};
  for (const dev of developersJson) {
    const slug = slugify(dev.name || dev.id);
    const upserted = await prisma.developerStudio.upsert({
      where: { id: dev.id },
      update: {
        name: dev.name,
        tagline: dev.tagline || "",
        icon: dev.icon || "Sparkles",
        genre: dev.genre || "Indie",
        headquarters: dev.headquarters || "Global",
        country: dev.country || null,
        logo: dev.logo || null,
        description: dev.description || "",
        gamesCount: Number(dev.gamesCount) || 0,
        partnerTier: dev.partnerTier || "Studio Partner",
        website: dev.website || "",
        showInTicker: Boolean(dev.showInTicker),
      },
      create: {
        id: dev.id,
        slug,
        name: dev.name,
        tagline: dev.tagline || "",
        icon: dev.icon || "Sparkles",
        genre: dev.genre || "Indie",
        headquarters: dev.headquarters || "Global",
        country: dev.country || null,
        logo: dev.logo || null,
        description: dev.description || "",
        gamesCount: Number(dev.gamesCount) || 0,
        partnerTier: dev.partnerTier || "Studio Partner",
        website: dev.website || "",
        showInTicker: Boolean(dev.showInTicker),
      },
    });
    studioIdByName[dev.name.toLowerCase()] = upserted.id;
  }

  // 4. Static Catalogue Games
  for (const g of STATIC_GAMES) {
    const categoryId = catIdByName[g.category.toLowerCase()] || "cat_action";
    const studioId = studioIdByName[g.developer.toLowerCase()] || null;
    await prisma.game.upsert({
      where: { id: g.id },
      update: {
        title: g.title,
        tagline: g.tagline,
        genre: g.genre,
        categoryId,
        studioId,
        phase: g.phase,
        statusBadge: g.statusBadge,
        accentColor: g.accentColor,
        description: g.description,
        progressPercent: g.progressPercent,
        coverImage: g.coverImage,
        storageSize: g.storageSize,
        developerName: g.developer,
        price: g.price,
        platforms: JSON.stringify(g.platforms || []),
        tags: JSON.stringify([g.category, g.genre]),
        isFeatured: Boolean(g.featured),
        isCatalogue: true,
      },
      create: {
        id: g.id,
        slug: slugify(g.id),
        projectCode: g.projectCode,
        title: g.title,
        tagline: g.tagline,
        genre: g.genre,
        categoryId,
        studioId,
        phase: g.phase,
        statusBadge: g.statusBadge,
        accentColor: g.accentColor,
        description: g.description,
        progressPercent: g.progressPercent,
        coverImage: g.coverImage,
        storageSize: g.storageSize,
        developerName: g.developer,
        price: g.price,
        platforms: JSON.stringify(g.platforms || []),
        tags: JSON.stringify([g.category, g.genre]),
        isFeatured: Boolean(g.featured),
        isCatalogue: true,
      },
    });
  }

  // 5. Library Game Slots
  const slotsJson = readJsonSafe(path.join(dataDir, "library-games.json"), []);
  for (const s of slotsJson) {
    const categoryId = catIdByName[String(s.category || "").toLowerCase()] || "cat_action";
    const tags = Array.isArray(s.tags) ? s.tags : [];
    const matchedGame = STATIC_GAMES.find(
      (g) => g.title.toLowerCase() === String(s.title || "").toLowerCase()
    );

    await prisma.libraryGameSlot.upsert({
      where: { id: s.id },
      update: {
        categoryId,
        slotNumber: Number(s.slotNumber) || 1,
        title: s.title || "",
        tagline: s.tagline || "",
        description: s.description || "",
        coverImage: s.coverImage || "",
        badge: s.badge || "SLOT OPEN",
        accentColor: s.accentColor || "#FF263D",
        progressPercent: Number(s.progressPercent) || 0,
        developer: s.developer || "",
        tags: JSON.stringify(tags),
        isEmpty: Boolean(s.isEmpty),
        gameId: matchedGame ? matchedGame.id : null,
      },
      create: {
        id: s.id,
        categoryId,
        slotNumber: Number(s.slotNumber) || 1,
        title: s.title || "",
        tagline: s.tagline || "",
        description: s.description || "",
        coverImage: s.coverImage || "",
        badge: s.badge || "SLOT OPEN",
        accentColor: s.accentColor || "#FF263D",
        progressPercent: Number(s.progressPercent) || 0,
        developer: s.developer || "",
        tags: JSON.stringify(tags),
        isEmpty: Boolean(s.isEmpty),
        gameId: matchedGame ? matchedGame.id : null,
      },
    });
  }

  // 6. Users + UserLibrary
  const usersJson = readJsonSafe(path.join(dataDir, "users.json"), []);
  for (const u of usersJson) {
    const normalizedRole = String(u.role || "player").toUpperCase();
    const roleId = roleIdByName[normalizedRole] || roleIdByName.PLAYER;
    const email = String(u.email || "").trim().toLowerCase();
    if (!email || !u.username || !u.passwordHash || !u.salt) continue;

    const existing = await prisma.user.findUnique({ where: { id: u.id } });
    if (!existing) {
      await prisma.user.create({
        data: {
          id: u.id,
          username: u.username,
          email,
          passwordHash: u.passwordHash,
          salt: u.salt,
          role: String(u.role || "player").toLowerCase(),
          roleId,
          isActive: true,
          isSuspended: Boolean(u.isSuspended),
          suspendedReason: u.suspendedReason || null,
          isEmailVerified: Boolean(u.isEmailVerified),
          createdAt: u.createdAt ? new Date(u.createdAt) : new Date(),
        },
      });
    }

    if (Array.isArray(u.library)) {
      for (const gameId of u.library) {
        if (!gameId) continue;
        await prisma.userLibrary.upsert({
          where: { userId_gameId: { userId: u.id, gameId } },
          update: {},
          create: { userId: u.id, gameId, status: "IN_LIBRARY" },
        });
      }
    }
  }

  // Provision optional env-configured local dev admin if explicitly provided and none exist
  if (
    process.env.NODE_ENV !== "production" &&
    process.env.DEV_ADMIN_EMAIL &&
    process.env.DEV_ADMIN_PASSWORD
  ) {
    const adminCount = await prisma.user.count({
      where: { role: { in: ["admin", "super_admin"] } },
    });
    if (adminCount === 0) {
      const { hash, salt } = hashPassword(process.env.DEV_ADMIN_PASSWORD);
      const email = process.env.DEV_ADMIN_EMAIL.trim().toLowerCase();
      const username = (process.env.DEV_ADMIN_USERNAME || "kuronex_admin").trim();
      await prisma.user.create({
        data: {
          id: "kuro_dev_admin_root",
          username,
          email,
          passwordHash: hash,
          salt,
          role: "admin",
          roleId: roleIdByName.ADMIN,
          isActive: true,
          isEmailVerified: true,
        },
      });
      console.log(`[SEED] Created env-configured local admin: ${email}`);
    }
  }

  // 7. Announcements
  const announcementsJson = readJsonSafe(path.join(dataDir, "announcements.json"), []);
  for (const a of announcementsJson) {
    await prisma.announcement.upsert({
      where: { id: a.id },
      update: {
        title: a.title,
        message: a.message,
        priority: a.priority || "NORMAL",
        category: a.category || "UPDATE",
        isActive: Boolean(a.isActive),
        authorName: a.author || a.authorName || "kuronex_dev",
      },
      create: {
        id: a.id,
        title: a.title,
        message: a.message,
        priority: a.priority || "NORMAL",
        category: a.category || "UPDATE",
        isActive: Boolean(a.isActive),
        authorName: a.author || a.authorName || "kuronex_dev",
        publishedAt: a.publishedAt ? new Date(a.publishedAt) : new Date(),
      },
    });
  }

  // 8. Platform Settings
  const settingsJson = readJsonSafe(path.join(dataDir, "platform-settings.json"), {
    platformName: "KURONEX GAMES",
    tagline: "Build Your Own Library.",
    maintenanceMode: false,
    registrationOpen: true,
    clientVersion: "v1.4.2",
    clientDownloadUrl: "/download",
    supportEmail: "support@kuronex.com",
    sessionTimeoutDays: 30,
    maxUploadSizeMb: 120,
    featuredCategory: "Action",
  });
  for (const [key, val] of Object.entries(settingsJson)) {
    const valueType = typeof val === "boolean" ? "boolean" : typeof val === "number" ? "number" : "string";
    await prisma.platformSetting.upsert({
      where: { key },
      update: { value: String(val), valueType },
      create: {
        key,
        value: String(val),
        valueType,
        isPublic: ["platformName", "tagline", "clientVersion", "clientDownloadUrl", "maintenanceMode", "registrationOpen", "featuredCategory"].includes(key),
      },
    });
  }

  // 9. Audit Logs
  const auditJson = readJsonSafe(path.join(dataDir, "audit-logs.json"), []);
  for (const log of auditJson) {
    if (!log.id) continue;
    await prisma.auditLog.upsert({
      where: { id: log.id },
      update: {},
      create: {
        id: log.id,
        action: log.action || "Action",
        category: log.category || "SYSTEM",
        actorUsername: log.actor || log.actorUsername || "system",
        target: log.target || "system",
        details: log.details || "",
        status: log.status || "SUCCESS",
        timestamp: log.timestamp ? new Date(log.timestamp) : new Date(),
      },
    });
  }

  // 10. Download Builds (Client Launcher Targets - metadata only, no fabricated download counts)
  const existingBuilds = await prisma.downloadBuild.count();
  if (existingBuilds === 0) {
    await prisma.downloadBuild.createMany({
      data: [
        {
          id: "build_client_win_142",
          itemType: "client",
          itemId: "kuronex-desktop-launcher",
          platform: "windows",
          version: "v1.4.2-alpha",
          downloadUrl: "/download?platform=windows",
          checksumSha256: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
          fileSizeBytes: BigInt(152043520),
          isPublic: true,
        },
        {
          id: "build_client_mac_142",
          itemType: "client",
          itemId: "kuronex-desktop-launcher",
          platform: "macos",
          version: "v1.4.2-alpha",
          downloadUrl: "/download?platform=macos",
          checksumSha256: "8f434346648f6b96df89dda901c5176b10a6d83961dd3c1ac88b59b2dc327aa4",
          fileSizeBytes: BigInt(169869312),
          isPublic: true,
        },
        {
          id: "build_client_linux_142",
          itemType: "client",
          itemId: "kuronex-desktop-launcher",
          platform: "linux",
          version: "v1.4.2-alpha",
          downloadUrl: "/download?platform=linux",
          checksumSha256: "2c26b46b68ffc68ff99b453c1d30413413422d706483bfa0f98a5e886266e7ae",
          fileSizeBytes: BigInt(123731968),
          isPublic: true,
        },
      ],
    });
  }

  // 11. Starter Promotions (Zero fabricated claimsCount)
  const existingPromos = await prisma.promotion.count();
  if (existingPromos === 0) {
    await prisma.promotion.createMany({
      data: [
        {
          id: "promo_alpha_founder",
          title: "Kuronex Client Alpha Founder Queue",
          tagline: "Reserve priority launcher access across Windows, macOS, and Linux",
          description: "Early-adopter waitlist slot with desktop alpha release priority notifications.",
          promoType: "BANNER",
          targetUrl: "/download",
          code: "ALPHA-2026",
          claimsCount: 0,
          maxClaims: 10000,
          isActive: true,
        },
        {
          id: "promo_neon_haven_beta",
          title: "Neon Haven Open Beta Spotlight",
          tagline: "Overdrive Protocol — Featured Action RPG",
          description: "Bookmark Neon Haven into your Kuronex Vault ahead of native launcher release.",
          promoType: "SPOTLIGHT",
          gameId: "neon-haven",
          bannerUrl: "/images/neon_haven.jpg",
          targetUrl: "/library",
          claimsCount: 0,
          maxClaims: 0,
          isActive: true,
        },
      ],
    });
  }

  const counts = {
    roles: await prisma.role.count(),
    categories: await prisma.gameCategory.count(),
    studios: await prisma.developerStudio.count(),
    games: await prisma.game.count(),
    slots: await prisma.libraryGameSlot.count(),
    users: await prisma.user.count(),
    announcements: await prisma.announcement.count(),
    promotions: await prisma.promotion.count(),
    builds: await prisma.downloadBuild.count(),
  };

  console.log("[SEED] Complete:", JSON.stringify(counts));
}

seed()
  .catch((err) => {
    console.error("[SEED FAILED]", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

