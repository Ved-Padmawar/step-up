import { config } from "dotenv";
import { eq } from "drizzle-orm";

config({ path: ".env.local" });
config();

import { createDb } from "../src/db";
import { users } from "../src/db/schema";
import { normalizeMobile, validateIndianMobile } from "../src/lib/mobile";
import { hashPassword } from "../src/lib/password";

async function main() {
  const name = process.env.ADMIN_NAME?.trim();
  const mobile = normalizeMobile(process.env.ADMIN_MOBILE ?? "");
  const password = process.env.ADMIN_PASSWORD ?? "";

  if (!name || !validateIndianMobile(mobile) || password.length < 8) {
    throw new Error(
      "Set ADMIN_NAME, ADMIN_MOBILE (10-digit Indian), and ADMIN_PASSWORD (min 8 chars) in .env.local",
    );
  }

  const db = createDb();
  const passwordHash = await hashPassword(password);

  await db
    .insert(users)
    .values({
      name,
      mobile,
      passwordHash,
      role: "admin",
    })
    .onConflictDoUpdate({
      target: users.mobile,
      set: {
        name,
        passwordHash,
        role: "admin",
      },
    });

  console.log(`Seeded admin user for mobile ending in ${mobile.slice(-4)}.`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
