import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function AdminPage() {
  const session = await auth();

  if (session?.user.role !== "admin") {
    redirect("/activities");
  }

  return (
    <section className="rounded-3xl border border-black/5 bg-surface p-6">
      <h1 className="text-2xl font-semibold text-foreground">Admin</h1>
      <p className="mt-2 text-muted">
        Activity moderation and participant management come later in the build.
      </p>
    </section>
  );
}
