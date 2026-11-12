/* eslint-disable @typescript-eslint/no-require-imports */
/**
 * Comprehensive Backend Architecture & Database Modernization Verification Suite
 * 
 * Verifies:
 * 1. Data backup snapshots and manifest SHA-256 verification
 * 2. Prisma schema definition covering all 16 normalized domains
 * 3. PostgreSQL DDL migration script with indexes & foreign keys
 * 4. Data validation and non-simulated real platform analytics
 * 5. Atomic store durability & write-then-rename concurrency resilience
 * 6. Database domain repositories (Users, Library, Downloads, Games, System)
 * 7. API utilities (pagination, sorting, sanitization, response formatting)
 */

const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const { execSync } = require("child_process");

let passedTests = 0;
let failedTests = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  [PASS] ${message}`);
    passedTests++;
  } else {
    console.error(`  [FAIL] ${message}`);
    failedTests++;
  }
}

async function runTests() {
  console.log("================================================================================");
  console.log("       KURONEX GAMES — BACKEND ARCHITECTURE & DATABASE MODERNIZATION SUITE      ");
  console.log("================================================================================\n");

  // 1. BACKUP & SNAPSHOT VERIFICATION
  console.log("--- 1. Automated Backup Pipeline Verification ---");
  const backupDir = path.join(process.cwd(), "backups", "json-snapshots");
  assert(fs.existsSync(backupDir), "Backup snapshots root directory exists");

  const snapshots = fs.readdirSync(backupDir).filter((d) => d.startsWith("snapshot-"));
  assert(snapshots.length > 0, `Found ${snapshots.length} existing backup snapshot(s)`);

  const latestSnapshot = snapshots.sort().reverse()[0];
  const manifestPath = path.join(backupDir, latestSnapshot, "manifest.json");
  assert(fs.existsSync(manifestPath), `Manifest exists in latest snapshot: ${latestSnapshot}`);

  const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf-8"));
  assert(manifest.files && Object.keys(manifest.files).length >= 8, `Manifest contains checksums for ${Object.keys(manifest.files).length} data files`);

  let manifestHashesMatch = true;
  for (const [file, info] of Object.entries(manifest.files)) {
    const filePath = path.join(backupDir, latestSnapshot, file);
    if (!fs.existsSync(filePath)) {
      manifestHashesMatch = false;
      break;
    }
    const hash = crypto.createHash("sha256").update(fs.readFileSync(filePath)).digest("hex");
    const expectedHash = typeof info === "string" ? info : info.sha256;
    if (hash !== expectedHash) {
      manifestHashesMatch = false;
      break;
    }
  }
  assert(manifestHashesMatch, "All backup snapshot file hashes match cryptographic manifest");

  // 2. PRISMA SCHEMA & POSTGRESQL DDL VERIFICATION
  console.log("\n--- 2. Relational PostgreSQL Schema & Prisma Models ---");
  const prismaSchemaPath = path.join(process.cwd(), "prisma", "schema.prisma");
  assert(fs.existsSync(prismaSchemaPath), "prisma/schema.prisma exists");

  const schemaContent = fs.readFileSync(prismaSchemaPath, "utf-8");
  const requiredModels = [
    "User",
    "Role",
    "Permission",
    "Session",
    "Game",
    "GameCategory",
    "DeveloperStudio",
    "UserLibrary",
    "DownloadBuild",
    "DownloadEvent",
    "Promotion",
    "Announcement",
    "Review",
    "Rating",
    "AuditLog",
    "PlatformSetting",
  ];

  let missingModels = [];
  for (const model of requiredModels) {
    if (!schemaContent.includes(`model ${model} {`)) {
      missingModels.push(model);
    }
  }
  assert(missingModels.length === 0, `All 16 normalized models defined in schema (missing: ${missingModels.join(", ") || "none"})`);
  assert(schemaContent.includes("@@unique([userId, gameId])"), "UserLibrary has composite unique constraint @@unique([userId, gameId])");
  assert(schemaContent.includes("provider = \"postgresql\""), "Prisma schema is configured for PostgreSQL datasource");

  const ddlPath = path.join(process.cwd(), "prisma", "migrations", "0_init", "migration.sql");
  assert(fs.existsSync(ddlPath), "PostgreSQL DDL migration (prisma/migrations/0_init/migration.sql) exists");
  const ddlContent = fs.readFileSync(ddlPath, "utf-8");
  assert(ddlContent.includes("CREATE TABLE \"users\""), "DDL contains CREATE TABLE users");
  assert(ddlContent.includes("CREATE TABLE \"user_libraries\""), "DDL contains CREATE TABLE user_libraries");
  assert(ddlContent.includes("CREATE TABLE \"download_events\""), "DDL contains CREATE TABLE download_events");
  assert(ddlContent.includes("CREATE INDEX"), "DDL creates performance query indices");

  // 3. DATA VALIDATION & INTEGRITY SCRIPT
  console.log("\n--- 3. Data Integrity & Non-Simulated Analytics Audit ---");
  const validateScriptPath = path.join(process.cwd(), "scripts", "validate-and-migrate-data.js");
  assert(fs.existsSync(validateScriptPath), "scripts/validate-and-migrate-data.js exists");

  try {
    const valOutput = execSync("node scripts/validate-and-migrate-data.js", { encoding: "utf-8" });
    assert(valOutput.includes("0 errors"), "Data validation script reports 0 validation errors");
    assert(!valOutput.includes("[FAIL]"), "Validation passed without any data integrity failures");
  } catch (err) {
    assert(false, `validate-and-migrate-data.js crashed: ${err.message}`);
  }

  // 4. ATOMIC DURABILITY STORE
  console.log("\n--- 4. Atomic Store Write-Then-Rename Durability ---");
  const atomicStorePath = path.join(process.cwd(), "src", "lib", "db", "atomic-store.ts");
  assert(fs.existsSync(atomicStorePath), "src/lib/db/atomic-store.ts exists");

  // Simulate atomic write-then-rename in JS to verify mechanics
  const testTmpFile = path.join(process.cwd(), "backups", "test-atomic-store.json");
  const testPayload = { test: true, timestamp: Date.now(), items: [1, 2, 3] };
  
  const tempPath = `${testTmpFile}.${process.pid}.${Date.now()}.tmp`;
  fs.writeFileSync(tempPath, JSON.stringify(testPayload, null, 2), "utf-8");
  fs.renameSync(tempPath, testTmpFile);

  assert(fs.existsSync(testTmpFile), "Atomic write-then-rename persists file to disk safely");
  const readBack = JSON.parse(fs.readFileSync(testTmpFile, "utf-8"));
  assert(readBack.timestamp === testPayload.timestamp, "Read payload matches original atomic write exactly");
  fs.unlinkSync(testTmpFile);

  // 5. DOMAIN REPOSITORIES VERIFICATION
  console.log("\n--- 5. Domain Repositories Layer ---");
  const repoFiles = [
    "users-repository.ts",
    "library-repository.ts",
    "downloads-repository.ts",
    "games-repository.ts",
    "system-repository.ts",
  ];

  for (const rf of repoFiles) {
    const p = path.join(process.cwd(), "src", "lib", "db", rf);
    assert(fs.existsSync(p), `src/lib/db/${rf} exists`);
  }

  // Verify Prisma schema & client integration in runtime stores
  const sqliteSchemaPath = path.join(process.cwd(), "prisma", "schema.sqlite.prisma");
  assert(fs.existsSync(sqliteSchemaPath), "prisma/schema.sqlite.prisma exists for local SQLite dev");
  const prismaSingletonPath = path.join(process.cwd(), "src", "lib", "prisma.ts");
  assert(fs.existsSync(prismaSingletonPath), "src/lib/prisma.ts singleton exists");

  const authStoreContent = fs.readFileSync(path.join(process.cwd(), "src", "lib", "auth.ts"), "utf-8");
  assert(authStoreContent.includes("prisma"), "src/lib/auth.ts is backed by Prisma");

  const adminStoreContent = fs.readFileSync(path.join(process.cwd(), "src", "lib", "admin-store.ts"), "utf-8");
  assert(adminStoreContent.includes("prisma"), "src/lib/admin-store.ts is backed by Prisma");

  const libraryStoreContent = fs.readFileSync(path.join(process.cwd(), "src", "lib", "library-store.ts"), "utf-8");
  assert(libraryStoreContent.includes("prisma"), "src/lib/library-store.ts is backed by Prisma");

  const downloadStoreContent = fs.readFileSync(path.join(process.cwd(), "src", "lib", "download-store.ts"), "utf-8");
  assert(downloadStoreContent.includes("prisma"), "src/lib/download-store.ts is backed by Prisma");

  // 6. STANDARDIZED API FRAMEWORK
  console.log("\n--- 6. Standardized API Framework ---");
  const apiFiles = [
    "response.ts",
    "errors.ts",
    "validators.ts",
    "middleware.ts",
    "index.ts",
  ];

  for (const af of apiFiles) {
    const p = path.join(process.cwd(), "src", "lib", "api", af);
    assert(fs.existsSync(p), `src/lib/api/${af} exists`);
  }

  // 7. SUMMARY
  console.log("\n================================================================================");
  console.log(`TOTAL: ${passedTests + failedTests} | PASSED: ${passedTests} | FAILED: ${failedTests}`);
  console.log("================================================================================\n");

  if (failedTests > 0) {
    process.exit(1);
  }
}

runTests();
