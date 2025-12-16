import { sql } from "@/db/index";
import { readFileSync } from "fs";
import { join } from "path";

async function runMigration() {
  try {
    console.log("Running migration: add-name-to-users-sync");

    const migrationSQL = readFileSync(
      join(process.cwd(), "src/db/migrations/add-name-to-users-sync.sql"),
      "utf-8"
    );

    await sql.query(migrationSQL);

    console.log("✅ Migration completed successfully!");
  } catch (error) {
    console.error("❌ Migration failed:", error);
    process.exit(1);
  }
}

runMigration();
