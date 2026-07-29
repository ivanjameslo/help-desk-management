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
    <div className="space-y-6">
      <form action={demoFormAction} className="space-y-3">
        <div>
          <h2 className="text-sm font-semibold text-gray-900">
            Explore the Demo
          </h2>

          <p className="mt-1 text-sm leading-6 text-gray-600">
            Choose an account to explore the help desk without entering
            credentials.
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <button
            type="submit"
            name="demoRole"
            value="requester"
            disabled={anyPending}
            className="rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm font-medium text-slate-800 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
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
            className="rounded-lg bg-slate-900 px-4 py-3 text-sm font-medium text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {demoPending
              ? "Opening demo..."
              : "Demo Agent"}
          </button>
        </div>

        {demoState.error && (
          <p
            aria-live="polite"
            className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700"
          >
            {demoState.error}
          </p>
        )}
      </form>

      <div className="flex items-center gap-4">
        <div className="h-px flex-1 bg-gray-200" />

        <span className="text-xs font-medium uppercase tracking-wide text-gray-400">
          Or sign in
        </span>

        <div className="h-px flex-1 bg-gray-200" />
      </div>

      <form action={loginFormAction} className="space-y-5">
        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-900"
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
            className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-black outline-none focus:border-slate-700"
          />
        </div>

        <div>
          <label
            htmlFor="password"
            className="block text-sm font-medium text-gray-900"
          >
            Password
          </label>

          <input
            id="password"
            name="password"
            type="password"
            required
            autoComplete="current-password"
            className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-black outline-none focus:border-slate-700"
          />
        </div>

        {loginState.error && (
          <p
            aria-live="polite"
            className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700"
          >
            {loginState.error}
          </p>
        )}

        <button
          type="submit"
          disabled={anyPending}
          className="w-full rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loginPending ? "Signing in..." : "Sign In"}
        </button>
      </form>
    </div>
  );
}