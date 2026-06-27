import { eq } from "drizzle-orm";
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";

import { getDb } from "@/db";
import { users } from "@/db/schema";
import { normalizeMobile, validateIndianMobile } from "@/lib/mobile";
import { verifyPassword } from "@/lib/password";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name: string;
      email: string;
      emailVerified: Date | null;
      mobile: string;
      role: string;
    };
  }

  interface User {
    id: string;
    name: string;
    email: string;
    emailVerified: Date | null;
    mobile: string;
    role: string;
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
  },
  providers: [
    Credentials({
      name: "mobile",
      credentials: {
        mobile: { label: "Mobile", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const mobile = normalizeMobile(String(credentials?.mobile ?? ""));
        const password = String(credentials?.password ?? "");

        if (!validateIndianMobile(mobile) || password.length < 8) {
          return null;
        }

        const db = getDb();
        const [user] = await db
          .select()
          .from(users)
          .where(eq(users.mobile, mobile))
          .limit(1);

        if (!user) {
          return null;
        }

        const valid = await verifyPassword(password, user.passwordHash);
        if (!valid) {
          return null;
        }

        return {
          id: user.id,
          name: user.name,
          email: `${user.mobile}@step-up.local`,
          emailVerified: null,
          mobile: user.mobile,
          role: user.role,
        } satisfies import("next-auth").User;
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.mobile = user.mobile;
      }
      return token;
    },
    session({ session, token }) {
      session.user = {
        id: String(token.id ?? ""),
        name: String(session.user?.name ?? ""),
        email: String(session.user?.email ?? token.email ?? ""),
        emailVerified: null,
        mobile: String(token.mobile ?? ""),
        role: String(token.role ?? "user"),
      };
      return session;
    },
  },
});
