import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { LoginForm } from "@/components/auth/login-form";

export default async function LoginPage() {
  const session = await auth();

  if (session?.user) {
    redirect("/dashboard");
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 px-4">
      <div className="w-full max-w-md rounded-2xl border bg-white p-8 shadow-sm">
        <div className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">
            Help Desk
          </p>

          <h1 className="mt-2 text-3xl font-bold text-gray-900">
            Welcome back
          </h1>

          <p className="mt-2 text-sm text-gray-600">
            Sign in to manage your support requests.
          </p>
        </div>

        <LoginForm />

        {/* Remove Later */}
        <div className="mt-6 rounded-lg bg-gray-50 p-4 text-xs text-gray-600">
          <p>Development account:</p>
          <p className="mt-1">
            requester@helpdesk.local
          </p>
          <p>Password123!</p>
          <p>!!!Remove Later!!!</p>
        </div>
      </div>
    </main>
  );
}