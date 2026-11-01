-- KURONEX GAMES - PostgreSQL Initial DDL Migration
-- Generated for PostgreSQL 14+ with strict relational integrity

-- ─── ENUMS ──────────────────────────────────────────────────────────────────
CREATE TYPE "RoleName" AS ENUM ('PLAYER', 'DEVELOPER', 'ADMIN', 'SUPER_ADMIN');
CREATE TYPE "PartnerTier" AS ENUM ('PREMIER_PARTNER', 'STUDIO_PARTNER', 'INDIE_PIONEER');
CREATE TYPE "TargetPlatform" AS ENUM ('WINDOWS', 'MACOS', 'LINUX', 'WEB', 'OTHER');
CREATE TYPE "DownloadItemType" AS ENUM ('CLIENT', 'GAME');
CREATE TYPE "LibraryItemStatus" AS ENUM ('IN_LIBRARY', 'INSTALLED', 'FAVORITE', 'ARCHIVED');
CREATE TYPE "AnnouncementPriority" AS ENUM ('LOW', 'NORMAL', 'HIGH', 'URGENT');
CREATE TYPE "AnnouncementCategory" AS ENUM ('UPDATE', 'MAINTENANCE', 'COMMUNITY', 'PROMOTION');
CREATE TYPE "PromoType" AS ENUM ('SPOTLIGHT', 'PLAYTEST_KEY_DROP', 'SEASONAL_BANNER', 'DISCOUNT');
CREATE TYPE "AuditCategory" AS ENUM ('GAMES', 'USERS', 'SYSTEM', 'CMS', 'AUTH', 'SETTINGS');
CREATE TYPE "AuditStatus" AS ENUM ('SUCCESS', 'WARNING', 'FAILED');

-- ─── ROLES & PERMISSIONS ────────────────────────────────────────────────────
CREATE TABLE "roles" (
    "id" VARCHAR(64) PRIMARY KEY,
    "name" "RoleName" NOT NULL UNIQUE,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "permissions" (
    "id" VARCHAR(64) PRIMARY KEY,
    "scope" VARCHAR(128) NOT NULL UNIQUE,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "role_permissions" (
    "roleId" VARCHAR(64) NOT NULL REFERENCES "roles"("id") ON DELETE CASCADE,
    "permissionId" VARCHAR(64) NOT NULL REFERENCES "permissions"("id") ON DELETE CASCADE,
    PRIMARY KEY ("roleId", "permissionId")
);

-- ─── USERS & SESSIONS ───────────────────────────────────────────────────────
CREATE TABLE "users" (
    "id" VARCHAR(64) PRIMARY KEY,
    "username" VARCHAR(64) NOT NULL UNIQUE,
    "email" VARCHAR(255) NOT NULL UNIQUE,
    "passwordHash" VARCHAR(255) NOT NULL,
    "salt" VARCHAR(128) NOT NULL,
    "roleId" VARCHAR(64) NOT NULL REFERENCES "roles"("id") ON DELETE RESTRICT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX "users_roleId_idx" ON "users"("roleId");

CREATE TABLE "sessions" (
    "id" VARCHAR(64) PRIMARY KEY,
    "token" VARCHAR(128) NOT NULL UNIQUE,
    "userId" VARCHAR(64) NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
    "ipAddress" VARCHAR(45),
    "userAgent" TEXT,
    "expiresAt" TIMESTAMP(3) WITH TIME ZONE NOT NULL,
    "createdAt" TIMESTAMP(3) WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX "sessions_token_idx" ON "sessions"("token");
CREATE INDEX "sessions_userId_idx" ON "sessions"("userId");
CREATE INDEX "sessions_expiresAt_idx" ON "sessions"("expiresAt");

-- ─── CATEGORIES & STUDIOS ───────────────────────────────────────────────────
CREATE TABLE "game_categories" (
    "id" VARCHAR(64) PRIMARY KEY,
    "slug" VARCHAR(64) NOT NULL UNIQUE,
    "name" VARCHAR(64) NOT NULL UNIQUE,
    "description" TEXT,
    "displayOrder" INT NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "developer_studios" (
    "id" VARCHAR(64) PRIMARY KEY,
    "slug" VARCHAR(64) NOT NULL UNIQUE,
    "name" VARCHAR(128) NOT NULL,
    "tagline" VARCHAR(255),
    "icon" VARCHAR(64) NOT NULL DEFAULT 'Sparkles',
    "genre" VARCHAR(128) NOT NULL,
    "headquarters" VARCHAR(128) NOT NULL,
    "description" TEXT NOT NULL,
    "gamesCount" INT NOT NULL DEFAULT 0,
    "partnerTier" "PartnerTier" NOT NULL DEFAULT 'STUDIO_PARTNER',
    "website" VARCHAR(255),
    "showInTicker" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX "developer_studios_partnerTier_idx" ON "developer_studios"("partnerTier");

-- ─── GAMES & SLOTS ──────────────────────────────────────────────────────────
CREATE TABLE "games" (
    "id" VARCHAR(64) PRIMARY KEY,
    "slug" VARCHAR(64) NOT NULL UNIQUE,
    "projectCode" VARCHAR(32) NOT NULL UNIQUE,
    "title" VARCHAR(128) NOT NULL,
    "tagline" VARCHAR(255) NOT NULL,
    "genre" VARCHAR(128) NOT NULL,
    "categoryId" VARCHAR(64) NOT NULL REFERENCES "game_categories"("id") ON DELETE RESTRICT,
    "studioId" VARCHAR(64) REFERENCES "developer_studios"("id") ON DELETE SET NULL,
    "phase" VARCHAR(64) NOT NULL DEFAULT 'Concept',
    "statusBadge" VARCHAR(64) NOT NULL DEFAULT 'DEVELOPMENT',
    "accentColor" VARCHAR(32) NOT NULL DEFAULT '#FF263D',
    "description" TEXT NOT NULL,
    "progressPercent" INT NOT NULL DEFAULT 0 CHECK ("progressPercent" >= 0 AND "progressPercent" <= 100),
    "coverImage" VARCHAR(255),
    "storageSize" VARCHAR(32),
    "developerName" VARCHAR(128),
    "price" VARCHAR(64) NOT NULL DEFAULT 'Free to Play',
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "isCatalogue" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX "games_categoryId_idx" ON "games"("categoryId");
CREATE INDEX "games_studioId_idx" ON "games"("studioId");

CREATE TABLE "library_game_slots" (
    "id" VARCHAR(64) PRIMARY KEY,
    "categoryId" VARCHAR(64) NOT NULL REFERENCES "game_categories"("id") ON DELETE RESTRICT,
    "slotNumber" INT NOT NULL,
    "title" VARCHAR(128) NOT NULL DEFAULT '',
    "tagline" VARCHAR(255) NOT NULL DEFAULT '',
    "description" TEXT NOT NULL DEFAULT '',
    "coverImage" VARCHAR(255) NOT NULL DEFAULT '',
    "badge" VARCHAR(64) NOT NULL DEFAULT 'SLOT OPEN',
    "accentColor" VARCHAR(32) NOT NULL DEFAULT '#FF263D',
    "progressPercent" INT NOT NULL DEFAULT 0 CHECK ("progressPercent" >= 0 AND "progressPercent" <= 100),
    "developer" VARCHAR(128) NOT NULL DEFAULT '',
    "isEmpty" BOOLEAN NOT NULL DEFAULT true,
    "gameId" VARCHAR(64) REFERENCES "games"("id") ON DELETE SET NULL,
    "updatedAt" TIMESTAMP(3) WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX "library_game_slots_categoryId_slotNumber_idx" ON "library_game_slots"("categoryId", "slotNumber");

-- ─── USER LIBRARIES & REVIEWS ───────────────────────────────────────────────
CREATE TABLE "user_libraries" (
    "id" VARCHAR(64) PRIMARY KEY,
    "userId" VARCHAR(64) NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
    "gameId" VARCHAR(64) NOT NULL REFERENCES "games"("id") ON DELETE CASCADE,
    "acquiredAt" TIMESTAMP(3) WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "playTimeMinutes" INT NOT NULL DEFAULT 0,
    "lastPlayedAt" TIMESTAMP(3) WITH TIME ZONE,
    "status" "LibraryItemStatus" NOT NULL DEFAULT 'IN_LIBRARY',
    CONSTRAINT "user_libraries_userId_gameId_unique" UNIQUE ("userId", "gameId")
);
CREATE INDEX "user_libraries_userId_idx" ON "user_libraries"("userId");
CREATE INDEX "user_libraries_gameId_idx" ON "user_libraries"("gameId");

CREATE TABLE "reviews" (
    "id" VARCHAR(64) PRIMARY KEY,
    "userId" VARCHAR(64) NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
    "gameId" VARCHAR(64) NOT NULL REFERENCES "games"("id") ON DELETE CASCADE,
    "title" VARCHAR(128) NOT NULL,
    "content" TEXT NOT NULL,
    "ratingScore" INT NOT NULL CHECK ("ratingScore" >= 1 AND "ratingScore" <= 5),
    "isVerifiedOwner" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "reviews_userId_gameId_unique" UNIQUE ("userId", "gameId")
);
CREATE INDEX "reviews_gameId_idx" ON "reviews"("gameId");

CREATE TABLE "game_ratings" (
    "id" VARCHAR(64) PRIMARY KEY,
    "userId" VARCHAR(64) NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
    "gameId" VARCHAR(64) NOT NULL REFERENCES "games"("id") ON DELETE CASCADE,
    "ratingScore" INT NOT NULL CHECK ("ratingScore" >= 1 AND "ratingScore" <= 5),
    "createdAt" TIMESTAMP(3) WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "game_ratings_userId_gameId_unique" UNIQUE ("userId", "gameId")
);
CREATE INDEX "game_ratings_gameId_idx" ON "game_ratings"("gameId");

-- ─── BUILDS & DOWNLOADS ─────────────────────────────────────────────────────
CREATE TABLE "download_builds" (
    "id" VARCHAR(64) PRIMARY KEY,
    "gameId" VARCHAR(64) REFERENCES "games"("id") ON DELETE SET NULL,
    "itemType" "DownloadItemType" NOT NULL DEFAULT 'CLIENT',
    "itemId" VARCHAR(128) NOT NULL,
    "platform" "TargetPlatform" NOT NULL,
    "version" VARCHAR(64) NOT NULL,
    "downloadUrl" VARCHAR(512) NOT NULL,
    "checksumSha256" VARCHAR(64),
    "fileSizeBytes" BIGINT,
    "isPublic" BOOLEAN NOT NULL DEFAULT true,
    "releasedAt" TIMESTAMP(3) WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX "download_builds_platform_itemType_idx" ON "download_builds"("platform", "itemType");

CREATE TABLE "download_events" (
    "id" VARCHAR(64) PRIMARY KEY,
    "itemType" "DownloadItemType" NOT NULL DEFAULT 'CLIENT',
    "itemId" VARCHAR(128) NOT NULL,
    "gameId" VARCHAR(64) REFERENCES "games"("id") ON DELETE SET NULL,
    "platform" "TargetPlatform" NOT NULL,
    "version" VARCHAR(64),
    "userId" VARCHAR(64) REFERENCES "users"("id") ON DELETE SET NULL,
    "ipHash" VARCHAR(64),
    "timestamp" TIMESTAMP(3) WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX "download_events_timestamp_idx" ON "download_events"("timestamp");
CREATE INDEX "download_events_platform_idx" ON "download_events"("platform");
CREATE INDEX "download_events_itemType_idx" ON "download_events"("itemType");

-- ─── PROMOTIONS & ANNOUNCEMENTS ─────────────────────────────────────────────
CREATE TABLE "promotions" (
    "id" VARCHAR(64) PRIMARY KEY,
    "title" VARCHAR(128) NOT NULL,
    "tagline" VARCHAR(255),
    "description" TEXT,
    "promoType" "PromoType" NOT NULL DEFAULT 'SPOTLIGHT',
    "gameId" VARCHAR(64) REFERENCES "games"("id") ON DELETE SET NULL,
    "bannerUrl" VARCHAR(512),
    "targetUrl" VARCHAR(512) NOT NULL,
    "startsAt" TIMESTAMP(3) WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endsAt" TIMESTAMP(3) WITH TIME ZONE,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX "promotions_isActive_idx" ON "promotions"("isActive");

CREATE TABLE "announcements" (
    "id" VARCHAR(64) PRIMARY KEY,
    "title" VARCHAR(128) NOT NULL,
    "message" TEXT NOT NULL,
    "priority" "AnnouncementPriority" NOT NULL DEFAULT 'NORMAL',
    "category" "AnnouncementCategory" NOT NULL DEFAULT 'UPDATE',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "authorId" VARCHAR(64) REFERENCES "users"("id") ON DELETE SET NULL,
    "authorName" VARCHAR(64) NOT NULL DEFAULT 'kuronex_dev',
    "publishedAt" TIMESTAMP(3) WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX "announcements_isActive_priority_idx" ON "announcements"("isActive", "priority");

-- ─── AUDIT & SETTINGS ───────────────────────────────────────────────────────
CREATE TABLE "audit_logs" (
    "id" VARCHAR(64) PRIMARY KEY,
    "action" VARCHAR(128) NOT NULL,
    "category" "AuditCategory" NOT NULL,
    "actorId" VARCHAR(64) REFERENCES "users"("id") ON DELETE SET NULL,
    "actorUsername" VARCHAR(64) NOT NULL,
    "target" VARCHAR(255) NOT NULL,
    "details" TEXT NOT NULL,
    "status" "AuditStatus" NOT NULL DEFAULT 'SUCCESS',
    "ipAddress" VARCHAR(45),
    "timestamp" TIMESTAMP(3) WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX "audit_logs_timestamp_idx" ON "audit_logs"("timestamp");
CREATE INDEX "audit_logs_category_idx" ON "audit_logs"("category");

CREATE TABLE "platform_settings" (
    "key" VARCHAR(64) PRIMARY KEY,
    "value" TEXT NOT NULL,
    "valueType" VARCHAR(32) NOT NULL DEFAULT 'string',
    "isPublic" BOOLEAN NOT NULL DEFAULT false,
    "description" TEXT,
    "updatedAt" TIMESTAMP(3) WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

