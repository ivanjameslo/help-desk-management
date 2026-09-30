import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { LoginForm } from "@/components/auth/login-form";

export default async function LoginPage() {
  const session = await auth();

  if (session?.user) {
    redirect("/dashboard");
  }

  return (
    <main className="relative flex min-h-dvh items-center justify-center overflow-x-hidden overflow-y-hidden bg-linear-to-br from-slate-950 via-slate-900 to-blue-950 px-4 py-6 sm:px-6 sm:py-8 [@media(min-height:850px)]:items-center">
      <div
        aria-hidden="true"
        className="login-glow-blue absolute -top-32 -right-32 size-80 rounded-full bg-blue-500/10 blur-3xl"
      />

      <div
        aria-hidden="true"
        className="login-glow-cyan absolute -bottom-40 -left-32 size-96 rounded-full bg-cyan-500/10 blur-3xl"
      />

      <div className="relative w-full max-w-md min-w-0 rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl shadow-black/20 sm:p-8">
        {" "}
        <div className="mb-6 sm:mb-8">
          <div className="flex items-center gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-linear-to-br from-cyan-500 to-blue-600 text-white shadow-sm">
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                className="size-5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M8 10h.01M12 10h.01M16 10h.01M21 12c0 4.418-4.03 8-9 8a10.5 10.5 0 0 1-4.42-.96L3 20l1.18-3.54A7.36 7.36 0 0 1 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8Z"
                />
              </svg>
            </div>

            <div>
              <p className="text-lg font-bold text-slate-900">
                Help <span className="text-blue-600">Desk</span>
              </p>

              <p className="text-xs text-slate-500">Management System</p>
            </div>
          </div>

          <h1 className="mt-6 text-2xl font-bold wrap-break-word text-slate-900 sm:text-3xl 2xl:text-4xl">
            Welcome back
          </h1>

          <p className="mt-2 text-xs leading-5 wrap-break-word text-slate-600 sm:text-sm sm:leading-6">
            Sign in to manage support requests, or explore the system using a demo account.
          </p>
        </div>
        <LoginForm />
      </div>
    </main>
  );
}
