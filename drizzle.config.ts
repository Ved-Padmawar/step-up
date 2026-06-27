import { defineConfig } from "drizzle-kit";

import { appConfig } from "./src/config";

export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: appConfig.databaseUrl,
  },
});
