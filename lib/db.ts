import { PrismaClient } from "@prisma/client";

import { ensureRuntimeSqliteForVercel } from "@/lib/runtime-sqlite";

ensureRuntimeSqliteForVercel();

declare global {
  var prisma: PrismaClient | undefined;
}

export const db =
  global.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  global.prisma = db;
}
