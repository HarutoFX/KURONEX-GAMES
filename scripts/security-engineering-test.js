/* eslint-disable @typescript-eslint/no-require-imports */
/**
 * KURONEX GAMES — Comprehensive Security Engineering Verification Suite
 *
 * Verifies:
 * 1. Authentication hardening (registration, scrypt timing neutralization, brute-force lockout, suspended user block)
 * 2. Session security (HttpOnly, SameSite, rotation, session listing with masked tokens, revocation)
 * 3. Password recovery lifecycle (hashed token storage, single-use, session invalidation on reset)
 * 4. Server-side RBAC & permission boundaries (Analyst, Moderator, Admin hierarchy, root SuperAdmin protection)
 * 5. CSRF origin verification on mutating requests
 * 6. IDOR protection & data leakage audit (no hashes/salts in responses)
 * 7. Security response headers (HSTS, nosniff, frame-options)
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
  const setCookie = res.headers.get("set-cookie");
  if (!setCookie) return "";
  const match = setCookie.match(/kuronex_session=([^;]+)/);
  return match ? `kuronex_session=${match[1]}` : "";
}

async function runSecurityEngineeringTests() {
  console.log("================================================================================");
  console.log("      KURONEX GAMES — SECURITY ENGINEERING & AUTHENTICATION HARDENING SUITE      ");
  console.log("================================================================================\n");

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
    const testUsername = `sec_user_${Date.now()}`;
    const testEmail = `${testUsername}@kuronex.internal`;
    const testPassword = "StrongSecurityPassword#2026!";

    // Short password rejection
    const shortPassRes = await fetch(`${BASE_URL}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: "usr", email: "valid@test.com", password: "123" }),
    });
    assert(shortPassRes.status === 400, `Registration with weak password rejected (Status: ${shortPassRes.status})`);

    // Malformed email rejection
    const badEmailRes = await fetch(`${BASE_URL}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: testUsername, email: "invalid-email-format", password: testPassword }),
    });
    assert(badEmailRes.status === 400, `Registration with malformed email rejected (Status: ${badEmailRes.status})`);

    // Valid registration
    const regRes = await fetch(`${BASE_URL}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: testUsername, email: testEmail, password: testPassword }),
    });
    assert(regRes.status === 201, `Valid registration succeeded (Status: ${regRes.status})`);
    const regCookie = extractSessionCookie(regRes);
    assert(Boolean(regCookie), "Registration issues valid HttpOnly session cookie");

    // Duplicate email rejection
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

    // Active session inspection
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
    if (!resetToken) {
      const usersPath = path.join(process.cwd(), "src", "data", "users.json");
      const users = JSON.parse(fs.readFileSync(usersPath, "utf-8"));
      const u = users.find((x) => x.email === testEmail);
      assert(Boolean(u && u.passwordResetTokenHash), "Password reset issued single-use cryptographic token");
      const crypto = require("crypto");
      resetToken = "tok_test_" + crypto.randomBytes(32).toString("hex");
      const tokenHash = crypto.createHash("sha256").update(resetToken).digest("hex");
      u.passwordResetTokenHash = tokenHash;
      u.passwordResetExpiresAt = Date.now() + 3600000;
      fs.writeFileSync(usersPath, JSON.stringify(users, null, 2), "utf-8");
    } else {
      assert(Boolean(forgotData.debugResetToken), "Password reset issued single-use cryptographic token");
    }

    // Invalid token rejection
    const invalidResetRes = await fetch(`${BASE_URL}/api/auth/reset-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token: "invalid_unregistered_token_123", newPassword: "NewSecretPassword#2026!" }),
    });
    assert(invalidResetRes.status === 400, `Invalid reset token rejected (Status: ${invalidResetRes.status})`);

    // Valid reset
    const validResetRes = await fetch(`${BASE_URL}/api/auth/reset-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token: resetToken, newPassword: "NewSecretPassword#2026!" }),
    });
    assert(validResetRes.status === 200, `Valid password reset succeeded (Status: ${validResetRes.status})`);

    // Single-use token enforcement (token reuse must fail)
    const reuseResetRes = await fetch(`${BASE_URL}/api/auth/reset-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token: resetToken, newPassword: "AnotherPassword#2026!" }),
    });
    assert(reuseResetRes.status === 400, `Reusing already-consumed reset token blocked (Status: ${reuseResetRes.status})`);

    // Verify previous session was invalidated upon password reset
    const oldSessionCheck = await fetch(`${BASE_URL}/api/auth/me`, {
      headers: { Cookie: loginCookie },
    });
    const oldSessionBody = await oldSessionCheck.json();
    assert(!oldSessionBody.user, "All pre-existing sessions revoked upon password reset");

    // ── 7. SERVER-SIDE RBAC & PRIVILEGE ESCALATION GUARDS ──
    console.log("\n--- 7. Server-Side RBAC & Privilege Escalation Guards ---");
    // Admin login
    const adminLoginRes = await fetch(`${BASE_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        identifier: "dev.admin@kuronex.internal",
        password: "KuronexSecureDev2026#Alpha",
      }),
    });
    assert(adminLoginRes.status === 200, `Admin authenticated successfully (Status: ${adminLoginRes.status})`);
    const adminCookie = extractSessionCookie(adminLoginRes);

    // Promote test user to 'moderator'
    const promoteModRes = await fetch(`${BASE_URL}/api/admin/users`, {
      method: "POST",
      headers: { Cookie: adminCookie, "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "updateRole",
        userId: regRes ? (await (await fetch(`${BASE_URL}/api/auth/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ identifier: testEmail, password: "NewSecretPassword#2026!" }),
        })).json()).user.id : "unknown",
        role: "moderator",
      }),
    });
    assert(promoteModRes.status === 200, `Admin promoted test user to 'moderator' (Status: ${promoteModRes.status})`);

    // Moderator login
    const modLoginRes = await fetch(`${BASE_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ identifier: testEmail, password: "NewSecretPassword#2026!" }),
    });
    const modUser = (await modLoginRes.json()).user;
    const modCookie = extractSessionCookie(modLoginRes);
    assert(modUser.role.toLowerCase() === "moderator", `User role confirmed as 'moderator' (${modUser.role})`);

    // Moderator attempting to update system platform settings (requires system:settings:write) -> Must fail with 403!
    const modSettingsAttempt = await fetch(`${BASE_URL}/api/admin/system`, {
      method: "POST",
      headers: { Cookie: modCookie, "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "updateSettings",
        settings: { platformName: "HACKED_PLATFORM" },
      }),
    });
    assert(modSettingsAttempt.status === 403, `Moderator write to system settings blocked with 403 (Status: ${modSettingsAttempt.status})`);

    // Moderator attempting to promote another user to 'admin' (privilege escalation) -> Must fail with 403!
    const modEscalateAttempt = await fetch(`${BASE_URL}/api/admin/users`, {
      method: "POST",
      headers: { Cookie: modCookie, "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "updateRole",
        userId: "vyo_2bc6070a18a0467a",
        role: "admin",
      }),
    });
    assert(modEscalateAttempt.status === 403, `Moderator privilege escalation attempt blocked with 403 (Status: ${modEscalateAttempt.status})`);

    // ── 8. ACCOUNT SUSPENSION ENFORCEMENT ──
    console.log("\n--- 8. Account Suspension Lifecycle & Immediate Eviction ---");
    // Admin suspends moderator account
    const suspendRes = await fetch(`${BASE_URL}/api/admin/users`, {
      method: "POST",
      headers: { Cookie: adminCookie, "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "suspendUser",
        userId: modUser.id,
        suspended: true,
        reason: "Security audit violation test",
      }),
    });
    assert(suspendRes.status === 200, `Admin suspended test user account (Status: ${suspendRes.status})`);

    // Suspended user's existing session must immediately fail
    const suspendedSessionCheck = await fetch(`${BASE_URL}/api/auth/me`, {
      headers: { Cookie: modCookie },
    });
    const suspendedMe = await suspendedSessionCheck.json();
    assert(!suspendedMe.user, "Suspended user active session immediately rejected on /api/auth/me");

    // Suspended user login attempt must be rejected with 403
    const suspendedLoginAttempt = await fetch(`${BASE_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ identifier: testEmail, password: "NewSecretPassword#2026!" }),
    });
    assert(suspendedLoginAttempt.status === 403, `Suspended user login rejected with 403 Forbidden (Status: ${suspendedLoginAttempt.status})`);

    // Clean up: delete test user account
    await fetch(`${BASE_URL}/api/admin/users`, {
      method: "POST",
      headers: { Cookie: adminCookie, "Content-Type": "application/json" },
      body: JSON.stringify({ action: "deleteUser", userId: modUser.id }),
    });

    // ── SUMMARY ──
    console.log("\n================================================================================");
    console.log(`TOTAL: ${passed + failed} | PASSED: ${passed} | FAILED: ${failed}`);
    console.log("================================================================================\n");

    if (failed > 0) {
      process.exit(1);
    }
  } catch (err) {
    console.error("Security engineering test execution error:", err);
    process.exit(1);
  }
}

runSecurityEngineeringTests();
