#!/usr/bin/env node
/* eslint-disable @typescript-eslint/no-require-imports */

/**
 * KURONEX GAMES — CLI Admin Credentials Export & Migration Utility
 *
 * Usage:
 *   node scripts/export-admin-credentials.js
 *
 * Reads verified administrator accounts from src/data/users.json and generates:
 *   1. PostgreSQL / Supabase seed SQL script
 *   2. Prisma ORM seed snippet
 *   3. JSON transfer payload
 */

const fs = require("fs");
const path = require("path");

const usersPath = path.join(process.cwd(), "src", "data", "users.json");
const outputDir = path.join(process.cwd(), "src", "data", "backend-migrations");

if (!fs.existsSync(usersPath)) {
  console.error("Error: users.json database not found at", usersPath);
  process.exit(1);
}

const allUsers = JSON.parse(fs.readFileSync(usersPath, "utf-8") || "[]");
const adminUsers = allUsers.filter(
  (u) => u.role === "admin" || u.role === "super_admin" || u.role === "SUPER_ADMIN"
);

console.log(`\n========================================================================`);
console.log(`   KURONEX GAMES — BACKEND CREDENTIAL MIGRATION EXPORTER                `);
console.log(`========================================================================`);
console.log(`Found ${adminUsers.length} verified administrator accounts in users.json:\n`);

adminUsers.forEach((u, i) => {
  console.log(`  [${i + 1}] Gamertag: ${u.username}`);
  console.log(`      Email:    ${u.email}`);
  console.log(`      Role:     ${u.role.toUpperCase()}`);
  console.log(`      User ID:  ${u.id}`);
  console.log(`      Salt:     ${u.salt}`);
  console.log(`      Created:  ${u.createdAt}\n`);
});

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// 1. Generate SQL Script
const sqlValues = adminUsers
  .map(
    (u) =>
      `  ('${u.id}', '${u.username.replace(/'/g, "''")}', '${u.email.replace(/'/g, "''")}', '${u.passwordHash}', '${u.salt}', '${u.role.toUpperCase()}', '${u.createdAt}', NOW())`
  )
  .join(",\n");

const sqlScript = `-- ============================================================================
-- KURONEX GAMES — Production Administrator Credentials Seed Script
-- Generated: ${new Date().toISOString()}
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
${sqlValues}
ON CONFLICT ("email") 
DO UPDATE SET 
  "username" = EXCLUDED."username",
  "password_hash" = EXCLUDED."password_hash",
  "salt" = EXCLUDED."salt",
  "role" = EXCLUDED."role",
  "updated_at" = NOW();
`;

const sqlFilePath = path.join(outputDir, "admin-seed.sql");
fs.writeFileSync(sqlFilePath, sqlScript, "utf-8");

// 2. Generate JSON Export
const jsonFilePath = path.join(outputDir, "admin-seed.json");
fs.writeFileSync(jsonFilePath, JSON.stringify(adminUsers, null, 2), "utf-8");

console.log(`[SUCCESS] Backend migration files generated:`);
console.log(`  → SQL Script:  ${path.relative(process.cwd(), sqlFilePath)}`);
console.log(`  → JSON Export: ${path.relative(process.cwd(), jsonFilePath)}`);
console.log(`\nWhen deploying your backend, execute admin-seed.sql directly against your database.\n`);
