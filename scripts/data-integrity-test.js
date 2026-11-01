/**
 * KURONEX GAMES - Real Data & Integrity Verification Suite
 */

const BASE_URL = process.env.TEST_BASE_URL || "http://localhost:3009";

async function runIntegrityTests() {
  console.log("=== STARTING KURONEX DATA INTEGRITY & AUTHENTIC METRICS TESTS ===\n");
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

  // ── TEST 1: Authentic Download Store ──
  console.log("1. Testing Authentic Download Store...");
  const dlRes1 = await fetch(`${BASE_URL}/api/downloads`);
  const dlData1 = await dlRes1.json();
  assert(dlRes1.status === 200, `GET /api/downloads succeeded (Status: ${dlRes1.status})`);
  assert(typeof dlData1.total === "number", `Total downloads is genuine number (${dlData1.total})`);
  assert(dlData1.platformStats !== undefined, "Platform breakdown is present");

  const initialDownloads = dlData1.total;
  const postDlRes = await fetch(`${BASE_URL}/api/downloads`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      itemType: "client",
      itemId: "kuronex-launcher-test",
      platform: "linux",
      version: "1.0.0-preview",
    }),
  });
  assert(postDlRes.status === 201, `POST /api/downloads recorded download (Status: ${postDlRes.status})`);

  const dlRes2 = await fetch(`${BASE_URL}/api/downloads`);
  const dlData2 = await dlRes2.json();
  assert(dlData2.total === initialDownloads + 1, `Total downloads incremented authentically (${initialDownloads} -> ${dlData2.total})`);
  assert(dlData2.platformStats.linux >= 1, `Linux download recorded in platform stats`);

  // ── TEST 2: Persistent User Library ──
  console.log("\n2. Testing Persistent User Library...");
  const unauthLib = await fetch(`${BASE_URL}/api/user/library`);
  const unauthLibData = await unauthLib.json();
  assert(Array.isArray(unauthLibData.library) && unauthLibData.library.length === 0, "Unauthenticated user library returns empty array");

  // Register a test player
  const playerEmail = `integrity_player_${Date.now()}@kuronex.internal`;
  const regRes = await fetch(`${BASE_URL}/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      username: `integrity_${Date.now().toString().slice(-6)}`,
      email: playerEmail,
      password: "TestPlayerPassword#2026",
    }),
  });
  const sessionCookie = extractSessionCookie(regRes);
  assert(regRes.status === 201 && sessionCookie.length > 0, `Player registered and authenticated successfully`);

  // Add "voidstrike" to user's library
  const addLibRes = await fetch(`${BASE_URL}/api/user/library`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Cookie: sessionCookie,
    },
    body: JSON.stringify({
      gameId: "voidstrike",
      action: "add",
    }),
  });
  const addLibData = await addLibRes.json();
  assert(addLibRes.status === 200, `POST /api/user/library added game (Status: ${addLibRes.status})`);
  assert(addLibData.library.includes("voidstrike"), `User library now contains 'voidstrike'`);

  // Verify /api/auth/me returns persisted library
  const meRes = await fetch(`${BASE_URL}/api/auth/me`, {
    headers: { Cookie: sessionCookie },
  });
  const meData = await meRes.json();
  assert(meData.user?.library?.includes("voidstrike"), `/api/auth/me reflects persisted library`);

  // ── TEST 3: Health Endpoint & Non-Configured External Services ──
  console.log("\n3. Testing Infrastructure Health & Non-Configured Fallbacks...");
  // Login as admin
  const adminLoginRes = await fetch(`${BASE_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      identifier: "dev.admin@kuronex.internal",
      password: "KuronexSecureDev2026#Alpha",
    }),
  });
  const adminCookie = extractSessionCookie(adminLoginRes);
  assert(adminLoginRes.status === 200 && adminCookie.length > 0, "Admin logged in successfully");

  const healthRes = await fetch(`${BASE_URL}/api/admin/health`, {
    headers: { Cookie: adminCookie },
  });
  assert(healthRes.status === 200, `GET /api/admin/health succeeded (Status: ${healthRes.status})`);
  const healthData = await healthRes.json();
  assert(healthData.overall === "OPERATIONAL", `Overall health reports OPERATIONAL`);
  assert(Array.isArray(healthData.services) && healthData.services.length >= 4, `Evaluates at least 4 subsystems`);

  const assetService = healthData.services.find((s) => s.name === "Asset Pipeline");
  assert(assetService && (assetService.status === "NOT_CONFIGURED" || assetService.status === "ONLINE"), `External Asset Pipeline reports genuine status (${assetService?.status})`);

  // ── TEST 4: Telemetry Without Mock Math ──
  console.log("\n4. Testing Telemetry Without Mock Multipliers...");
  const sysRes = await fetch(`${BASE_URL}/api/admin/system`, {
    headers: { Cookie: adminCookie },
  });
  const sysData = await sysRes.json();
  assert(sysRes.status === 200, `GET /api/admin/system succeeded (Status: ${sysRes.status})`);

  // Verify totalDownloads is NOT calculated using the old 1420 formula
  assert(sysData.metrics.totalDownloads === dlData2.total, `sysData totalDownloads (${sysData.metrics.totalDownloads}) matches genuine download store count (${dlData2.total})`);
  assert(sysData.metrics.totalDownloads !== 1420 + sysData.metrics.totalUsers * 12, `sysData does NOT use mock formula '1420 + users * 12'`);
  assert(typeof sysData.metrics.activeUsers === "number", `Active users is real session count (${sysData.metrics.activeUsers})`);
  assert(sysData.metrics.gameLibraryStats?.voidstrike >= 1, `Library additions aggregated genuinely across user accounts`);

  // Verify audit logs do not contain fake dummy logs
  const fakeLogIds = ["log_01", "log_02", "log_03", "log_04"];
  const hasFakeLog = sysData.logs.some((l) => fakeLogIds.includes(l.id));
  assert(!hasFakeLog, `Audit log stream has no fabricated mock logs (total logs: ${sysData.logs.length})`);

  console.log(`\n=== DATA INTEGRITY TESTS FINISHED: ${passed} PASSED, ${failed} FAILED ===\n`);
  if (failed > 0) process.exit(1);
}

runIntegrityTests().catch((err) => {
  console.error("Test execution error:", err);
  process.exit(1);
});
