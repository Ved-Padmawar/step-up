import { auth } from "@/auth";

export async function requireAdminSession() {
  const session = await auth();

  if (!session?.user?.id) {
    return { error: "Unauthorized" as const, status: 401 as const };
  }

  if (session.user.role !== "admin") {
    return { error: "Forbidden" as const, status: 403 as const };
  }

  return { session };
}
