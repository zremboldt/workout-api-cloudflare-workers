import {
  defineWorkersProject,
  readD1Migrations,
} from "@cloudflare/vitest-pool-workers/config";
import path from "node:path";

export default defineWorkersProject(async () => {
  // Read all migrations in the migrations directory
  const migrationsPath = path.join(__dirname, "src/db/migrations");
  const migrations = await readD1Migrations(migrationsPath);

  return {
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    test: {
      setupFiles: ["./src/test-setup/apply-migrations.ts"],
      poolOptions: {
        workers: {
          singleWorker: true,
          wrangler: {
            configPath: "./wrangler.jsonc",
            environment: "test",
          },
          miniflare: {
            // Add a test-only binding for migrations
            bindings: { TEST_MIGRATIONS: migrations },
          },
        },
      },
    },
  };
});
