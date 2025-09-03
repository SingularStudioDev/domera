// =============================================================================
// PRISMA CLIENT SINGLETON
// Ensures single Prisma instance across the application
// =============================================================================

import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

// Helper function to safely disconnect
export async function disconnectPrisma() {
  try {
    await prisma.$disconnect();
  } catch (error) {
    console.error("Error disconnecting Prisma:", error);
  }
}

// Helper function to test connection
export async function testPrismaConnection() {
  try {
    await prisma.$connect();
    console.log("✅ Prisma connection successful");
    return true;
  } catch (error) {
    console.error("❌ Prisma connection failed:", error);
    return false;
  }
}
