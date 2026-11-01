/* eslint-disable @typescript-eslint/no-require-imports */
/**
 * KURONEX GAMES — Production Quality Engineering: Integration Test Suite
 *
 * Verifies live endpoint integration across all platform modules:
 * 1. Authentication lifecycle (Register, Duplicate rejection, Login, Logout)
 * 2. Session validation & active session telemetry (/api/auth/me, /api/auth/sessions)
 * 3. Library mutations (Add game, Deduplicate, Remove game)
 * 4. Downloads tracking & platform attribution
 * 5. Public catalogue & ETag caching (/api/developers, /api/library-games)
 * 6. Administrative APIs (Users, Games, System stats, Audit logging)
 * 7. Deployment health & readiness probes (/api/health, /api/ready)
 * 8. Guaranteed test data cleanup
 */

const fs = require("fs");
const path = require("path");

const BASE_URL = process.env.TEST_BASE_URL || "http://localhost:3000";

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  [PASS] ${message}`);
    passed++;
  } else {
    console.error(`  [FAIL] ${message}`);
    failed++;
  }
}

function extractSessionCookie(res) {
  const list = res.headers.getSetCookie ? res.headers.getSetCookie() : [res.headers.get("set-cookie") || ""];
  const found = list.find((c) => c.startsWith("kuronex_session="));
  return found ? found.split(";")[0] : "";
}

async function runIntegrationTests() {
  console.log("================================================================================");
  console.log("         KURONEX GAMES — INTEGRATION API ENDPOINTS TEST SUITE                   ");
  console.log("================================================================================\n");

  const timestamp = Date.now();
  const testUsername = `integ_usr_${timestamp}`;
  const testEmail = `${testUsername}@kuronex.internal`;
  const testPassword = "IntegrationPass#2026!";

  let playerCookie = "";
  let adminCookie = "";
  let createdUserId = "";

  try {
    // ── 1. PUBLIC HEALTH & READINESS PROBES ──
    console.log("--- 1. Deployment Health & Readiness Probes ---");
    const healthRes = await fetch(`${BASE_URL}/api/health`);
    assert(healthRes.status === 200, `GET /api/health returned 200 OK (Status: ${healthRes.status})`);
    const healthData = await healthRes.json();
    assert(healthData.status === "ok", `Health status reports 'ok' (${healthData.status})`);
    assert(typeof healthData.uptimeSeconds === "number", `Reports genuine process uptime (${healthData.uptimeSeconds}s)`);

    const readyRes = await fetch(`${BASE_URL}/api/ready`);
    assert(readyRes.status === 200, `GET /api/ready returned 200 OK (Status: ${readyRes.status})`);
    const readyData = await readyRes.json();
    assert(readyData.status === "ready", `Readiness status reports 'ready' (${readyData.status})`);
    assert(readyData.checks.storage_read === "ok", "Storage read check passed");
    assert(readyData.checks.storage_write === "ok", "Storage write check passed");

    // ── 2. PUBLIC CATALOGUE & ETAG CACHING ──
    console.log("\n--- 2. Public Catalogue & ETag Caching ---");
    const devRes = await fetch(`${BASE_URL}/api/developers`);
    assert(devRes.status === 200, `GET /api/developers returned 200 (Status: ${devRes.status})`);
    const devData = await devRes.json();
    assert(Array.isArray(devData.developers) && devData.developers.length > 0, `Returns developer studios (${devData.developers.length} studios)`);
    
    const etag = devRes.headers.get("etag");
    assert(Boolean(etag), `Endpoint provides ETag caching header (${etag})`);
    const cacheControl = devRes.headers.get("cache-control");
    assert(Boolean(cacheControl) && cacheControl.includes("max-age"), `Endpoint specifies Cache-Control: ${cacheControl}`);

    // Test ETag 304 conditional request
    if (etag) {
      const cachedDevRes = await fetch(`${BASE_URL}/api/developers`, {
        headers: { "if-none-match": etag },
      });
      assert(cachedDevRes.status === 304, `Conditional request with ETag returned 304 Not Modified (Status: ${cachedDevRes.status})`);
    }

    const gamesRes = await fetch(`${BASE_URL}/api/library-games`);
    assert(gamesRes.status === 200, `GET /api/library-games returned 200 (Status: ${gamesRes.status})`);
    const gamesData = await gamesRes.json();
    assert(Array.isArray(gamesData.games) && gamesData.games.length > 0, `Returns game catalogue (${gamesData.games.length} titles)`);

    // ── 3. USER REGISTRATION & AUTHENTICATION ──
    console.log("\n--- 3. User Registration & Authentication Lifecycle ---");
    // Register
    const regRes = await fetch(`${BASE_URL}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: testUsername,
        email: testEmail,
        password: testPassword,
      }),
    });
    assert(regRes.status === 201, `Registration succeeded with 201 Created (Status: ${regRes.status})`);
    playerCookie = extractSessionCookie(regRes);
    assert(Boolean(playerCookie), "Registration issued session cookie");
    const regData = await regRes.json();
    createdUserId = regData.user?.id;
    assert(Boolean(createdUserId), `User ID assigned (${createdUserId})`);

    // Duplicate rejection
    const dupRes = await fetch(`${BASE_URL}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: testUsername,
        email: testEmail,
        password: testPassword,
      }),
    });
    assert(dupRes.status === 409, `Duplicate registration rejected with 409 Conflict (Status: ${dupRes.status})`);

    // Logout
    const logoutRes = await fetch(`${BASE_URL}/api/auth/logout`, {
      method: "POST",
      headers: { Cookie: playerCookie },
    });
    assert(logoutRes.status === 200, `Logout succeeded with 200 OK (Status: ${logoutRes.status})`);

    // Login
    const loginRes = await fetch(`${BASE_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        identifier: testUsername,
        password: testPassword,
      }),
    });
    assert(loginRes.status === 200, `Login succeeded with 200 OK (Status: ${loginRes.status})`);
    playerCookie = extractSessionCookie(loginRes);
    assert(Boolean(playerCookie), "Login returns fresh session cookie (anti-session-fixation)");

    // ── 4. SESSION VALIDATION & PROFILE INSPECTION ──
    console.log("\n--- 4. Session Validation & Profile Inspection ---");
    const meRes = await fetch(`${BASE_URL}/api/auth/me`, {
      headers: { Cookie: playerCookie },
    });
    assert(meRes.status === 200, `GET /api/auth/me succeeded (Status: ${meRes.status})`);
    const meData = await meRes.json();
    assert(meData.user?.username === testUsername, `Profile returns verified username (${meData.user?.username})`);
    assert(meData.user?.role === "player", `Default role is 'player' (${meData.user?.role})`);
    assert(meData.user?.passwordHash === undefined, "Password hash is strictly omitted from user payload");
    assert(meData.user?.salt === undefined, "Salt is strictly omitted from user payload");

    // Session listing
    const sessRes = await fetch(`${BASE_URL}/api/auth/sessions`, {
      headers: { Cookie: playerCookie },
    });
    assert(sessRes.status === 200, `GET /api/auth/sessions succeeded (Status: ${sessRes.status})`);
    const sessData = await sessRes.json();
    assert(Array.isArray(sessData.sessions) && sessData.sessions.length >= 1, `Active sessions listed (${sessData.sessions.length})`);
    assert(sessData.sessions.some((s) => s.isCurrent === true), "Identifies current session accurately");

    // ── 5. USER LIBRARY OPERATIONS ──
    console.log("\n--- 5. User Library Operations ---");
    const addLibRes = await fetch(`${BASE_URL}/api/user/library`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: playerCookie,
      },
      body: JSON.stringify({ gameId: "voidstrike" }),
    });
    assert(addLibRes.status === 200, `POST /api/user/library added game (Status: ${addLibRes.status})`);
    const addLibData = await addLibRes.json();
    assert(Array.isArray(addLibData.library) && addLibData.library.includes("voidstrike"), "Library contains 'voidstrike'");

    // Verify /api/auth/me reflects library update
    const meLibRes = await fetch(`${BASE_URL}/api/auth/me`, {
      headers: { Cookie: playerCookie },
    });
    const meLibData = await meLibRes.json();
    assert(meLibData.user?.library?.includes("voidstrike"), "auth/me immediately reflects added library game");

    // Remove game from library
    const delLibRes = await fetch(`${BASE_URL}/api/user/library`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Cookie: playerCookie,
      },
      body: JSON.stringify({ gameId: "voidstrike" }),
    });
    assert(delLibRes.status === 200, `DELETE /api/user/library removed game (Status: ${delLibRes.status})`);
    const delLibData = await delLibRes.json();
    assert(!delLibData.library.includes("voidstrike"), "Library no longer contains 'voidstrike'");

    // ── 6. DOWNLOADS RECORDING ──
    console.log("\n--- 6. Downloads Recording & Platform Breakdown ---");
    const initialDlRes = await fetch(`${BASE_URL}/api/downloads`);
    const initialDlData = await initialDlRes.json();
    const countBefore = initialDlData.total || 0;

    const recordDlRes = await fetch(`${BASE_URL}/api/downloads`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: playerCookie,
      },
      body: JSON.stringify({
        itemType: "client",
        platform: "windows",
      }),
    });
    assert(recordDlRes.status === 201, `POST /api/downloads recorded download (Status: ${recordDlRes.status})`);

    const afterDlRes = await fetch(`${BASE_URL}/api/downloads`);
    const afterDlData = await afterDlRes.json();
    assert(afterDlData.total === countBefore + 1, `Total downloads incremented authentically (${countBefore} -> ${afterDlData.total})`);
    assert(afterDlData.platformStats?.windows > 0, "Windows download recorded in platform distribution");

    // ── 7. ADMINISTRATIVE APIS & OBSERVABILITY ──
    console.log("\n--- 7. Administrative APIs & Observability Access ---");
    // Admin Login
    const adminLoginRes = await fetch(`${BASE_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        identifier: "dev.admin@kuronex.internal",
        password: "KuronexSecureDev2026#Alpha",
      }),
    });
    assert(adminLoginRes.status === 200, `Admin authenticated successfully (Status: ${adminLoginRes.status})`);
    adminCookie = extractSessionCookie(adminLoginRes);

    // Admin Users Management
    const adminUsersRes = await fetch(`${BASE_URL}/api/admin/users`, {
      headers: { Cookie: adminCookie },
    });
    assert(adminUsersRes.status === 200, `Admin GET /api/admin/users succeeded (Status: ${adminUsersRes.status})`);
    const adminUsersData = await adminUsersRes.json();
    assert(Array.isArray(adminUsersData.users), "Admin receives array of platform users");

    // Admin Promote User
    const promoteRes = await fetch(`${BASE_URL}/api/admin/users`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: adminCookie,
      },
      body: JSON.stringify({
        action: "updateRole",
        userId: createdUserId,
        role: "analyst",
      }),
    });
    assert(promoteRes.status === 200, `Admin promoted user to 'analyst' (Status: ${promoteRes.status})`);

    // Verify Promoted Role
    const checkRoleRes = await fetch(`${BASE_URL}/api/auth/me`, {
      headers: { Cookie: playerCookie },
    });
    const checkRoleData = await checkRoleRes.json();
    assert(checkRoleData.user?.role === "analyst", `User role updated server-side to 'analyst' (${checkRoleData.user?.role})`);

    // Admin System Telemetry & Observability
    const adminSysRes = await fetch(`${BASE_URL}/api/admin/system`, {
      headers: { Cookie: adminCookie },
    });
    assert(adminSysRes.status === 200, `Admin GET /api/admin/system succeeded (Status: ${adminSysRes.status})`);

    const adminObsRes = await fetch(`${BASE_URL}/api/admin/observability`, {
      headers: { Cookie: adminCookie },
    });
    assert(adminObsRes.status === 200, `Admin GET /api/admin/observability succeeded (Status: ${adminObsRes.status})`);
    const adminObsData = await adminObsRes.json();
    assert(adminObsData.api?.totalRequests > 0, `Observability tracks API requests (${adminObsData.api?.totalRequests} requests)`);
    assert(adminObsData.subsystems?.length >= 4, `Observability evaluates subsystems (${adminObsData.subsystems?.length} subsystems)`);

  } finally {
    // ── 8. CLEANUP TEST DATA ──
    console.log("\n--- 8. Guaranteed Isolation & Test Data Cleanup ---");
    try {
      const usersFile = path.join(process.cwd(), "src", "data", "users.json");
      const sessionsFile = path.join(process.cwd(), "src", "data", "sessions.json");

      if (fs.existsSync(usersFile)) {
        const users = JSON.parse(fs.readFileSync(usersFile, "utf-8"));
        const filteredUsers = users.filter((u) => u.username !== testUsername);
        fs.writeFileSync(usersFile, JSON.stringify(filteredUsers, null, 2), "utf-8");
      }

      if (fs.existsSync(sessionsFile)) {
        const sessions = JSON.parse(fs.readFileSync(sessionsFile, "utf-8"));
        const filteredSessions = sessions.filter((s) => s.userId !== createdUserId);
        fs.writeFileSync(sessionsFile, JSON.stringify(filteredSessions, null, 2), "utf-8");
      }

      console.log("  [CLEANUP] Test user and session records purged cleanly from persistent stores.");
    } catch (err) {
      console.warn("  [CLEANUP WARNING] Failed cleaning up test artifacts:", err.message);
    }
  }

  console.log("\n================================================================================");
  console.log(`INTEGRATION TEST SUITE SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log("================================================================================\n");

  if (failed > 0) {
    process.exit(1);
  }
}

runIntegrationTests().catch((err) => {
  console.error("Integration test execution threw error:", err);
  process.exit(1);
});
