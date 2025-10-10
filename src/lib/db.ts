// src/lib/db.ts
import { PrismaClient } from "@prisma/client";

declare global {
  // Supaya tidak double instance pas hot reload di Next.js
  // (hanya berlaku di dev mode)
  var prisma: PrismaClient | undefined;
}

export const prisma =
  global.prisma ||
  new PrismaClient({
    log: ["query", "info", "warn", "error"], // biar keliatan query2 yg jalan di console
  });

if (process.env.NODE_ENV !== "production") {
  global.prisma = prisma;
}
