/* eslint-disable @typescript-eslint/no-require-imports */
/**
 * Shared CJS test helpers for KURONEX live integration, E2E, security & integrity suites.
 */

const fs = require("fs");
const path = require("path");
const { PrismaClient } = require("@prisma/client");

function loadLocalEnv() {
  const envPath = path.join(process.cwd(), ".env");
  if (!fs.existsSync(envPath)) return;
  const lines = fs.readFileSync(envPath, "utf-8").split(/\r?\n/);
  for (const raw of lines) {
    const line = raw.trim();
    if (!line || line.startsWith("#")) continue;
    const eqIdx = line.indexOf("=");
    if (eqIdx === -1) continue;
    const key = line.slice(0, eqIdx).trim();
    let val = line.slice(eqIdx + 1).trim();
    if (
      (val.startsWith("\"") && val.endsWith("\"")) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    if (!process.env[key]) {
      process.env[key] = val;
    }
  }
}

let cachedPrisma = null;
function getPrisma() {
  loadLocalEnv();
  if (!cachedPrisma) {
    cachedPrisma = new PrismaClient();
  }
  return cachedPrisma;
}

function extractSessionCookie(res) {
  const list = res.headers.getSetCookie
    ? res.headers.getSetCookie()
    : [res.headers.get("set-cookie") || ""];
  for (const entry of list) {
    const match = entry.match(/kuronex_session=([^;]+)/);
    if (match) return `kuronex_session=${match[1]}`;
  }
  return "";
}

async function createTempAdmin(baseUrl, prefix = "test_admin") {
  loadLocalEnv();
  const passkey = process.env.ADMIN_SETUP_PASSKEY;
  if (!passkey) {
    throw new Error("ADMIN_SETUP_PASSKEY missing in environment or .env");
  }
  const shortPrefix = prefix.slice(0, 10);
  const suffix = `${Date.now().toString(36)}${Math.floor(Math.random() * 1000)}`;
  const username = `${shortPrefix}_${suffix}`.slice(0, 28);
  const email = `${username}@kuronex.internal`;
  const password = `AdminTestPass#${suffix}`;

  const res = await fetch(`${baseUrl}/api/admin/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      username,
      email,
      password,
      confirmPassword: password,
      passkey,
      role: "super_admin",
    }),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(`Failed to register temp admin (${res.status}): ${data.error || "Unknown"}`);
  }

  return {
    cookie: extractSessionCookie(res),
    user: data.user,
    username,
    email,
    password,
    passkey,
  };
}

async function cleanupTestRecords({
  usernames = [],
  userIds = [],
  emails = [],
  announcementIds = [],
  waitlistEmails = [],
  pitchIds = [],
  submissionIds = [],
  buildIds = [],
  downloadEventIds = [],
  studioIds = [],
} = {}) {
  const prisma = getPrisma();
  const resolvedUserIds = new Set(userIds.filter(Boolean));

  const cleanUsernames = usernames.filter(Boolean);
  const cleanEmails = emails.filter(Boolean).map((e) => e.toLowerCase());

  if (cleanUsernames.length > 0 || cleanEmails.length > 0) {
    const found = await prisma.user.findMany({
      where: {
        OR: [
          ...(cleanUsernames.length > 0 ? [{ username: { in: cleanUsernames } }] : []),
          ...(cleanEmails.length > 0 ? [{ email: { in: cleanEmails } }] : []),
        ],
      },
      select: { id: true, username: true },
    });
    for (const u of found) {
      resolvedUserIds.add(u.id);
      if (!cleanUsernames.includes(u.username)) {
        cleanUsernames.push(u.username);
      }
    }
  }

  const allUserIds = Array.from(resolvedUserIds);

  if (allUserIds.length > 0) {
    await prisma.session.deleteMany({ where: { userId: { in: allUserIds } } });
    await prisma.userLibrary.deleteMany({ where: { userId: { in: allUserIds } } });
    await prisma.downloadEvent.deleteMany({ where: { userId: { in: allUserIds } } });
    await prisma.platformEvent.deleteMany({ where: { userId: { in: allUserIds } } });
    await prisma.developerBuild.deleteMany({ where: { userId: { in: allUserIds } } });
    await prisma.developerSubmission.deleteMany({ where: { userId: { in: allUserIds } } });
    await prisma.developerStudio.deleteMany({ where: { ownerUserId: { in: allUserIds } } });
  }

  if (studioIds.filter(Boolean).length > 0) {
    await prisma.developerStudio.deleteMany({ where: { id: { in: studioIds.filter(Boolean) } } });
  }
  if (submissionIds.filter(Boolean).length > 0) {
    await prisma.developerSubmission.deleteMany({ where: { id: { in: submissionIds.filter(Boolean) } } });
  }
  if (buildIds.filter(Boolean).length > 0) {
    await prisma.developerBuild.deleteMany({ where: { id: { in: buildIds.filter(Boolean) } } });
  }
  if (pitchIds.filter(Boolean).length > 0) {
    await prisma.developerPitch.deleteMany({ where: { id: { in: pitchIds.filter(Boolean) } } });
  }
  if (waitlistEmails.filter(Boolean).length > 0) {
    await prisma.waitlistEntry.deleteMany({
      where: { email: { in: waitlistEmails.filter(Boolean).map((e) => e.toLowerCase()) } },
    });
  }
  if (downloadEventIds.filter(Boolean).length > 0) {
    await prisma.downloadEvent.deleteMany({ where: { id: { in: downloadEventIds.filter(Boolean) } } });
  }
  if (announcementIds.filter(Boolean).length > 0) {
    await prisma.announcement.deleteMany({ where: { id: { in: announcementIds.filter(Boolean) } } });
  }

  if (cleanUsernames.length > 0) {
    await prisma.auditLog.deleteMany({
      where: {
        OR: [
          { actorUsername: { in: cleanUsernames } },
          { target: { in: cleanUsernames } },
        ],
      },
    });
  }

  if (allUserIds.length > 0) {
    await prisma.user.deleteMany({ where: { id: { in: allUserIds } } });
  }
}

async function disconnectPrisma() {
  if (cachedPrisma) {
    await cachedPrisma.$disconnect();
    cachedPrisma = null;
  }
}

module.exports = {
  loadLocalEnv,
  getPrisma,
  extractSessionCookie,
  createTempAdmin,
  cleanupTestRecords,
  disconnectPrisma,
};
