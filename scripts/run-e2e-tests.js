/* eslint-disable @typescript-eslint/no-require-imports */
/**
 * KURONEX GAMES — Production Quality Engineering: End-to-End Journey Test Suite
 *
 * Simulates complete user journeys through the platform against SQLite/Prisma:
 * ── JOURNEY 1: Authentic Player Lifecycle ──
 * ── JOURNEY 2: Administrator Governance & Telemetry ──
 * ── GUARANTEED CLEANUP ──
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

async function runE2ETests() {
  console.log("================================================================================");
  console.log("          KURONEX GAMES — END-TO-END USER JOURNEY VERIFICATION SUITE           ");
  console.log("================================================================================\n");

  const timestamp = Date.now();
  const playerUsername = `e2e_player_${timestamp}`;
  const playerEmail = `${playerUsername}@kuronex.internal`;
  const playerPassword = "E2EPlayerPass#2026!";

  let playerCookie = "";
  let tempAdmin = null;
  let createdPlayerId = "";
  let createdAnnouncementId = "";
  let createdDlEventId = "";

  try {
    // ══════════════════════════════════════════════════════════════════════════
    // JOURNEY 1: AUTHENTIC PLAYER LIFECYCLE
    // ══════════════════════════════════════════════════════════════════════════
    console.log("═══ JOURNEY 1: Authentic Player Lifecycle ═══");

    console.log("Step 1: Browsing public games and developer directory...");
    const browseRes = await fetch(`${BASE_URL}/api/library-games`);
    assert(browseRes.status === 200, "Catalogue loaded successfully (Status: 200)");
    const browseData = await browseRes.json();
    assert(Array.isArray(browseData.games) && browseData.games.length >= 5, `Catalogue returns populated titles (${browseData.games.length} titles)`);

    const devBrowseRes = await fetch(`${BASE_URL}/api/developers`);
    assert(devBrowseRes.status === 200, "Developer directory loaded successfully (Status: 200)");

    console.log("\nStep 2: Registering new player account...");
    const regRes = await fetch(`${BASE_URL}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: playerUsername,
        email: playerEmail,
        password: playerPassword,
      }),
    });
    assert(regRes.status === 201, `Account created with HTTP 201 Created (Status: ${regRes.status})`);
    playerCookie = extractSessionCookie(regRes);
    assert(Boolean(playerCookie), "HttpOnly session cookie issued upon registration");
    const regData = await regRes.json();
    createdPlayerId = regData.user?.id;
    assert(Boolean(createdPlayerId), `Player user ID assigned: ${createdPlayerId}`);

    console.log("\nStep 3: Validating session authentication and initial state...");
    const meRes = await fetch(`${BASE_URL}/api/auth/me`, {
      headers: { Cookie: playerCookie },
    });
    assert(meRes.status === 200, "Session profile retrieved successfully (Status: 200)");
    const meData = await meRes.json();
    assert(meData.user?.username === playerUsername, `Verified username matches registration (${meData.user?.username})`);
    assert(Array.isArray(meData.user?.library) && meData.user.library.length === 0, "Initial player library is empty array");

    console.log("\nStep 4: Adding title 'cyber-recon-2088' to personal library...");
    const addGameRes = await fetch(`${BASE_URL}/api/user/library`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: playerCookie,
      },
      body: JSON.stringify({ gameId: "cyber-recon-2088", action: "add" }),
    });
    assert(addGameRes.status === 200, `Game added to library (Status: ${addGameRes.status})`);
    const addGameData = await addGameRes.json();
    assert(addGameData.library?.includes("cyber-recon-2088"), "Response confirms 'cyber-recon-2088' in library");

    console.log("\nStep 5: Verifying persistent user library contains cartridge...");
    const libRes = await fetch(`${BASE_URL}/api/user/library`, {
      headers: { Cookie: playerCookie },
    });
    assert(libRes.status === 200, "User library fetched (Status: 200)");
    const libData = await libRes.json();
    assert(libData.library?.includes("cyber-recon-2088"), "Library persistence confirmed across requests");

    console.log("\nStep 6: Initiating and recording desktop client download event...");
    const dlRes = await fetch(`${BASE_URL}/api/downloads`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: playerCookie,
      },
      body: JSON.stringify({ itemType: "client", platform: "windows" }),
    });
    assert(dlRes.status === 201, `Download recorded successfully (Status: ${dlRes.status})`);
    const dlData = await dlRes.json();
    createdDlEventId = dlData.event?.id || "";

    console.log("\nStep 7: Logging out and asserting session invalidation...");
    const logoutRes = await fetch(`${BASE_URL}/api/auth/logout`, {
      method: "POST",
      headers: { Cookie: playerCookie },
    });
    assert(logoutRes.status === 200, `Logout executed (Status: ${logoutRes.status})`);

    const expiredMeRes = await fetch(`${BASE_URL}/api/auth/me`, {
      headers: { Cookie: playerCookie },
    });
    const expiredMeData = await expiredMeRes.json();
    assert(expiredMeData.user === null, "Session profile confirms null user following logout");

    // ══════════════════════════════════════════════════════════════════════════
    // JOURNEY 2: ADMINISTRATOR GOVERNANCE & TELEMETRY
    // ══════════════════════════════════════════════════════════════════════════
    console.log("\n═══ JOURNEY 2: Administrator Governance & Telemetry ═══");

    console.log("Step 1: Provisioning & authenticating test platform administrator...");
    tempAdmin = await createTempAdmin(BASE_URL, "e2e_admin");
    assert(Boolean(tempAdmin.cookie), "Admin session established with secure cookie");

    console.log("\nStep 2: Querying platform observability telemetry...");
    const obsRes = await fetch(`${BASE_URL}/api/admin/observability`, {
      headers: { Cookie: tempAdmin.cookie },
    });
    assert(obsRes.status === 200, `Observability snapshot retrieved (Status: ${obsRes.status})`);
    const obsData = await obsRes.json();
    assert(obsData.api?.totalRequests > 0, `Live API requests recorded (${obsData.api?.totalRequests} total requests)`);
    assert(obsData.subsystems?.length >= 4, `Subsystems monitored: ${obsData.subsystems?.map((s) => s.name).join(", ")}`);

    console.log("\nStep 3: Querying user directory and promoting player role...");
    const usersRes = await fetch(`${BASE_URL}/api/admin/users`, {
      headers: { Cookie: tempAdmin.cookie },
    });
    assert(usersRes.status === 200, `User directory queried (Status: ${usersRes.status})`);
    const usersData = await usersRes.json();
    const targetPlayer = usersData.users?.find((u) => u.id === createdPlayerId);
    assert(Boolean(targetPlayer), `Found created test player in administrative directory: ${targetPlayer?.username}`);

    const promoteRes = await fetch(`${BASE_URL}/api/admin/users`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: tempAdmin.cookie,
      },
      body: JSON.stringify({
        action: "updateRole",
        userId: createdPlayerId,
        role: "moderator",
      }),
    });
    assert(promoteRes.status === 200, `Promoted player to 'moderator' (Status: ${promoteRes.status})`);

    const verifyUserRes = await fetch(`${BASE_URL}/api/admin/users`, {
      headers: { Cookie: tempAdmin.cookie },
    });
    const verifyUserData = await verifyUserRes.json();
    const updatedPlayer = verifyUserData.users?.find((u) => u.id === createdPlayerId);
    assert(updatedPlayer?.role === "moderator", `Target user role is verified as 'moderator' (${updatedPlayer?.role})`);

    console.log("\nStep 4: Querying administrator game catalogue...");
    const adminGamesRes = await fetch(`${BASE_URL}/api/admin/games`, {
      headers: { Cookie: tempAdmin.cookie },
    });
    assert(adminGamesRes.status === 200, `Admin games catalogue loaded (Status: ${adminGamesRes.status})`);
    const adminGamesData = await adminGamesRes.json();
    assert(Array.isArray(adminGamesData.games) && adminGamesData.games.length > 0, `Games retrieved for admin management (${adminGamesData.games.length} titles)`);

    console.log("\nStep 5: Publishing platform announcement...");
    const annRes = await fetch(`${BASE_URL}/api/admin/system`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: tempAdmin.cookie,
      },
      body: JSON.stringify({
        action: "createAnnouncement",
        announcement: {
          title: `E2E System Notice ${timestamp}`,
          message: "Automated end-to-end quality verification broadcast in progress.",
          priority: "HIGH",
          category: "UPDATE",
        },
      }),
    });
    assert(annRes.status === 201, `Announcement published (Status: ${annRes.status})`);
    const annData = await annRes.json();
    const createdAnn = annData.announcements?.find((a) => a.title === `E2E System Notice ${timestamp}`);
    createdAnnouncementId = createdAnn?.id;
    assert(Boolean(createdAnnouncementId), `Announcement assigned ID: ${createdAnnouncementId}`);

    console.log("\nStep 6: Verifying administrative audit log recorded action...");
    const sysRes = await fetch(`${BASE_URL}/api/admin/system`, {
      headers: { Cookie: tempAdmin.cookie },
    });
    assert(sysRes.status === 200, `System administration state retrieved (Status: ${sysRes.status})`);
    const sysData = await sysRes.json();
    assert(Array.isArray(sysData.logs), "Audit log stream is array of genuine platform records");
    const latestAudit = sysData.logs?.find((l) => l.actor === tempAdmin.username && (l.action?.toLowerCase().includes("announcement") || l.action?.toLowerCase().includes("role")));
    assert(Boolean(latestAudit), `Audit log contains verified administrative mutation (Action: ${latestAudit?.action})`);
    assert(latestAudit?.actor === tempAdmin.username, `Audit log verifies immutable actor identity (Actor: ${latestAudit?.actor})`);
  } finally {
    console.log("\n═══ GUARANTEED TEST DATA CLEANUP ═══");
    try {
      const prisma = getPrisma();
      await cleanupTestRecords({
        usernames: [playerUsername, tempAdmin?.username],
        userIds: [createdPlayerId, tempAdmin?.user?.id],
        emails: [playerEmail, tempAdmin?.email],
        announcementIds: [createdAnnouncementId],
        downloadEventIds: [createdDlEventId],
      });
      await prisma.auditLog.deleteMany({
        where: {
          OR: [
            { target: playerUsername },
            { actorUsername: tempAdmin?.username || "__none__" },
            { target: `E2E System Notice ${timestamp}` },
          ],
        },
      });
      console.log("  [CLEANUP] Test player, admin, sessions, and announcement purged cleanly.");
    } catch (err) {
      console.warn("  [CLEANUP WARNING] Failed cleaning up test artifacts:", err.message);
    } finally {
      await disconnectPrisma();
    }
  }

  console.log("\n================================================================================");
  console.log(`END-TO-END SUITE SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log("================================================================================\n");

  if (failed > 0) {
    process.exit(1);
  }
}

runE2ETests().catch((err) => {
  console.error("E2E test execution threw error:", err);
  process.exit(1);
});
