import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const TMP_DB_NAME = "startup-growth-ae-manager-dashboard.db";

function toSqliteFileUrl(filePath: string) {
  const normalized = filePath.replace(/\\/g, "/");
  return `file:${normalized}`;
}

export function ensureRuntimeSqliteForVercel() {
  if (process.env.VERCEL !== "1") {
    return;
  }

  const sourceDbPath = path.join(process.cwd(), "prisma", "dev.db");
  const runtimeDbPath = path.join(os.tmpdir(), TMP_DB_NAME);

  if (!fs.existsSync(sourceDbPath)) {
    throw new Error(
      `Missing bundled SQLite database at ${sourceDbPath}. Commit prisma/dev.db so Vercel can serve DB-backed routes.`,
    );
  }

  if (!fs.existsSync(runtimeDbPath)) {
    fs.copyFileSync(sourceDbPath, runtimeDbPath);
  }

  process.env.DATABASE_URL = toSqliteFileUrl(runtimeDbPath);
}
