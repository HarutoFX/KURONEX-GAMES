/* eslint-disable @typescript-eslint/no-require-imports */
/**
 * KURONEX GAMES — Production Quality Engineering: Master Test Orchestrator
 *
 * Runs all verified test suites in sequence:
 * 1. Unit Tests (run-unit-tests.js)
 * 2. Integration Tests (run-integration-tests.js)
 * 3. End-to-End User Journey Tests (run-e2e-tests.js)
 * 4. Analytics & Observability Telemetry Suite (test-analytics-observability.js)
 * 5. Security Engineering & Auth Hardening Suite (security-engineering-test.js)
 * 6. Admin Security Audit Suite (security-audit-test.js)
 * 7. Authentic Data Integrity Suite (data-integrity-test.js)
 * 8. Database Architecture & Relational Modernization Suite (test-database-modernization.js)
 */

const { execSync } = require("child_process");

const suites = [
  { name: "Unit Test Suite", script: "scripts/run-unit-tests.js" },
  { name: "Integration Test Suite", script: "scripts/run-integration-tests.js" },
  { name: "End-to-End User Journey Suite", script: "scripts/run-e2e-tests.js" },
  { name: "Analytics & Observability Suite", script: "scripts/test-analytics-observability.js" },
  { name: "Security Engineering & Auth Hardening Suite", script: "scripts/security-engineering-test.js" },
  { name: "Admin Security Audit Suite", script: "scripts/security-audit-test.js" },
  { name: "Authentic Data Integrity Suite", script: "scripts/data-integrity-test.js" },
  { name: "Database Modernization & Schema Suite", script: "scripts/test-database-modernization.js" },
];

async function runMasterTestOrchestration() {
  console.log("================================================================================");
  console.log("       KURONEX GAMES — COMPREHENSIVE PRODUCTION QUALITY TEST RUNNER             ");
  console.log("================================================================================\n");

  const startTime = Date.now();
  const results = [];
  let totalSuitesPassed = 0;
  let totalSuitesFailed = 0;

  for (const suite of suites) {
    const suiteStart = Date.now();
    process.stdout.write(`▶ Running ${suite.name} (${suite.script})... `);
    try {
      execSync(`node ${suite.script}`, {
        encoding: "utf-8",
        env: { ...process.env, TEST_BASE_URL: process.env.TEST_BASE_URL || "http://localhost:3000" },
        stdio: ["pipe", "pipe", "pipe"],
      });
      const duration = ((Date.now() - suiteStart) / 1000).toFixed(2);
      console.log(`[PASS] (${duration}s)`);
      totalSuitesPassed++;
      results.push({ name: suite.name, status: "PASSED", duration: `${duration}s` });
    } catch (err) {
      const duration = ((Date.now() - suiteStart) / 1000).toFixed(2);
      console.log(`[FAIL] (${duration}s)`);
      console.error(`\n--- ERROR OUTPUT: ${suite.name} ---`);
      console.error(err.stdout || err.message);
      console.error(err.stderr || "");
      console.error("----------------------------------\n");
      totalSuitesFailed++;
      results.push({ name: suite.name, status: "FAILED", duration: `${duration}s` });
    }
  }

  const totalDuration = ((Date.now() - startTime) / 1000).toFixed(2);

  console.log("\n================================================================================");
  console.log("                    MASTER TEST EXECUTION SUMMARY                               ");
  console.log("================================================================================");
  console.table(results);
  console.log(`Total Suites: ${suites.length} | Passed: ${totalSuitesPassed} | Failed: ${totalSuitesFailed}`);
  console.log(`Total Execution Time: ${totalDuration}s`);
  console.log("================================================================================\n");

  if (totalSuitesFailed > 0) {
    process.exit(1);
  }
}

runMasterTestOrchestration().catch((err) => {
  console.error("Master test execution crashed:", err);
  process.exit(1);
});
