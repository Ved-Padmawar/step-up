import Link from "next/link";

import { auth, signOut } from "@/auth";

export default async function AppLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const session = await auth();

  return (
    <div className="flex min-h-full flex-col bg-background">
      <header className="sticky top-0 z-10 border-b border-black/5 bg-surface/95 backdrop-blur">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand">
              Step Up
            </p>
            <p className="text-sm text-muted">29-day challenge</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="rounded-full bg-brand/10 px-3 py-1 text-sm font-medium text-brand">
              {session?.user.name}
            </span>
            <form
              action={async () => {
                "use server";
                await signOut({ redirectTo: "/login" });
              }}
            >
              <button
                className="text-sm font-medium text-muted hover:text-foreground"
                type="submit"
              >
                Log out
              </button>
            </form>
          </div>
        </div>
        <nav className="mx-auto flex max-w-3xl gap-2 px-4 pb-3">
          <NavLink href="/activities">Activities</NavLink>
          <NavLink href="/log">Log</NavLink>
          <NavLink href="/leaderboard">Leaderboard</NavLink>
          {session?.user.role === "admin" ? (
            <NavLink href="/admin">Admin</NavLink>
          ) : null}
        </nav>
      </header>
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-6">{children}</main>
    </div>
  );
}

function NavLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      className="rounded-full px-4 py-2 text-sm font-medium text-muted transition hover:bg-brand/10 hover:text-brand"
      href={href}
    >
      {children}
    </Link>
  );
}
