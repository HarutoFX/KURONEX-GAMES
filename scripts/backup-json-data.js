/* eslint-disable @typescript-eslint/no-require-imports */
/**
 * KURONEX GAMES - Automated Data Backup Utility
 * Creates a timestamped, checksummed backup snapshot of all data records.
 */

const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

function calculateChecksum(filePath) {
  if (!fs.existsSync(filePath)) return null;
  const content = fs.readFileSync(filePath);
  return crypto.createHash("sha256").update(content).digest("hex");
}

function createBackup() {
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const dataDir = path.join(process.cwd(), "src", "data");
  const backupBaseDir = path.join(process.cwd(), "backups", "json-snapshots");
  const targetDir = path.join(backupBaseDir, `snapshot-${timestamp}`);

  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }

  const manifest = {
    snapshotTimestamp: new Date().toISOString(),
    files: {},
  };

  const filesToBackup = [
    "users.json",
    "sessions.json",
    "library-games.json",
    "developers.json",
    "downloads.json",
    "announcements.json",
    "audit-logs.json",
    "platform-settings.json",
  ];

  for (const fileName of filesToBackup) {
    const srcPath = path.join(dataDir, fileName);
    const destPath = path.join(targetDir, fileName);

    if (fs.existsSync(srcPath)) {
      const content = fs.readFileSync(srcPath);
      fs.writeFileSync(destPath, content);
      const hash = calculateChecksum(destPath);
      manifest.files[fileName] = {
        bytes: content.length,
        sha256: hash,
        recordCount: (() => {
          try {
            const parsed = JSON.parse(content.toString("utf-8"));
            return Array.isArray(parsed) ? parsed.length : 1;
          } catch {
            return 0;
          }
        })(),
      };
    }
  }

  const manifestPath = path.join(targetDir, "manifest.json");
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2), "utf-8");

  console.log(`[BACKUP] Snapshot created successfully at: ${targetDir}`);
  console.log(`[BACKUP] Manifest:`, JSON.stringify(manifest, null, 2));
  return { targetDir, manifest };
}

if (require.main === module) {
  createBackup();
}

module.exports = { createBackup, calculateChecksum };
