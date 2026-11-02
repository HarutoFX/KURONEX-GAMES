/**
 * KURONEX GAMES - Security Audit Verification Suite
 */

const BASE_URL = process.env.TEST_BASE_URL || "http://localhost:3009";

async function runTests() {
  console.log("=== STARTING KURONEX ADMIN SECURITY AUDIT VERIFICATION ===\n");
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

  // ── TEST 1: UNAUTHORIZED ENDPOINTS (Should return 401) ──
  console.log("1. Testing Unauthorized Endpoints (No Credentials)...");
  const unauthEndpoints = [
    "/api/admin/system",
    "/api/admin/users",
    "/api/admin/games",
    "/api/admin/developers",
  ];

  for (const endpoint of unauthEndpoints) {
    const res = await fetch(`${BASE_URL}${endpoint}`);
    assert(res.status === 401, `GET ${endpoint} rejected without credentials (Status: ${res.status})`);
  }

  // ── TEST 2: PASSKEY / X-ADMIN-KEY BYPASS REMOVAL (Should return 401) ──
  console.log("\n2. Testing Master Passkey / x-admin-key Header Bypass Elimination...");
  const bypassHeaders = {
    "x-admin-key": "kuronex-admin-2026",
    "Content-Type": "application/json",
  };

  const getBypass = await fetch(`${BASE_URL}/api/admin/system`, { headers: bypassHeaders });
  assert(getBypass.status === 401, `GET /api/admin/system with x-admin-key rejected (Status: ${getBypass.status})`);

  const postBypass = await fetch(`${BASE_URL}/api/admin/system`, {
    method: "POST",
    headers: bypassHeaders,
    body: JSON.stringify({ action: "updateSettings", settings: { platformName: "Hacked" } }),
  });
  assert(postBypass.status === 401, `POST /api/admin/system with x-admin-key rejected (Status: ${postBypass.status})`);

  // ── TEST 3: PLAYER ROLE ESCALATION & ACCESS ATTEMPTS (Should return 403) ──
  console.log("\n3. Testing Non-Admin (Player Role) Privilege Escalation...");
  // Register a temporary player
  const playerGamertag = `player_${Date.now()}`;
  const playerEmail = `${playerGamertag}@kuronex.internal`;
  const regRes = await fetch(`${BASE_URL}/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      username: playerGamertag,
      email: playerEmail,
      password: "PlayerPassword#123",
    }),
  });

  const playerCookie = extractSessionCookie(regRes);
  assert(regRes.status === 201 && Boolean(playerCookie), `Standard player created (${playerGamertag})`);

  const playerHeaders = {
    Cookie: playerCookie,
    "Content-Type": "application/json",
  };

  const playerGetSys = await fetch(`${BASE_URL}/api/admin/system`, { headers: playerHeaders });
  assert(playerGetSys.status === 403, `Player access to /api/admin/system rejected with 403 (Status: ${playerGetSys.status})`);

  const playerEscalate = await fetch(`${BASE_URL}/api/admin/users`, {
    method: "POST",
    headers: playerHeaders,
    body: JSON.stringify({ action: "updateRole", userId: "some_id", role: "admin" }),
  });
  assert(playerEscalate.status === 403, `Player privilege escalation attempt to /api/admin/users rejected with 403 (Status: ${playerEscalate.status})`);

  const playerGames = await fetch(`${BASE_URL}/api/admin/games`, { headers: playerHeaders });
  assert(playerGames.status === 403, `Player access to /api/admin/games rejected with 403 (Status: ${playerGames.status})`);

  // ── TEST 4: ROTATED ADMIN CREDENTIALS & SESSION VALIDATION ──
  console.log("\n4. Testing Rotated Admin Login & Session Authorization...");
  // First, verify old compromised password FAILS
  const oldLoginRes = await fetch(`${BASE_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      identifier: "dev.admin@kuronex.internal",
      password: "KuronexDev#2026!", // OLD COMPROMISED PASSWORD
    }),
  });
  assert(oldLoginRes.status === 401, `Old compromised password rejected with 401 (Status: ${oldLoginRes.status})`);

  // Verify new rotated password SUCCEEDS
  const newLoginRes = await fetch(`${BASE_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      identifier: "dev.admin@kuronex.internal",
      password: "KuronexSecureDev2026#Alpha",
    }),
  });
  const newLoginBody = await newLoginRes.json();
  if (newLoginRes.status !== 200) {
    console.log("DEBUG newLogin failed:", newLoginRes.status, newLoginBody);
  }
  const adminCookie = extractSessionCookie(newLoginRes);
  assert(newLoginRes.status === 200 && Boolean(adminCookie), `Rotated admin credentials accepted (Status: ${newLoginRes.status})`);

  const adminHeaders = {
    Cookie: adminCookie,
    "Content-Type": "application/json",
  };

  // ── TEST 5: DATA PROTECTION & LEAK AUDIT ──
  console.log("\n5. Testing Data Protection (No hashes, salts, or tokens in client response)...");
  const usersRes = await fetch(`${BASE_URL}/api/admin/users`, { headers: adminHeaders });
  assert(usersRes.status === 200, `Admin GET /api/admin/users succeeded (Status: ${usersRes.status})`);
  const usersData = await usersRes.json();
  const rawJson = JSON.stringify(usersData);
  assert(!rawJson.includes("passwordHash"), "User listing contains NO passwordHash field");
  assert(!rawJson.includes("salt"), "User listing contains NO salt field");
  assert(!rawJson.includes("token"), "User listing contains NO session tokens");

  // Verify Platform Settings does not leak passkey
  const sysRes = await fetch(`${BASE_URL}/api/admin/system`, { headers: adminHeaders });
  const sysData = await sysRes.json();
  const sysJson = JSON.stringify(sysData.settings);
  assert(!sysJson.includes("adminPasskey"), "Platform settings contains NO adminPasskey field");
  assert(!sysJson.includes("kuronex-admin-2026"), "Platform settings contains NO passkey secret");

  // ── TEST 6: ROLE MANAGEMENT SAFEGUARDS & SELF-MODIFICATION BLOCKS ──
  console.log("\n6. Testing Role Management Safeguards...");
  // Attempt to demote root admin
  const demoteRoot = await fetch(`${BASE_URL}/api/admin/users`, {
    method: "POST",
    headers: adminHeaders,
    body: JSON.stringify({ action: "updateRole", userId: "kuro_dev_admin_root", role: "player" }),
  });
  assert(demoteRoot.status === 403, `Demoting root admin blocked with 403 (Status: ${demoteRoot.status})`);

  // Attempt to delete root admin
  const deleteRoot = await fetch(`${BASE_URL}/api/admin/users`, {
    method: "POST",
    headers: adminHeaders,
    body: JSON.stringify({ action: "deleteUser", userId: "kuro_dev_admin_root" }),
  });
  assert(deleteRoot.status === 403, `Deleting root admin blocked with 403 (Status: ${deleteRoot.status})`);

  // Attempt self-modification
  const selfModify = await fetch(`${BASE_URL}/api/admin/users`, {
    method: "POST",
    headers: adminHeaders,
    body: JSON.stringify({ action: "updateRole", userId: "kuro_dev_admin_root", role: "developer" }),
  });
  assert(selfModify.status === 403, `Self-privilege modification blocked with 403 (Status: ${selfModify.status})`);

  // Attempt self-deletion
  const selfDelete = await fetch(`${BASE_URL}/api/admin/users`, {
    method: "POST",
    headers: adminHeaders,
    body: JSON.stringify({ action: "deleteUser", userId: "kuro_dev_admin_root" }),
  });
  assert(selfDelete.status === 403, `Self-deletion blocked with 403 (Status: ${selfDelete.status})`);

  // ── TEST 7: ADMINISTRATIVE MUTATIONS & AUDIT TRAIL INTEGRITY ──
  console.log("\n7. Testing Administrative Mutations and Audit Logging...");
  // Update standard player role
  const updatePlayerRes = await fetch(`${BASE_URL}/api/admin/users`, {
    method: "POST",
    headers: adminHeaders,
    body: JSON.stringify({ action: "updateRole", userId: usersData.users.find(u => u.username === playerGamertag)?.id, role: "developer" }),
  });
  assert(updatePlayerRes.status === 200, `Admin successfully updated player role to developer (Status: ${updatePlayerRes.status})`);

  // Create an announcement (author must be bound to authenticated admin)
  const createAnnRes = await fetch(`${BASE_URL}/api/admin/system`, {
    method: "POST",
    headers: adminHeaders,
    body: JSON.stringify({
      action: "createAnnouncement",
      announcement: {
        title: "Security Audit Verification Complete",
        message: "All administrative endpoints hardened with session-bound authorization.",
        priority: "HIGH",
        category: "UPDATE",
        isActive: true,
        author: "SpoofedAuthorAttacker", // Attacker attempts author spoof
      },
    }),
  });
  assert(createAnnRes.status === 201, `Admin created announcement (Status: ${createAnnRes.status})`);
  const annData = await createAnnRes.json();
  const createdAnn = annData.announcements?.find(a => a.title === "Security Audit Verification Complete");
  assert(createdAnn?.author === "admin" || createdAnn?.author === "kuronex_dev", `Author spoofing prevented (Actual author: ${createdAnn?.author})`);

  // Check audit log contains the events with actor admin
  const updatedSys = await (await fetch(`${BASE_URL}/api/admin/system`, { headers: adminHeaders })).json();
  const latestLog = updatedSys.logs?.[0];
  assert(latestLog?.actor === "admin" || latestLog?.actor === "kuronex_dev", `Audit log verifies actor identity bound to session (Actor: ${latestLog?.actor})`);

  // Clean up test player
  const playerObj = usersData.users.find(u => u.username === playerGamertag);
  if (playerObj) {
    await fetch(`${BASE_URL}/api/admin/users`, {
      method: "POST",
      headers: adminHeaders,
      body: JSON.stringify({ action: "deleteUser", userId: playerObj.id }),
    });
  }

  console.log(`\n=== AUDIT VERIFICATION RESULTS: ${passed} PASSED, ${failed} FAILED ===`);
  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch(err => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
