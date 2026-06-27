import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";

import { appConfig } from "@/config";
import * as schema from "./schema";

export function createDb() {
  const sql = neon(appConfig.databaseUrl);
  return drizzle(sql, { schema });
}

export type Db = ReturnType<typeof createDb>;

let db: Db | undefined;

export function getDb() {
  if (!db) {
    db = createDb();
  }
  return db;
}

export { schema };
