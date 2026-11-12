/* eslint-disable @typescript-eslint/no-require-imports */
/**
 * KURONEX GAMES — Production Quality Engineering: Integration Test Suite
 *
 * Verifies live endpoint integration across all platform modules:
 * 1. Deployment health & readiness probes (/api/health, /api/ready)
 * 2. Public catalogue & ETag caching (/api/developers, /api/library-games)
 * 3. Authentication lifecycle (Register, Duplicate rejection, Login, Logout)
 * 4. Session validation & active session telemetry (/api/auth/me, /api/auth/sessions)
 * 5. Library mutations (Add game, Deduplicate, Remove game)
 * 6. Downloads tracking & platform attribution (/api/downloads)
 * 7. Administrative APIs & observability (/api/admin/*)
 * 8. Domain APIs: Waitlist, Developer Pitch, Studio Portal, Promotions & Builds
 * 9. Guaranteed SQLite/Prisma test data cleanup
 */

const {
  getPrisma,
  extractSessionCookie,
  createTempAdmin,
  cleanupTestRecords,
  disconnectPrisma,
} = require("./test-helpers");

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

async function runIntegrationTests() {
  console.log("================================================================================");
  console.log("         KURONEX GAMES — INTEGRATION API ENDPOINTS TEST SUITE                   ");
  console.log("================================================================================\n");

  const timestamp = Date.now();
  const testUsername = `integ_usr_${timestamp}`;
  const testEmail = `${testUsername}@kuronex.internal`;
  const testPassword = "IntegrationPass#2026!";

  const devUsername = `integ_dev_${timestamp}`;
  const devEmail = `${devUsername}@kuronex.internal`;
  const waitlistEmail = `waitlist_${timestamp}@kuronex.internal`;

  let playerCookie = "";
  let devCookie = "";
  let tempAdmin = null;
  let createdUserId = "";
  let createdDevId = "";
  let createdDlEventId = "";
  let createdPitchId = "";
  let createdSubmissionId = "";
  let createdBuildId = "";
  let createdPromoId = "";

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
    assert(readyData.checks.database_read === "ok" && readyData.checks.storage_read === "ok", "Database read check passed");
    assert(readyData.checks.database_write === "ok" && readyData.checks.storage_write === "ok", "Database write check passed");

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

    const logoutRes = await fetch(`${BASE_URL}/api/auth/logout`, {
      method: "POST",
      headers: { Cookie: playerCookie },
    });
    assert(logoutRes.status === 200, `Logout succeeded with 200 OK (Status: ${logoutRes.status})`);

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

    const meLibRes = await fetch(`${BASE_URL}/api/auth/me`, {
      headers: { Cookie: playerCookie },
    });
    const meLibData = await meLibRes.json();
    assert(meLibData.user?.library?.includes("voidstrike"), "auth/me immediately reflects added library game");

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

    // ── 6. DOWNLOADS & WAITLIST ──
    console.log("\n--- 6. Downloads Recording & Alpha Waitlist ---");
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
    const recordDlData = await recordDlRes.json();
    createdDlEventId = recordDlData.event?.id || "";

    const afterDlRes = await fetch(`${BASE_URL}/api/downloads`);
    const afterDlData = await afterDlRes.json();
    assert(afterDlData.total === countBefore + 1, `Total downloads incremented authentically (${countBefore} -> ${afterDlData.total})`);
    assert(afterDlData.platformStats?.windows > 0, "Windows download recorded in platform distribution");

    const waitlistRes = await fetch(`${BASE_URL}/api/waitlist`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: waitlistEmail,
        platform: "linux",
        source: "integration-test",
      }),
    });
    assert(waitlistRes.status === 201, `POST /api/waitlist created waitlist reservation (Status: ${waitlistRes.status})`);
    const waitlistData = await waitlistRes.json();
    assert(Boolean(waitlistData.entry?.vipToken) && waitlistData.entry?.queueNumber >= 1, `Waitlist issued VIP token (${waitlistData.entry?.vipToken})`);

    // ── 7. DEVELOPER PITCH & STUDIO PORTAL ──
    console.log("\n--- 7. Developer Pitch & Studio Portal Persistence ---");
    const pitchRes = await fetch(`${BASE_URL}/api/developers/pitch`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        studioName: `Studio_${timestamp}`,
        email: waitlistEmail,
        projectTitle: "Project Horizon",
        message: "Testing end-to-end studio pitch creation.",
      }),
    });
    assert(pitchRes.status === 201, `POST /api/developers/pitch persisted pitch (Status: ${pitchRes.status})`);
    const pitchData = await pitchRes.json();
    createdPitchId = pitchData.pitch?.id || "";

    const devRegRes = await fetch(`${BASE_URL}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: devUsername,
        email: devEmail,
        password: testPassword,
        role: "developer",
      }),
    });
    assert(devRegRes.status === 201, `Developer registration succeeded (Status: ${devRegRes.status})`);
    devCookie = extractSessionCookie(devRegRes);
    const devRegData = await devRegRes.json();
    createdDevId = devRegData.user?.id || "";

    const subPostRes = await fetch(`${BASE_URL}/api/developer/submissions`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: devCookie },
      body: JSON.stringify({
        title: `TestGame_${timestamp}`,
        category: "Action",
        targetEngine: "Unreal Engine 5",
        targetOs: ["Windows"],
        summary: "Integration test game submission summary.",
      }),
    });
    assert(subPostRes.status === 201, `POST /api/developer/submissions created submission (Status: ${subPostRes.status})`);
    const subPostData = await subPostRes.json();
    createdSubmissionId = subPostData.submission?.id || "";

    const bldPostRes = await fetch(`${BASE_URL}/api/developer/builds`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: devCookie },
      body: JSON.stringify({
        gameTitle: `TestGame_${timestamp}`,
        versionTag: "v0.9.1-test",
        channel: "Beta",
        targetOs: "Windows (DirectX 12)",
        executableName: "testgame_win64.exe",
      }),
    });
    assert(bldPostRes.status === 201, `POST /api/developer/builds registered binary build (Status: ${bldPostRes.status})`);
    const bldPostData = await bldPostRes.json();
    createdBuildId = bldPostData.build?.id || "";

    const profPutRes = await fetch(`${BASE_URL}/api/developer/profile`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", Cookie: devCookie },
      body: JSON.stringify({
        studioName: `Verified Studio ${timestamp}`,
        tagline: "Automated portal test studio",
        headquarters: "Tokyo",
        website: "https://kuronex.games",
        teamSize: "10-25",
        primaryEngine: "Vulkan",
        bio: "Verified persisted studio profile.",
      }),
    });
    assert(profPutRes.status === 200, `PUT /api/developer/profile updated studio profile (Status: ${profPutRes.status})`);

    // ── 8. ADMINISTRATIVE APIS, PROMOTIONS & OBSERVABILITY ──
    console.log("\n--- 8. Administrative APIs, Promotions & Observability Access ---");
    tempAdmin = await createTempAdmin(BASE_URL, "integ_admin");
    assert(Boolean(tempAdmin.cookie), `Provisioned & authenticated temp admin (${tempAdmin.username})`);

    const adminUsersRes = await fetch(`${BASE_URL}/api/admin/users`, {
      headers: { Cookie: tempAdmin.cookie },
    });
    assert(adminUsersRes.status === 200, `Admin GET /api/admin/users succeeded (Status: ${adminUsersRes.status})`);
    const adminUsersData = await adminUsersRes.json();
    assert(Array.isArray(adminUsersData.users), "Admin receives array of platform users");

    const promoteRes = await fetch(`${BASE_URL}/api/admin/users`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: tempAdmin.cookie,
      },
      body: JSON.stringify({
        action: "updateRole",
        userId: createdUserId,
        role: "analyst",
      }),
    });
    assert(promoteRes.status === 200, `Admin promoted user to 'analyst' (Status: ${promoteRes.status})`);

    const checkRoleRes = await fetch(`${BASE_URL}/api/auth/me`, {
      headers: { Cookie: playerCookie },
    });
    const checkRoleData = await checkRoleRes.json();
    assert(checkRoleData.user?.role === "analyst", `User role updated server-side to 'analyst' (${checkRoleData.user?.role})`);

    const promoCreateRes = await fetch(`${BASE_URL}/api/admin/promotions`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: tempAdmin.cookie },
      body: JSON.stringify({
        title: `Test Promo ${timestamp}`,
        tagline: "Integration check",
        promoType: "KEY_DROP",
        maxClaims: 50,
      }),
    });
    assert(promoCreateRes.status === 201, `POST /api/admin/promotions created promotion (Status: ${promoCreateRes.status})`);
    const promoCreateData = await promoCreateRes.json();
    createdPromoId = promoCreateData.promotion?.id || "";

    const adminBuildsRes = await fetch(`${BASE_URL}/api/admin/builds`, {
      headers: { Cookie: tempAdmin.cookie },
    });
    assert(adminBuildsRes.status === 200, `GET /api/admin/builds succeeded (Status: ${adminBuildsRes.status})`);

    const adminSysRes = await fetch(`${BASE_URL}/api/admin/system`, {
      headers: { Cookie: tempAdmin.cookie },
    });
    assert(adminSysRes.status === 200, `Admin GET /api/admin/system succeeded (Status: ${adminSysRes.status})`);

    const adminObsRes = await fetch(`${BASE_URL}/api/admin/observability`, {
      headers: { Cookie: tempAdmin.cookie },
    });
    assert(adminObsRes.status === 200, `Admin GET /api/admin/observability succeeded (Status: ${adminObsRes.status})`);
    const adminObsData = await adminObsRes.json();
    assert(adminObsData.api?.totalRequests > 0, `Observability tracks API requests (${adminObsData.api?.totalRequests} requests)`);
    assert(adminObsData.subsystems?.length >= 4, `Observability evaluates subsystems (${adminObsData.subsystems?.length} subsystems)`);
  } finally {
    console.log("\n--- 9. Guaranteed Isolation & Test Data Cleanup ---");
    try {
      const prisma = getPrisma();
      if (createdPromoId) {
        await prisma.promotion.deleteMany({ where: { id: createdPromoId } });
      }
      await cleanupTestRecords({
        usernames: [testUsername, devUsername, tempAdmin?.username],
        userIds: [createdUserId, createdDevId, tempAdmin?.user?.id],
        emails: [testEmail, devEmail, tempAdmin?.email],
        waitlistEmails: [waitlistEmail],
        pitchIds: [createdPitchId],
        submissionIds: [createdSubmissionId],
        buildIds: [createdBuildId],
        downloadEventIds: [createdDlEventId],
      });
      await prisma.platformEvent.deleteMany({
        where: {
          resourceId: { in: ["kuronex-waitlist", "kuronex-launcher-test"] },
          timestamp: { gte: new Date(timestamp - 5000) },
        },
      });
      await prisma.auditLog.deleteMany({
        where: {
          OR: [
            { target: { contains: `${timestamp}` } },
            { target: testUsername },
            { actorUsername: tempAdmin?.username || "__none__" },
          ],
        },
      });
      console.log("  [CLEANUP] Test users, sessions, studio submissions, promotions & events purged cleanly.");
    } catch (err) {
      console.warn("  [CLEANUP WARNING] Failed cleaning up test artifacts:", err.message);
    } finally {
      await disconnectPrisma();
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
