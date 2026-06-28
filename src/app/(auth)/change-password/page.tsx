import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { ChangePasswordForm } from "@/components/auth/change-password-form";

export default async function ChangePasswordPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  if (!session.user.mustChangePassword) {
    redirect("/activities");
  }

  return (
    <main className="mx-auto flex min-h-full max-w-md items-center px-4 py-10">
      <div className="w-full">
        <ChangePasswordForm />
      </div>
    </main>
  );
}
