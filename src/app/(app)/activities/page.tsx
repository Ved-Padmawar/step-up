import { auth } from "@/auth";

export default async function ActivitiesPage() {
  const session = await auth();

  return (
    <section className="space-y-6">
      <div className="rounded-3xl bg-gradient-to-br from-brand to-brand-dark p-6 text-white shadow-sm">
        <p className="text-sm uppercase tracking-[0.2em] text-white/80">
          Welcome back
        </p>
        <h1 className="mt-2 text-3xl font-semibold">{session?.user.name}</h1>
        <p className="mt-3 max-w-xl text-white/90">
          Your dashboard, logging flow, and leaderboard are coming next. Auth is
          live — you can register, log in, and stay signed in across visits.
        </p>
      </div>

      <div className="rounded-3xl border border-black/5 bg-surface p-6">
        <h2 className="text-lg font-semibold text-foreground">Signed in as</h2>
        <dl className="mt-4 space-y-3 text-sm">
          <div className="flex justify-between gap-4">
            <dt className="text-muted">Mobile</dt>
            <dd className="font-medium text-foreground">{session?.user.mobile}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-muted">Role</dt>
            <dd className="font-medium capitalize text-foreground">
              {session?.user.role}
            </dd>
          </div>
        </dl>
      </div>
    </section>
  );
}
