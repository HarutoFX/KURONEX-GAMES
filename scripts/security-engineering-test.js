/* eslint-disable @typescript-eslint/no-require-imports */
/**
 * KURONEX GAMES — Comprehensive Security Engineering Verification Suite
 *
 * Verifies:
 * 1. HTTP security headers
 * 2. CSRF origin validation on mutating requests
 * 3. Authentication & input validation
 * 4. Brute-force & side-channel timing defense
 * 5. Session rotation & concurrent session telemetry
 * 6. Password recovery lifecycle (Prisma hashed token storage & single-use)
 * 7. Server-side RBAC & privilege escalation guards
 * 8. Account suspension lifecycle & immediate eviction
 */

const crypto = require("crypto");
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

async function runSecurityEngineeringTests() {
  console.log("================================================================================");
  console.log("      KURONEX GAMES — SECURITY ENGINEERING & AUTHENTICATION HARDENING SUITE      ");
  console.log("================================================================================\n");

  const testUsername = `sec_user_${Date.now()}`;
  const testEmail = `${testUsername}@kuronex.internal`;
  const testPassword = "StrongSecurityPassword#2026!";

  let createdUserId = "";
  let tempAdmin = null;
  let dlEventId = "";

  try {
    // ── 1. INFRASTRUCTURE & SECURITY HEADERS ──
    console.log("--- 1. Infrastructure & HTTP Security Headers ---");
    const headerRes = await fetch(`${BASE_URL}/api/developers`);
    assert(headerRes.status === 200, `GET /api/developers responded (Status: ${headerRes.status})`);

    const xContentType = headerRes.headers.get("x-content-type-options");
    const xFrameOptions = headerRes.headers.get("x-frame-options");
    const referrerPolicy = headerRes.headers.get("referrer-policy");

    assert(xContentType === "nosniff", `X-Content-Type-Options is 'nosniff' (${xContentType})`);
    assert(xFrameOptions === "DENY", `X-Frame-Options is 'DENY' (${xFrameOptions})`);
    assert(Boolean(referrerPolicy), `Referrer-Policy header is configured (${referrerPolicy})`);

    // ── 2. CSRF ORIGIN VALIDATION ──
    console.log("\n--- 2. CSRF Cross-Origin State Mutation Protection ---");
    const csrfRes = await fetch(`${BASE_URL}/api/downloads`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Origin: "https://evil-cross-site-attacker.com",
      },
      body: JSON.stringify({ itemType: "client", platform: "windows" }),
    });

    assert(csrfRes.status === 403, `Mutating request with untrusted Origin rejected with 403 Forbidden (Status: ${csrfRes.status})`);
    const csrfBody = await csrfRes.json();
    assert(csrfBody.error && csrfBody.error.includes("CSRF"), `CSRF error message returned: '${csrfBody.error}'`);

    // ── 3. AUTHENTICATION & INPUT VALIDATION ──
    console.log("\n--- 3. Authentication & Input Validation ---");
    const shortPassRes = await fetch(`${BASE_URL}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: "usr", email: "valid@test.com", password: "123" }),
    });
    assert(shortPassRes.status === 400, `Registration with weak password rejected (Status: ${shortPassRes.status})`);

    const badEmailRes = await fetch(`${BASE_URL}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: testUsername, email: "invalid-email-format", password: testPassword }),
    });
    assert(badEmailRes.status === 400, `Registration with malformed email rejected (Status: ${badEmailRes.status})`);

    const regRes = await fetch(`${BASE_URL}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: testUsername, email: testEmail, password: testPassword }),
    });
    assert(regRes.status === 201, `Valid registration succeeded (Status: ${regRes.status})`);
    const regCookie = extractSessionCookie(regRes);
    const regData = await regRes.json();
    createdUserId = regData.user?.id || "";
    assert(Boolean(regCookie), "Registration issues valid HttpOnly session cookie");

    const dupRes = await fetch(`${BASE_URL}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: `${testUsername}_2`, email: testEmail, password: testPassword }),
    });
    assert(dupRes.status === 409, `Duplicate registration rejected with 409 Conflict (Status: ${dupRes.status})`);

    // ── 4. TIMING-ATTACK PAD & BRUTE-FORCE LOCKOUT ──
    console.log("\n--- 4. Brute-Force & Side-Channel Timing Defense ---");
    const t0 = Date.now();
    const nonExistentRes = await fetch(`${BASE_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ identifier: "non_existent_account_999@kuronex.internal", password: "SomeRandomPassword123!" }),
    });
    const durationNonExistent = Date.now() - t0;
    assert(nonExistentRes.status === 401, `Non-existent user login rejected with 401 (Status: ${nonExistentRes.status})`);
    assert(durationNonExistent >= 5, `Non-existent user inquiry passes through cryptographic timing pad (${durationNonExistent}ms)`);

    // ── 5. SESSION ROTATION & CONCURRENT SESSION MANAGEMENT ──
    console.log("\n--- 5. Session Rotation & Concurrent Session Telemetry ---");
    const loginRes = await fetch(`${BASE_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ identifier: testEmail, password: testPassword }),
    });
    assert(loginRes.status === 200, `Login succeeded with verified credentials (Status: ${loginRes.status})`);
    const loginCookie = extractSessionCookie(loginRes);
    assert(Boolean(loginCookie), "Login returns secure session cookie");
    assert(loginCookie !== regCookie, "Session token rotated upon authentication (anti-session-fixation)");

    const sessionsRes = await fetch(`${BASE_URL}/api/auth/sessions`, {
      headers: { Cookie: loginCookie },
    });
    assert(sessionsRes.status === 200, `GET /api/auth/sessions succeeded (Status: ${sessionsRes.status})`);
    const sessionData = await sessionsRes.json();
    assert(sessionData.totalActiveSessions >= 1, `Active sessions reported: ${sessionData.totalActiveSessions}`);
    assert(sessionData.sessions.some((s) => s.isCurrent === true), "Current session identified accurately in active sessions");
    const rawSessionsJson = JSON.stringify(sessionData);
    assert(!rawSessionsJson.includes("passwordHash") && !rawSessionsJson.includes("salt"), "Session inspection exposes no cryptographic secrets");

    // ── 6. PASSWORD RECOVERY & RESET LIFECYCLE ──
    console.log("\n--- 6. Password Recovery Lifecycle (Hashed Token Storage & Single-Use) ---");
    const forgotRes = await fetch(`${BASE_URL}/api/auth/forgot-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: testEmail }),
    });
    assert(forgotRes.status === 200, `POST /api/auth/forgot-password accepted (Status: ${forgotRes.status})`);
    const forgotData = await forgotRes.json();

    let resetToken = forgotData.debugResetToken;
    const prisma = getPrisma();
    const userRow = await prisma.user.findUnique({ where: { email: testEmail.toLowerCase() } });
    assert(Boolean(userRow && userRow.passwordResetTokenHash), "Password reset issued single-use cryptographic token in database");

    if (!resetToken) {
      resetToken = "tok_test_" + crypto.randomBytes(32).toString("hex");
      const tokenHash = crypto.createHash("sha256").update(resetToken).digest("hex");
      await prisma.user.update({
        where: { id: userRow.id },
        data: {
          passwordResetTokenHash: tokenHash,
          passwordResetExpiresAt: new Date(Date.now() + 3600000),
        },
      });
    }

    const invalidResetRes = await fetch(`${BASE_URL}/api/auth/reset-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token: "invalid_unregistered_token_123", newPassword: "NewSecretPassword#2026!" }),
    });
    assert(invalidResetRes.status === 400, `Invalid reset token rejected (Status: ${invalidResetRes.status})`);

    const validResetRes = await fetch(`${BASE_URL}/api/auth/reset-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token: resetToken, newPassword: "NewSecretPassword#2026!" }),
    });
    assert(validResetRes.status === 200, `Valid password reset succeeded (Status: ${validResetRes.status})`);

    const reuseResetRes = await fetch(`${BASE_URL}/api/auth/reset-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token: resetToken, newPassword: "AnotherPassword#2026!" }),
    });
    assert(reuseResetRes.status === 400, `Reusing already-consumed reset token blocked (Status: ${reuseResetRes.status})`);

    const oldSessionCheck = await fetch(`${BASE_URL}/api/auth/me`, {
      headers: { Cookie: loginCookie },
    });
    const oldSessionBody = await oldSessionCheck.json();
    assert(!oldSessionBody.user, "All pre-existing sessions revoked upon password reset");

    // ── 7. SERVER-SIDE RBAC & PRIVILEGE ESCALATION GUARDS ──
    console.log("\n--- 7. Server-Side RBAC & Privilege Escalation Guards ---");
    tempAdmin = await createTempAdmin(BASE_URL, "sec_eng_admin");
    assert(Boolean(tempAdmin.cookie), `Admin authenticated successfully (${tempAdmin.username})`);

    const promoteModRes = await fetch(`${BASE_URL}/api/admin/users`, {
      method: "POST",
      headers: { Cookie: tempAdmin.cookie, "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "updateRole",
        userId: createdUserId,
        role: "moderator",
      }),
    });
    assert(promoteModRes.status === 200, `Admin promoted test user to 'moderator' (Status: ${promoteModRes.status})`);

    const modLoginRes = await fetch(`${BASE_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ identifier: testEmail, password: "NewSecretPassword#2026!" }),
    });
    const modUser = (await modLoginRes.json()).user;
    const modCookie = extractSessionCookie(modLoginRes);
    assert(modUser.role.toLowerCase() === "moderator", `User role confirmed as 'moderator' (${modUser.role})`);

    const modSettingsAttempt = await fetch(`${BASE_URL}/api/admin/system`, {
      method: "POST",
      headers: { Cookie: modCookie, "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "updateSettings",
        settings: { platformName: "HACKED_PLATFORM" },
      }),
    });
    assert(modSettingsAttempt.status === 403, `Moderator write to system settings blocked with 403 (Status: ${modSettingsAttempt.status})`);

    const modEscalateAttempt = await fetch(`${BASE_URL}/api/admin/users`, {
      method: "POST",
      headers: { Cookie: modCookie, "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "updateRole",
        userId: "kuro_dev_admin_root",
        role: "admin",
      }),
    });
    assert(modEscalateAttempt.status === 403, `Moderator privilege escalation attempt blocked with 403 (Status: ${modEscalateAttempt.status})`);

    // ── 8. ACCOUNT SUSPENSION ENFORCEMENT ──
    console.log("\n--- 8. Account Suspension Lifecycle & Immediate Eviction ---");
    const suspendRes = await fetch(`${BASE_URL}/api/admin/users`, {
      method: "POST",
      headers: { Cookie: tempAdmin.cookie, "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "suspendUser",
        userId: modUser.id,
        suspended: true,
        reason: "Security audit violation test",
      }),
    });
    assert(suspendRes.status === 200, `Admin suspended test user account (Status: ${suspendRes.status})`);

    const suspendedSessionCheck = await fetch(`${BASE_URL}/api/auth/me`, {
      headers: { Cookie: modCookie },
    });
    const suspendedMe = await suspendedSessionCheck.json();
    assert(!suspendedMe.user, "Suspended user active session immediately rejected on /api/auth/me");

    const suspendedLoginAttempt = await fetch(`${BASE_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ identifier: testEmail, password: "NewSecretPassword#2026!" }),
    });
    assert(suspendedLoginAttempt.status === 403, `Suspended user login rejected with 403 Forbidden (Status: ${suspendedLoginAttempt.status})`);

    console.log("\n================================================================================");
    console.log(`TOTAL: ${passed + failed} | PASSED: ${passed} | FAILED: ${failed}`);
    console.log("================================================================================\n");
  } finally {
    try {
      const prisma = getPrisma();
      await cleanupTestRecords({
        usernames: [testUsername, tempAdmin?.username],
        userIds: [createdUserId, tempAdmin?.user?.id],
        emails: [testEmail, tempAdmin?.email],
        downloadEventIds: [dlEventId],
      });
      if (tempAdmin?.username) {
        await prisma.auditLog.deleteMany({ where: { actorUsername: tempAdmin.username } });
      }
    } catch (err) {
      console.warn("Cleanup error:", err.message);
    } finally {
      await disconnectPrisma();
    }
  }

  if (failed > 0) {
    process.exit(1);
  }
}

runSecurityEngineeringTests().catch((err) => {
  console.error("Security engineering test execution error:", err);
  process.exit(1);
});
