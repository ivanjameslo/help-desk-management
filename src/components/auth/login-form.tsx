"use client";

import { useActionState } from "react";

import { login, type LoginState } from "@/app/login/actions";

const initialState: LoginState = {};

export function LoginForm() {
    const [state, formAction, pending ] = useActionState(
        login,
        initialState,
    );

    return (
        <form action={formAction} className="space-y-5">
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
                    className="mt-2 w-full text-black rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-slate-700"
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
                    className="mt-2 w-full text-black rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-slate-700"
                />
            </div>

            {state.error && (
                <p
                    aria-live="polite"
                    className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700"
                >
                    {state.error}
                </p>
            )}

            <button
                type="submit"
                disabled={pending}
                className="w-full rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
                {pending ? "Signing in..." : "Sign In"}
            </button>
        </form>
    )
}
