import { createClient } from "@libsql/client";
import { mkdirSync } from "node:fs";
import { dirname, isAbsolute, resolve } from "node:path";
import { drizzle } from "drizzle-orm/libsql";
import * as schema from "./schema";

const configuredDatabaseUrl = process.env.TURSO_DATABASE_URL ?? process.env.DATABASE_URL ?? "./data/rayain.db";
const isRemoteDatabase = configuredDatabaseUrl.startsWith("libsql://") || configuredDatabaseUrl.startsWith("https://");
const databasePath = isRemoteDatabase
  ? ""
  : configuredDatabaseUrl.startsWith("file:")
    ? configuredDatabaseUrl.slice("file:".length)
    : configuredDatabaseUrl;
const resolvedDatabasePath = isRemoteDatabase
  ? ""
  : databasePath === ":memory:" || databasePath === "file::memory:"
    ? databasePath
    : isAbsolute(databasePath)
      ? databasePath
      : resolve(/* turbopackIgnore: true */ process.cwd(), databasePath);

if (!isRemoteDatabase && resolvedDatabasePath !== ":memory:" && resolvedDatabasePath !== "file::memory:") {
  mkdirSync(dirname(resolvedDatabasePath), { recursive: true });
}

const url = isRemoteDatabase
  ? configuredDatabaseUrl
  : `file:${resolvedDatabasePath.replaceAll("\\", "/")}`;
const client = createClient({
  url,
  ...(process.env.TURSO_AUTH_TOKEN ? { authToken: process.env.TURSO_AUTH_TOKEN } : {}),
});

export const db = drizzle(client, { schema });
export { client };
