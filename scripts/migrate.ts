import { migrate } from "drizzle-orm/libsql/migrator";
import { db } from "../lib/db";

async function main() {
  await migrate(db, { migrationsFolder: "./drizzle" });
  console.log("Rayain database migrated successfully.");
}

main().catch((error) => {
  console.error("Rayain database migration failed.", error);
  process.exitCode = 1;
});
