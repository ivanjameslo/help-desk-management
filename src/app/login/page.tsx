import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { LoginForm } from "@/components/auth/login-form";

export default async function LoginPage() {
  const session = await auth();

  if (session?.user) {
    redirect("/dashboard");
  }

  return (
    <main className="flex min-h-dvh items-start justify-center bg-slate-100 px-4 py-6 sm:items-center sm:px-6 sm:py-8">
      <div className="w-full max-w-md min-w-0 rounded-2xl border bg-white p-5 shadow-sm sm:p-8">
        <div className="mb-6 sm:mb-8">
          <p className="text-xs font-semibold tracking-wide text-slate-500 uppercase sm:text-sm">
            Help Desk
          </p>

          <h1 className="mt-2 text-2xl font-bold wrap-break-word text-gray-900 sm:text-3xl 2xl:text-4xl">
            Welcome back
          </h1>

          <p className="mt-2 text-xs leading-5 wrap-break-word text-gray-600 sm:text-sm sm:leading-6">
            Sign in to manage your support requests.
          </p>
        </div>

        <LoginForm />
      </div>
    </main>
  );
}
