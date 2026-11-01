export interface DbUser {
  id: string;
  username: string;
  email: string;
  passwordHash: string;
  salt: string;
  role: "player" | "developer" | "admin";
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface DbSession {
  id: string;
  token: string;
  userId: string;
  ipAddress?: string;
  userAgent?: string;
  expiresAt: number;
  createdAt: string;
}

export interface DbGameCategory {
  id: string;
  slug: string;
  name: string;
  description?: string;
  displayOrder: number;
}

export interface DbDeveloperStudio {
  id: string;
  slug: string;
  name: string;
  tagline?: string;
  icon: string;
  genre: string;
  headquarters: string;
  description: string;
  gamesCount: number;
  partnerTier: "Premier Partner" | "Studio Partner" | "Indie Pioneer";
  website?: string;
  showInTicker: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface DbGame {
  id: string;
  slug: string;
  projectCode: string;
  title: string;
  tagline: string;
  genre: string;
  categoryId: string;
  studioId?: string;
  phase: string;
  statusBadge: string;
  accentColor: string;
  description: string;
  progressPercent: number;
  coverImage?: string;
  storageSize?: string;
  developerName?: string;
  price: string;
  isFeatured: boolean;
  isCatalogue: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface DbLibrarySlot {
  id: string;
  category: string;
  categoryId?: string;
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
  updatedAt: string;
}

export interface DbUserLibrary {
  id: string;
  userId: string;
  gameId: string;
  acquiredAt: string;
  playTimeMinutes: number;
  lastPlayedAt?: string;
  status: "IN_LIBRARY" | "INSTALLED" | "FAVORITE" | "ARCHIVED";
}

export interface DbDownloadEvent {
  id: string;
  itemType: "client" | "game";
  itemId: string;
  platform: "windows" | "macos" | "linux" | "other";
  version?: string;
  userId?: string;
  ipHash?: string;
  timestamp: string;
}

export interface DbAnnouncement {
  id: string;
  title: string;
  message: string;
  priority: "LOW" | "NORMAL" | "HIGH" | "URGENT";
  category: "UPDATE" | "MAINTENANCE" | "COMMUNITY" | "PROMOTION";
  isActive: boolean;
  authorId?: string;
  authorName: string;
  publishedAt: string;
  updatedAt: string;
}

export interface DbAuditLog {
  id: string;
  action: string;
  category: "GAMES" | "USERS" | "SYSTEM" | "CMS" | "AUTH" | "SETTINGS";
  actorId?: string;
  actorUsername: string;
  target: string;
  details: string;
  status: "SUCCESS" | "WARNING" | "FAILED";
  ipAddress?: string;
  timestamp: string;
}

export interface DbPlatformSettings {
  platformName: string;
  tagline: string;
  maintenanceMode: boolean;
  registrationOpen: boolean;
  clientVersion: string;
  clientDownloadUrl: string;
  supportEmail: string;
  sessionTimeoutDays: number;
  maxUploadSizeMb: number;
  featuredCategory: string;
}
