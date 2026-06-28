import { eq } from "drizzle-orm";

import { appConfig } from "../src/config";
import { createDb } from "../src/db";
import { users } from "../src/db/schema";
import { normalizeMobile } from "../src/lib/mobile";
import { hashPassword } from "../src/lib/password";

async function main() {
  const { name, mobile: adminMobile, password } = appConfig.admin;
  const mobile = normalizeMobile(adminMobile);

  const db = createDb();
  const passwordHash = await hashPassword(password);

  await db
    .insert(users)
    .values({
      name,
      mobile,
      passwordHash,
      role: "admin",
      mustChangePassword: false,
    })
    .onConflictDoUpdate({
      target: users.mobile,
      set: {
        name,
        passwordHash,
        role: "admin",
        mustChangePassword: false,
      },
    });

  console.log(`Seeded admin user for mobile ending in ${mobile.slice(-4)}.`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
