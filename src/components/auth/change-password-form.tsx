"use client";

import { useRouter } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { useState } from "react";

import { AuthCard } from "@/components/auth/auth-card";
import { DEFAULT_PARTICIPANT_PASSWORD } from "@/lib/default-password";

export function ChangePasswordForm() {
  const router = useRouter();
  const { update } = useSession();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setLoading(true);

    const response = await fetch("/api/auth/change-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        currentPassword,
        newPassword,
        confirmPassword,
      }),
    });

    const payload = (await response.json()) as { error?: string };
    setLoading(false);

    if (!response.ok) {
      setError(payload.error ?? "Could not change password.");
      return;
    }

    await update({ user: { mustChangePassword: false } });
    router.push("/activities");
    router.refresh();
  }

  return (
    <AuthCard
      title="Set your password"
      subtitle={`Your temporary password is "${DEFAULT_PARTICIPANT_PASSWORD}". Choose a new password to continue.`}
      footer={
        <button
          className="font-medium text-brand"
          onClick={() => signOut({ callbackUrl: "/login" })}
          type="button"
        >
          Log out
        </button>
      }
    >
      <form className="space-y-4" onSubmit={handleSubmit}>
        <label className="block space-y-2">
          <span className="text-sm font-medium text-foreground">Current password</span>
          <input
            autoComplete="current-password"
            className="field-input"
            onChange={(event) => setCurrentPassword(event.target.value)}
            placeholder={DEFAULT_PARTICIPANT_PASSWORD}
            required
            type="password"
            value={currentPassword}
          />
        </label>

        <label className="block space-y-2">
          <span className="text-sm font-medium text-foreground">New password</span>
          <input
            autoComplete="new-password"
            className="field-input"
            minLength={8}
            onChange={(event) => setNewPassword(event.target.value)}
            placeholder="At least 8 characters"
            required
            type="password"
            value={newPassword}
          />
        </label>

        <label className="block space-y-2">
          <span className="text-sm font-medium text-foreground">Confirm new password</span>
          <input
            autoComplete="new-password"
            className="field-input"
            minLength={8}
            onChange={(event) => setConfirmPassword(event.target.value)}
            placeholder="Repeat new password"
            required
            type="password"
            value={confirmPassword}
          />
        </label>

        {error ? (
          <p className="rounded-2xl bg-danger/10 px-4 py-3 text-sm text-danger">
            {error}
          </p>
        ) : null}

        <button
          className="w-full rounded-2xl bg-brand px-4 py-3 text-base font-semibold text-white transition hover:bg-brand-dark disabled:opacity-60"
          disabled={loading}
          type="submit"
        >
          {loading ? "Saving…" : "Save password"}
        </button>
      </form>
    </AuthCard>
  );
}
