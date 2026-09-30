"use client";

import { useActionState } from "react";

import { demoLogin, login, type LoginState } from "@/app/login/actions";

const initialState: LoginState = {};

export function LoginForm() {
  const [loginState, loginFormAction, loginPending] = useActionState(login, initialState);

  const [demoState, demoFormAction, demoPending] = useActionState(demoLogin, initialState);

  const anyPending = loginPending || demoPending;

  return (
    <div className="min-w-0 space-y-5 sm:space-y-6">
      {/* Demo login */}
      <form
        action={demoFormAction}
        className="min-w-0 rounded-xl border border-slate-200 bg-slate-50/70 p-4 sm:p-5"
      >
        <div className="min-w-0">
          <h2 className="text-sm font-semibold text-slate-900 sm:text-base">Explore the Demo</h2>

          <p className="mt-1 text-xs leading-5 wrap-break-word text-slate-600 sm:text-sm sm:leading-6">
            Choose a role to explore the help desk without entering credentials.
          </p>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <button
            type="submit"
            name="demoRole"
            value="requester"
            disabled={anyPending}
            className="w-full rounded-lg border border-blue-200 bg-blue-50 px-4 py-2.5 text-sm font-medium text-blue-700 shadow-sm transition hover:border-blue-300 hover:bg-blue-100 disabled:cursor-not-allowed disabled:opacity-60 sm:py-3"
          >
            {demoPending ? "Opening demo..." : "Demo Requester"}
          </button>

          <button
            type="submit"
            name="demoRole"
            value="agent"
            disabled={anyPending}
            className="w-full rounded-lg border border-violet-200 bg-violet-50 px-4 py-2.5 text-sm font-medium text-violet-700 shadow-sm transition hover:border-violet-300 hover:bg-violet-100 disabled:cursor-not-allowed disabled:opacity-60 sm:py-3"
          >
            {demoPending ? "Opening demo..." : "Demo Agent"}
          </button>
        </div>

        {demoState.error && (
          <p
            aria-live="polite"
            className="mt-3 rounded-lg bg-red-50 px-3 py-2.5 text-xs wrap-break-word text-red-700 sm:px-4 sm:py-3 sm:text-sm"
          >
            {demoState.error}
          </p>
        )}
      </form>

      {/* Divider */}
      <div className="flex items-center gap-3 sm:gap-4">
        <div className="h-px min-w-0 flex-1 bg-slate-200" />

        <span className="shrink-0 text-[10px] font-medium tracking-wide text-slate-400 uppercase sm:text-xs">
          Or sign in
        </span>

        <div className="h-px min-w-0 flex-1 bg-slate-200" />
      </div>

      {/* Standard login */}
      <form action={loginFormAction} className="min-w-0 space-y-4 sm:space-y-5">
        <div className="min-w-0">
          <label htmlFor="email" className="block text-xs font-medium text-slate-700 sm:text-sm">
            Email
          </label>

          <input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            placeholder="you@example.com"
            className="mt-2 w-full min-w-0 rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-xs text-slate-900 transition outline-none placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 sm:text-sm"
          />
        </div>

        <div className="min-w-0">
          <label htmlFor="password" className="block text-xs font-medium text-slate-700 sm:text-sm">
            Password
          </label>

          <input
            id="password"
            name="password"
            type="password"
            required
            autoComplete="current-password"
            className="mt-2 w-full min-w-0 rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-xs text-slate-900 transition outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 sm:text-sm"
          />
        </div>

        {loginState.error && (
          <p
            aria-live="polite"
            className="rounded-lg bg-red-50 px-3 py-2.5 text-xs wrap-break-word text-red-700 sm:px-4 sm:py-3 sm:text-sm"
          >
            {loginState.error}
          </p>
        )}

        <button
          type="submit"
          disabled={anyPending}
          className="w-full rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60 sm:py-3"
        >
          {loginPending ? "Signing in..." : "Sign In"}
        </button>
      </form>
    </div>
  );
}
