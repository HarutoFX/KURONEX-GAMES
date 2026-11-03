-- ============================================================================
-- KURONEX GAMES — Production Administrator Credentials Seed Script
-- Generated: 2026-11-03T15:58:54.571Z
-- Cryptography: scrypt 64-byte hashes with 16-byte cryptographically-secure salts
-- ============================================================================

CREATE TABLE IF NOT EXISTS "users" (
  "id" VARCHAR(64) PRIMARY KEY,
  "username" VARCHAR(50) NOT NULL UNIQUE,
  "email" VARCHAR(255) NOT NULL UNIQUE,
  "password_hash" VARCHAR(128) NOT NULL,
  "salt" VARCHAR(64) NOT NULL,
  "role" VARCHAR(32) NOT NULL DEFAULT 'PLAYER',
  "created_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

INSERT INTO "users" ("id", "username", "email", "password_hash", "salt", "role", "created_at", "updated_at")
VALUES
  ('kuro_dev_admin_root', 'admin', 'admin@kuronex.games', '62d69fb06a2ff061caf244591ffd778cafb871c79dce7c0da5cadb2cbe625c047169a40cd7468d42da9a6f852000674934f5559f3317fffcc62ba8041cd8ad88', '907bc5185665c58674b2fa38f4e2a86f', 'ADMIN', '2026-11-03T02:20:00.000Z', NOW())
ON CONFLICT ("email") 
DO UPDATE SET 
  "username" = EXCLUDED."username",
  "password_hash" = EXCLUDED."password_hash",
  "salt" = EXCLUDED."salt",
  "role" = EXCLUDED."role",
  "updated_at" = NOW();
