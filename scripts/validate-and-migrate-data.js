/* eslint-disable @typescript-eslint/no-require-imports */
/**
 * KURONEX GAMES - Data Validation & Migration Inspector
 * Validates every persisted record and in-memory catalogue entry against relational constraints.
 */

const fs = require("fs");
const path = require("path");

function validateAllData() {
  console.log("=== STARTING KURONEX DATA VALIDATION & INTEGRITY AUDIT ===\n");

  const errors = [];
  const warnings = [];
  const stats = {};

  const dataDir = path.join(process.cwd(), "src", "data");

  // 1. Validate Users
  const usersPath = path.join(dataDir, "users.json");
  const users = JSON.parse(fs.readFileSync(usersPath, "utf-8"));
  stats.users = users.length;

  const userIds = new Set();
  const usernames = new Set();
  const emails = new Set();
  let adminFound = false;

  for (const [index, u] of users.entries()) {
    if (!u.id) errors.push(`User at index ${index} missing id`);
    if (userIds.has(u.id)) errors.push(`Duplicate user id: ${u.id}`);
    userIds.add(u.id);

    if (!u.username || u.username.length < 3) errors.push(`Invalid username for user ${u.id}: '${u.username}'`);
    if (usernames.has(u.username.toLowerCase())) errors.push(`Duplicate username: ${u.username}`);
    usernames.add(u.username.toLowerCase());

    if (!u.email || !u.email.includes("@")) errors.push(`Invalid email for user ${u.id}: '${u.email}'`);
    if (emails.has(u.email.toLowerCase())) errors.push(`Duplicate email: ${u.email}`);
    emails.add(u.email.toLowerCase());

    if (!u.passwordHash || !u.salt) errors.push(`User ${u.username} missing cryptographic passwordHash or salt`);
    const validRoles = [
      "player",
      "developer",
      "analyst",
      "content_manager",
      "game_manager",
      "moderator",
      "admin",
      "super_admin",
    ];
    if (!validRoles.includes(u.role)) errors.push(`Invalid role '${u.role}' for user ${u.username}`);

    if (u.role === "admin" || u.role === "super_admin") {
      adminFound = true;
    }
  }

  if (!adminFound) {
    warnings.push("No administrator account with role='admin' was found in users.json");
  }

  // 2. Validate Sessions
  const sessionsPath = path.join(dataDir, "sessions.json");
  const sessions = JSON.parse(fs.readFileSync(sessionsPath, "utf-8") || "[]");
  stats.sessions = sessions.length;

  for (const s of sessions) {
    if (!s.token || s.token.length < 32) errors.push(`Malformed session token: ${s.token}`);
    if (!userIds.has(s.userId)) {
      warnings.push(`Orphaned session token pointing to non-existent user: ${s.userId}`);
    }
    if (typeof s.expiresAt !== "number" || s.expiresAt <= 0) {
      errors.push(`Invalid session expiresAt for token ${s.token}: ${s.expiresAt}`);
    }
  }

  // 3. Validate Developers
  const devsPath = path.join(dataDir, "developers.json");
  const developers = JSON.parse(fs.readFileSync(devsPath, "utf-8"));
  stats.developers = developers.length;

  const devIds = new Set();
  const validTiers = ["Premier Partner", "Studio Partner", "Indie Pioneer"];

  for (const d of developers) {
    if (!d.id) errors.push(`Developer missing id: ${JSON.stringify(d)}`);
    if (devIds.has(d.id)) errors.push(`Duplicate developer id: ${d.id}`);
    devIds.add(d.id);

    if (!d.name) errors.push(`Developer ${d.id} missing name`);
    if (!validTiers.includes(d.partnerTier)) errors.push(`Developer ${d.name} has invalid partnerTier: ${d.partnerTier}`);
    if (typeof d.showInTicker !== "boolean") errors.push(`Developer ${d.name} showInTicker is not boolean`);
  }

  // 4. Validate Library Slots
  const libraryPath = path.join(dataDir, "library-games.json");
  const librarySlots = JSON.parse(fs.readFileSync(libraryPath, "utf-8"));
  stats.librarySlots = librarySlots.length;

  const slotIds = new Set();
  const validCategories = ["Action", "RPG", "Sci-Fi", "Strategy", "Survival", "Shooter"];

  for (const s of librarySlots) {
    if (!s.id) errors.push(`Library slot missing id`);
    if (slotIds.has(s.id)) errors.push(`Duplicate library slot id: ${s.id}`);
    slotIds.add(s.id);

    if (!validCategories.includes(s.category)) errors.push(`Slot ${s.id} has invalid category: ${s.category}`);
    if (typeof s.slotNumber !== "number" || s.slotNumber < 1 || s.slotNumber > 6) {
      errors.push(`Slot ${s.id} has invalid slotNumber: ${s.slotNumber}`);
    }
    if (typeof s.isEmpty !== "boolean") errors.push(`Slot ${s.id} isEmpty must be boolean`);
  }

  // 5. Validate Announcements
  const annPath = path.join(dataDir, "announcements.json");
  const announcements = JSON.parse(fs.readFileSync(annPath, "utf-8"));
  stats.announcements = announcements.length;

  const annIds = new Set();
  const validPriorities = ["LOW", "NORMAL", "HIGH", "URGENT"];
  const validAnnCats = ["UPDATE", "MAINTENANCE", "COMMUNITY", "PROMOTION"];

  for (const a of announcements) {
    if (!a.id) errors.push(`Announcement missing id`);
    if (annIds.has(a.id)) errors.push(`Duplicate announcement id: ${a.id}`);
    annIds.add(a.id);

    if (!a.title || !a.message) errors.push(`Announcement ${a.id} missing title or message`);
    if (!validPriorities.includes(a.priority)) errors.push(`Announcement ${a.id} invalid priority: ${a.priority}`);
    if (!validAnnCats.includes(a.category)) errors.push(`Announcement ${a.id} invalid category: ${a.category}`);
    if (typeof a.isActive !== "boolean") errors.push(`Announcement ${a.id} isActive must be boolean`);
  }

  // 6. Validate Platform Settings
  const settingsPath = path.join(dataDir, "platform-settings.json");
  const settings = JSON.parse(fs.readFileSync(settingsPath, "utf-8"));
  stats.settingsKeys = Object.keys(settings).length;

  const requiredSettings = [
    "platformName",
    "tagline",
    "maintenanceMode",
    "registrationOpen",
    "clientVersion",
    "clientDownloadUrl",
    "supportEmail",
    "sessionTimeoutDays",
  ];

  for (const key of requiredSettings) {
    if (settings[key] === undefined) {
      errors.push(`Missing mandatory platform setting: '${key}'`);
    }
  }

  // 7. Validate Audit Logs
  const auditPath = path.join(dataDir, "audit-logs.json");
  const logs = JSON.parse(fs.readFileSync(auditPath, "utf-8"));
  stats.auditLogs = logs.length;

  for (const l of logs) {
    if (!l.id || !l.action || !l.category || !l.actor || !l.target) {
      errors.push(`Malformed audit log entry: ${JSON.stringify(l)}`);
    }
    if (isNaN(new Date(l.timestamp).getTime())) {
      errors.push(`Invalid timestamp in audit log ${l.id}: ${l.timestamp}`);
    }
  }

  // 8. Output Report
  console.log("Record Count Breakdown:");
  for (const [k, v] of Object.entries(stats)) {
    console.log(`  - ${k}: ${v} valid records`);
  }

  if (warnings.length > 0) {
    console.log(`\nWarnings (${warnings.length}):`);
    warnings.forEach((w) => console.warn(`  [WARN] ${w}`));
  }

  if (errors.length > 0) {
    console.error(`\nValidation Errors (${errors.length}):`);
    errors.forEach((e) => console.error(`  [FAIL] ${e}`));
    throw new Error(`Data validation failed with ${errors.length} errors.`);
  }

  console.log("\n[SUCCESS] All data records passed strict schema validation with 0 errors!");
  return { stats, errors, warnings };
}

if (require.main === module) {
  validateAllData();
}

module.exports = { validateAllData };
