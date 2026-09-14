"use client";

import { useActionState, useEffect, useRef } from "react";

import { createUser } from "@/app/(app)/admin/users/actions";
import { formatEnumLabel } from "@/lib/formatters";
import { USER_ROLE_VALUES, type CreateUserActionState } from "@/lib/validations/user-management";

const initialState: CreateUserActionState = {};

export function CreateUserForm() {
  const formRef = useRef<HTMLFormElement>(null);

  const [state, formAction, pending] = useActionState(createUser, initialState);

  useEffect(() => {
    if (state.success) {
      formRef.current?.reset();
    }
  }, [state.success]);

  return (
    <form
      ref={formRef}
      action={formAction}
      className="min-w-0 rounded-xl border bg-white p-4 shadow-sm sm:p-6"
    >
      <h2 className="text-base font-semibold text-gray-900 sm:text-lg 2xl:text-xl">Create User</h2>

      <p className="mt-1 text-xs leading-5 text-gray-500 sm:text-sm">
        Add a requester, support agent, or administrator account.
      </p>

      <div className="mt-5 grid gap-4 sm:mt-6 sm:gap-5 md:grid-cols-2 xl:grid-cols-1">
        <div className="min-w-0">
          <label
            htmlFor="new-user-name"
            className="block text-xs font-medium text-gray-700 sm:text-sm"
          >
            Full Name
          </label>

          <input
            id="new-user-name"
            name="name"
            type="text"
            required
            minLength={2}
            maxLength={100}
            autoComplete="name"
            placeholder="Enter the user's full name"
            className="mt-2 w-full min-w-0 rounded-lg border border-gray-300 px-3 py-2.5 text-xs text-black transition outline-none focus:border-slate-700 sm:text-sm"
          />

          {state.errors?.name?.map((error) => (
            <p key={error} className="mt-1 text-xs text-red-600 sm:text-sm">
              {error}
            </p>
          ))}
        </div>

        <div className="min-w-0">
          <label
            htmlFor="new-user-email"
            className="block text-xs font-medium text-gray-700 sm:text-sm"
          >
            Email address
          </label>

          <input
            id="new-user-email"
            name="email"
            type="email"
            required
            maxLength={255}
            autoComplete="email"
            placeholder="user@example.com"
            className="mt-2 w-full min-w-0 rounded-lg border border-gray-300 px-3 py-2.5 text-xs text-black transition outline-none focus:border-slate-700 sm:text-sm"
          />

          {state.errors?.email?.map((error) => (
            <p key={error} className="mt-1 text-xs text-red-600 sm:text-sm">
              {error}
            </p>
          ))}
        </div>

        <div>
          <label
            htmlFor="new-user-password"
            className="block text-xs font-medium text-gray-700 sm:text-sm"
          >
            Initial Password
          </label>

          <input
            id="new-user-password"
            name="password"
            type="password"
            required
            minLength={8}
            maxLength={128}
            autoComplete="new-password"
            placeholder="At least 8 characters"
            className="mt-2 w-full min-w-0 rounded-lg border border-gray-300 px-3 py-2.5 text-xs text-black transition outline-none focus:border-slate-700 sm:text-sm"
          />

          {state.errors?.password?.map((error) => (
            <p key={error} className="mt-1 text-xs text-red-600 sm:text-sm">
              {error}
            </p>
          ))}

          <p className="mt-1 text-[11px] leading-5 text-gray-500 sm:text-xs">
            Share the initial password securely with the user. A password-change workflow will be
            added later.
          </p>
        </div>

        <div className="min-w-0">
          <label
            htmlFor="new-user-role"
            className="block text-xs font-medium text-gray-700 sm:text-sm"
          >
            Role
          </label>

          <div className="relative mt-2">
            <select
              id="new-user-role"
              name="role"
              defaultValue="REQUESTER"
              className="w-full appearance-none rounded-lg border border-gray-300 bg-white py-2.5 pr-12 pl-3 text-xs text-black transition outline-none focus:border-slate-700 sm:text-sm"
            >
              {USER_ROLE_VALUES.map((role) => (
                <option key={role} value={role}>
                  {formatEnumLabel(role)}
                </option>
              ))}
            </select>

            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="pointer-events-none absolute top-1/2 right-4 h-4 w-4 -translate-y-1/2 text-gray-700"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="m6 9 6 6 6-6" />
            </svg>
          </div>

          {state.errors?.role?.map((error) => (
            <p key={error} className="mt-1 text-xs text-red-600 sm:text-sm">
              {error}
            </p>
          ))}
        </div>

        <div className="rounded-lg border border-gray-200 bg-gray-50 p-3 sm:p-4 md:col-span-2 xl:col-span-1">
          <div className="flex items-start gap-3">
            <input
              id="new-user-is-demo"
              name="isDemo"
              type="checkbox"
              value="true"
              className="mt-0.5 h-4 w-4 shrink-0 rounded border-gray-300 sm:mt-1"
            />

            <div>
              <label
                htmlFor="new-user-is-demo"
                className="text-xs font-medium text-gray-700 sm:text-sm"
              >
                Demo Account
              </label>

              <p className="mt-1 text-[11px] leading-5 wrap-break-word text-gray-500 sm:text-xs">
                Restricts this account to demo data and prevents it from uploading attachments or
                modifying protected records.
              </p>
            </div>
          </div>

          {state.errors?.isDemo?.map((error) => (
            <p key={error} className="mt-2 text-xs text-red-600 sm:text-sm">
              {error}
            </p>
          ))}
        </div>

        {state.message && (
          <p
            aria-live="polite"
            className={`rounded-lg px-3 py-2.5 text-xs sm:px-4 sm:py-3 sm:text-sm md:col-span-2 xl:col-span-1 ${
              state.success ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
            }`}
          >
            {state.message}
          </p>
        )}

        <button
          type="submit"
          disabled={pending}
          className="w-full rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60 md:col-span-2 xl:col-span-1 2xl:py-3 2xl:text-base"
        >
          {pending ? "Creating account..." : "Create User"}
        </button>
      </div>
    </form>
  );
}
