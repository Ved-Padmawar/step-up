import type { ReactNode } from "react";

type AuthCardProps = {
  title: string;
  subtitle: string;
  children: ReactNode;
  footer: ReactNode;
};

export function AuthCard({ title, subtitle, children, footer }: AuthCardProps) {
  return (
    <div className="mx-auto flex min-h-full w-full max-w-md flex-col justify-center px-4 py-10">
      <div className="mb-8 text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand text-lg font-bold text-white shadow-sm">
          SU
        </div>
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-brand">
          Step Up
        </p>
        <h1 className="mt-2 text-3xl font-semibold text-foreground">{title}</h1>
        <p className="mt-2 text-muted">{subtitle}</p>
      </div>

      <div className="rounded-3xl border border-black/5 bg-surface p-6 shadow-sm">
        {children}
      </div>

      <div className="mt-6 text-center text-sm text-muted">{footer}</div>
    </div>
  );
}
