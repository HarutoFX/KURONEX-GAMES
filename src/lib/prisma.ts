import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  __kuronexPrisma?: PrismaClient;
};

function createPrismaClient(): PrismaClient {
  return new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });
}

export const prisma: PrismaClient =
  globalForPrisma.__kuronexPrisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.__kuronexPrisma = prisma;
}

export default prisma;

