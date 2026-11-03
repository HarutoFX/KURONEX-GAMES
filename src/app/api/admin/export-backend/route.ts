import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { getCurrentUser, User } from "@/lib/auth";
import { isAdminRole } from "@/lib/security/rbac";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser || !isAdminRole(currentUser.role)) {
      return NextResponse.json(
        { error: "Unauthorized: Super Administrator privileges required." },
        { status: 401 }
      );
    }

    const usersPath = path.join(process.cwd(), "src", "data", "users.json");
    const rawData = fs.readFileSync(usersPath, "utf-8");
    const allUsers: User[] = JSON.parse(rawData || "[]");

    // Filter all administrators
    const adminUsers = allUsers.filter((u) => isAdminRole(u.role));

    // 1. Generate Production SQL Seed (PostgreSQL / Supabase / Neon compatible)
    const sqlValues = adminUsers
      .map(
        (u) =>
          `  ('${u.id}', '${u.username.replace(/'/g, "''")}', '${u.email.replace(/'/g, "''")}', '${u.passwordHash}', '${u.salt}', '${u.role.toUpperCase()}', '${u.createdAt}', NOW())`
      )
      .join(",\n");

    const sqlScript = `-- ============================================================================
-- KURONEX GAMES — Production Administrator Credentials Seed Script
-- Target RDBMS: PostgreSQL 14+, Supabase, Neon, CockroachDB
-- Cryptography: scrypt-derived 64-byte hashes with 16-byte cryptographically-secure salts
-- ============================================================================

CREATE TABLE IF NOT EXISTS "users" (
  "id" VARCHAR(64) PRIMARY KEY,
  "username" VARCHAR(50) NOT NULL UNIQUE,
  "email" VARCHAR(255) NOT NULL UNIQUE,
  "password_hash" VARCHAR(128) NOT NULL,
  "salt" VARCHAR(64) NOT NULL,
  "role" VARCHAR(32) NOT NULL DEFAULT 'PLAYER',
  "created_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

INSERT INTO "users" ("id", "username", "email", "password_hash", "salt", "role", "created_at", "updated_at")
VALUES
${sqlValues}
ON CONFLICT ("email") 
DO UPDATE SET 
  "username" = EXCLUDED."username",
  "password_hash" = EXCLUDED."password_hash",
  "salt" = EXCLUDED."salt",
  "role" = EXCLUDED."role",
  "updated_at" = NOW();
`;

    // 2. Generate Prisma ORM Seed Snippet
    const prismaSeed = `// prisma/seed.ts (Run with: npx prisma db seed)
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const adminAccounts = ${JSON.stringify(
      adminUsers.map((u) => ({
        id: u.id,
        username: u.username,
        email: u.email,
        passwordHash: u.passwordHash,
        salt: u.salt,
        role: u.role.toUpperCase(),
        createdAt: new Date(u.createdAt),
      })),
      null,
      2
    )};

async function main() {
  console.log("Seeding verified KURONEX administrator credentials...");
  for (const admin of adminAccounts) {
    await prisma.user.upsert({
      where: { email: admin.email },
      update: {
        username: admin.username,
        passwordHash: admin.passwordHash,
        salt: admin.salt,
        role: admin.role,
      },
      create: admin,
    });
    console.log(\`  ✓ Seeded admin: \${admin.username} (\${admin.email})\`);
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
`;

    // 3. Sanitized JSON export
    const jsonExport = adminUsers.map((u) => ({
      id: u.id,
      username: u.username,
      email: u.email,
      passwordHash: u.passwordHash,
      salt: u.salt,
      role: u.role,
      createdAt: u.createdAt,
    }));

    return NextResponse.json(
      {
        success: true,
        count: adminUsers.length,
        adminUsers: jsonExport,
        sqlScript,
        prismaSeed,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Export backend credentials error:", error);
    return NextResponse.json(
      { error: "Failed to generate backend credential seed." },
      { status: 500 }
    );
  }
}
