"use client";

import { useActionState } from "react";

import {
  demoLogin,
  login,
  type LoginState,
} from "@/app/login/actions";

const initialState: LoginState = {};

export function LoginForm() {
  const [
    loginState,
    loginFormAction,
    loginPending,
  ] = useActionState(login, initialState);

  const [
    demoState,
    demoFormAction,
    demoPending,
  ] = useActionState(demoLogin, initialState);

  const anyPending = loginPending || demoPending;

  return (
    <div className="min-w-0 space-y-5 sm:space-y-6">
      {/* Demo login */}
      <form
        action={demoFormAction}
        className="min-w-0 space-y-3 sm:space-y-4"
      >
        <div className="min-w-0">
          <h2 className="text-sm font-semibold text-gray-900 sm:text-base">
            Explore the Demo
          </h2>

          <p className="mt-1 wrap-break-word text-xs leading-5 text-gray-600 sm:text-sm sm:leading-6">
            Choose an account to explore the help desk
            without entering credentials.
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <button
            type="submit"
            name="demoRole"
            value="requester"
            disabled={anyPending}
            className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-800 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60 sm:py-3"
          >
            {demoPending
              ? "Opening demo..."
              : "Demo Requester"}
          </button>

          <button
            type="submit"
            name="demoRole"
            value="agent"
            disabled={anyPending}
            className="w-full rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60 sm:py-3"
          >
            {demoPending
              ? "Opening demo..."
              : "Demo Agent"}
          </button>
        </div>

        {demoState.error && (
          <p
            aria-live="polite"
            className="wrap-break-word rounded-lg bg-red-50 px-3 py-2.5 text-xs text-red-700 sm:px-4 sm:py-3 sm:text-sm"
          >
            {demoState.error}
          </p>
        )}
      </form>

      {/* Divider */}
      <div className="flex items-center gap-3 sm:gap-4">
        <div className="h-px min-w-0 flex-1 bg-gray-200" />

        <span className="shrink-0 text-[10px] font-medium uppercase tracking-wide text-gray-400 sm:text-xs">
          Or sign in
        </span>

        <div className="h-px min-w-0 flex-1 bg-gray-200" />
      </div>

      {/* Standard login */}
      <form
        action={loginFormAction}
        className="min-w-0 space-y-4 sm:space-y-5"
      >
        <div className="min-w-0">
          <label
            htmlFor="email"
            className="block text-xs font-medium text-gray-900 sm:text-sm"
          >
            Email
          </label>

          <input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            placeholder="you@example.com"
            className="mt-2 w-full min-w-0 rounded-lg border border-gray-300 px-3 py-2.5 text-xs text-black outline-none transition placeholder:text-gray-400 focus:border-slate-700 sm:text-sm"
          />
        </div>

        <div className="min-w-0">
          <label
            htmlFor="password"
            className="block text-xs font-medium text-gray-900 sm:text-sm"
          >
            Password
          </label>

          <input
            id="password"
            name="password"
            type="password"
            required
            autoComplete="current-password"
            className="mt-2 w-full min-w-0 rounded-lg border border-gray-300 px-3 py-2.5 text-xs text-black outline-none transition focus:border-slate-700 sm:text-sm"
          />
        </div>

        {loginState.error && (
          <p
            aria-live="polite"
            className="wrap-break-word rounded-lg bg-red-50 px-3 py-2.5 text-xs text-red-700 sm:px-4 sm:py-3 sm:text-sm"
          >
            {loginState.error}
          </p>
        )}

        <button
          type="submit"
          disabled={anyPending}
          className="w-full rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60 sm:py-3"
        >
          {loginPending
            ? "Signing in..."
            : "Sign In"}
        </button>
      </form>
    </div>
  );
}