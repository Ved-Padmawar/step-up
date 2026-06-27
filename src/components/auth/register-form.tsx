"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { useState } from "react";

import { AuthCard } from "@/components/auth/auth-card";

export function RegisterForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setLoading(true);

    const response = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, mobile, password, confirmPassword }),
    });

    const payload = (await response.json()) as { error?: string };

    if (!response.ok) {
      setLoading(false);
      setError(payload.error ?? "Registration failed.");
      return;
    }

    const signInResult = await signIn("credentials", {
      mobile,
      password,
      redirect: false,
    });

    setLoading(false);

    if (signInResult?.error) {
      setError("Account created, but sign-in failed. Try logging in.");
      router.push("/login");
      return;
    }

    router.push("/activities");
    router.refresh();
  }

  return (
    <AuthCard
      title="Create account"
      subtitle="Join the 29-day steps challenge."
      footer={
        <>
          Already registered?{" "}
          <Link href="/login" className="font-medium text-brand">
            Log in
          </Link>
        </>
      }
    >
      <form className="space-y-4" onSubmit={handleSubmit}>
        <label className="block space-y-2">
          <span className="text-sm font-medium text-foreground">Name</span>
          <input
            autoComplete="name"
            className="field-input"
            name="name"
            onChange={(event) => setName(event.target.value)}
            placeholder="Your name"
            required
            type="text"
            value={name}
          />
        </label>

        <label className="block space-y-2">
          <span className="text-sm font-medium text-foreground">Mobile</span>
          <input
            autoComplete="tel"
            className="field-input"
            inputMode="numeric"
            name="mobile"
            onChange={(event) => setMobile(event.target.value)}
            placeholder="10-digit mobile number"
            required
            type="tel"
            value={mobile}
          />
        </label>

        <label className="block space-y-2">
          <span className="text-sm font-medium text-foreground">Password</span>
          <input
            autoComplete="new-password"
            className="field-input"
            minLength={8}
            name="password"
            onChange={(event) => setPassword(event.target.value)}
            placeholder="At least 8 characters"
            required
            type="password"
            value={password}
          />
        </label>

        <label className="block space-y-2">
          <span className="text-sm font-medium text-foreground">
            Confirm password
          </span>
          <input
            autoComplete="new-password"
            className="field-input"
            minLength={8}
            name="confirmPassword"
            onChange={(event) => setConfirmPassword(event.target.value)}
            placeholder="Repeat password"
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
          {loading ? "Creating account…" : "Create account"}
        </button>
      </form>
    </AuthCard>
  );
}
