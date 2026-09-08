import Database from "better-sqlite3";
import { mkdirSync } from "node:fs";
import { dirname, isAbsolute, resolve } from "node:path";
import { drizzle } from "drizzle-orm/better-sqlite3";
import * as schema from "./schema";

const configuredDatabaseUrl = process.env.DATABASE_URL ?? "./data/rayain.db";
const databasePath = configuredDatabaseUrl.startsWith("file:")
  ? configuredDatabaseUrl.slice("file:".length)
  : configuredDatabaseUrl;
const resolvedDatabasePath = databasePath === ":memory:" || databasePath === "file::memory:"
  ? databasePath
  : isAbsolute(databasePath)
    ? databasePath
    : resolve(/* turbopackIgnore: true */ process.cwd(), databasePath);

if (resolvedDatabasePath !== ":memory:" && resolvedDatabasePath !== "file::memory:") {
  mkdirSync(dirname(resolvedDatabasePath), { recursive: true });
}

const sqlite = new Database(resolvedDatabasePath);
sqlite.pragma("journal_mode = WAL");

export const db = drizzle(sqlite, { schema });
export { sqlite };
