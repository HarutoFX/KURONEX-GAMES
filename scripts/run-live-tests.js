/* eslint-disable @typescript-eslint/no-require-imports */
/**
 * Self-contained live test runner: starts Next.js dev server, waits for /api/health,
 * runs scripts/run-all-tests.js, and tears down the dev server cleanly.
 */

const { spawn, execSync } = require("child_process");

const PORT = process.env.TEST_PORT || "3000";
const BASE_URL = `http://127.0.0.1:${PORT}`;

async function waitForHealth(timeoutMs = 30000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const res = await fetch(`${BASE_URL}/api/health`);
      if (res.ok) return true;
    } catch {
      // ignore until ready
    }
    await new Promise((r) => setTimeout(r, 400));
  }
  throw new Error(`Server did not become healthy at ${BASE_URL}/api/health within ${timeoutMs}ms`);
}

async function main() {
  const server = spawn("npx", ["next", "dev", "-p", PORT], {
    stdio: ["ignore", "pipe", "pipe"],
    env: { ...process.env, PORT },
  });

  let exitCode = 1;
  try {
    await waitForHealth(30000);
    execSync("node scripts/run-all-tests.js", {
      stdio: "inherit",
      env: { ...process.env, TEST_BASE_URL: BASE_URL },
    });
    exitCode = 0;
  } finally {
    server.kill("SIGTERM");
    await new Promise((r) => setTimeout(r, 500));
    if (!server.killed) {
      server.kill("SIGKILL");
    }
  }

  process.exit(exitCode);
}

main().catch((err) => {
  console.error("Live test runner failed:", err.message);
  process.exit(1);
});

