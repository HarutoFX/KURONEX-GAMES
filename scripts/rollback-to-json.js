/* eslint-disable @typescript-eslint/no-require-imports */
/**
 * KURONEX GAMES - Automated Rollback Utility
 * Restores data records from a verified snapshot if any issue occurs.
 */

const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

function rollback(snapshotDirName) {
  const dataDir = path.join(process.cwd(), "src", "data");
  const backupBaseDir = path.join(process.cwd(), "backups", "json-snapshots");

  let targetSnapshotDir;

  if (snapshotDirName) {
    targetSnapshotDir = path.join(backupBaseDir, snapshotDirName);
  } else {
    // Find latest snapshot
    if (!fs.existsSync(backupBaseDir)) {
      throw new Error("No backup snapshots directory found.");
    }
    const snapshots = fs.readdirSync(backupBaseDir)
      .filter((name) => name.startsWith("snapshot-"))
      .sort()
      .reverse();

    if (snapshots.length === 0) {
      throw new Error("No snapshots available to roll back to.");
    }
    targetSnapshotDir = path.join(backupBaseDir, snapshots[0]);
  }

  const manifestPath = path.join(targetSnapshotDir, "manifest.json");
  if (!fs.existsSync(manifestPath)) {
    throw new Error(`Manifest missing in snapshot directory: ${targetSnapshotDir}`);
  }

  const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf-8"));
  console.log(`[ROLLBACK] Initiating rollback to snapshot from ${manifest.snapshotTimestamp}`);

  for (const [fileName, meta] of Object.entries(manifest.files)) {
    const srcPath = path.join(targetSnapshotDir, fileName);
    const destPath = path.join(dataDir, fileName);

    const content = fs.readFileSync(srcPath);
    const hash = crypto.createHash("sha256").update(content).digest("hex");

    if (hash !== meta.sha256) {
      throw new Error(`Integrity mismatch on backup file ${fileName}! Expected ${meta.sha256}, got ${hash}`);
    }

    fs.writeFileSync(destPath, content);
    console.log(`  Restored ${fileName} (${meta.recordCount} records, ${meta.bytes} bytes)`);
  }

  console.log(`[ROLLBACK] Rollback completed successfully.`);
}

if (require.main === module) {
  const specificSnapshot = process.argv[2];
  rollback(specificSnapshot);
}

module.exports = { rollback };
