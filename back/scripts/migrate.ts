import { runMigrations } from "../src/lib/db/migrate";

async function main() {
  console.log("Running migrations...");
  await runMigrations();
  console.log("Migrations complete!");
  process.exit(0);
}

main().catch((err) => {
  console.error("Migration failed", err);
  process.exit(1);
});
