"use client";

import { useActionState } from "react";

import { updateUserAccess } from "@/app/(app)/admin/users/actions";
import { formatEnumLabel } from "@/lib/formatters";
import {
  USER_ROLE_VALUES,
  type UpdateUserAccessState,
  type UserRoleValue,
} from "@/lib/validations/user-management";

type UserAccessCardProps = {
  user: {
    id: string;
    name: string;
    email: string;
    role: UserRoleValue;
    isActive: boolean;
    isDemo: boolean;
    createdAtLabel: string;
    requestedTicketCount: number;
    assignedTicketCount: number;
  };
  currentUserId: string;
};

const initialState: UpdateUserAccessState = {};

const selectClassName =
  "w-full appearance-none rounded-lg border border-slate-300 bg-white py-2.5 pl-3 pr-12 text-xs text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 sm:text-sm 2xl:text-base";

function SelectChevron() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className="pointer-events-none absolute top-1/2 right-4 h-4 w-4 -translate-y-1/2 text-slate-700"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="m6 9 6 6 6-6" />
    </svg>
  );
}

export function UserAccessCard({ user, currentUserId }: UserAccessCardProps) {
  const updateUserWithId = updateUserAccess.bind(null, user.id);

  const [state, formAction, pending] = useActionState(updateUserWithId, initialState);

  const isCurrentUser = user.id === currentUserId;

  return (
    <article className="min-w-0 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="wrap-break-words text-sm font-semibold text-slate-900 sm:text-base 2xl:text-lg">
              {user.name}
            </h2>

            {isCurrentUser && (
              <span className="rounded-full bg-blue-50 px-2.5 py-1 text-[10px] font-medium text-blue-700 sm:text-xs">
                You
              </span>
            )}

            {user.isDemo && (
              <span className="rounded-full bg-violet-50 px-2.5 py-1 text-[10px] font-medium text-violet-700 sm:text-xs">
                Demo
              </span>
            )}

            <span
              className={`rounded-full px-2.5 py-1 text-[10px] font-medium sm:text-xs ${
                user.isActive ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-600"
              }`}
            >
              {user.isActive ? "Active" : "Inactive"}
            </span>
          </div>

          <p className="mt-2 text-xs break-all text-slate-600 sm:text-sm 2xl:text-base">
            {user.email}
          </p>

          <p className="mt-2 text-[11px] text-slate-500 sm:text-xs 2xl:text-sm">
            Created {user.createdAtLabel}
          </p>
        </div>

        <div className="shrink-0 text-left text-[11px] text-slate-500 sm:text-right sm:text-xs 2xl:text-sm">
          <p>
            {user.requestedTicketCount} requested{" "}
            {user.requestedTicketCount === 1 ? "ticket" : "tickets"}
          </p>

          <p className="mt-1">
            {user.assignedTicketCount} assigned{" "}
            {user.assignedTicketCount === 1 ? "ticket" : "tickets"}
          </p>
        </div>
      </div>

      <form action={formAction} className="mt-5 grid gap-4 sm:mt-6 sm:gap-5 md:grid-cols-2">
        <div className="min-w-0">
          <label
            htmlFor={`user-role-${user.id}`}
            className="block text-xs font-medium text-slate-700 sm:text-sm 2xl:text-base"
          >
            Role
          </label>

          <div className="relative mt-2">
            <select
              id={`user-role-${user.id}`}
              name="role"
              defaultValue={user.role}
              className={selectClassName}
            >
              {USER_ROLE_VALUES.map((role) => (
                <option key={role} value={role}>
                  {formatEnumLabel(role)}
                </option>
              ))}
            </select>

            <SelectChevron />
          </div>

          {state.errors?.role?.map((error) => (
            <p key={error} className="mt-1 text-xs text-red-600 sm:text-sm">
              {error}
            </p>
          ))}
        </div>

        <div className="min-w-0">
          <label
            htmlFor={`user-status-${user.id}`}
            className="block text-xs font-medium text-slate-700 sm:text-sm 2xl:text-base"
          >
            Account Status
          </label>

          <div className="relative mt-2">
            <select
              id={`user-status-${user.id}`}
              name="isActive"
              defaultValue={String(user.isActive)}
              className={selectClassName}
            >
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </select>

            <SelectChevron />
          </div>

          {state.errors?.isActive?.map((error) => (
            <p key={error} className="mt-1 text-xs text-red-600 sm:text-sm">
              {error}
            </p>
          ))}
        </div>

        {state.message && (
          <p
            aria-live="polite"
            className={`rounded-lg px-3 py-2.5 text-xs sm:px-4 sm:py-3 sm:text-sm md:col-span-2 ${
              state.success ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"
            }`}
          >
            {state.message}
          </p>
        )}

        <div className="col-span-full flex justify-end">
          <button
            type="submit"
            disabled={pending}
            className="w-full rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto 2xl:px-5 2xl:py-3 2xl:text-base"
          >
            {pending ? "Saving..." : "Save Access"}
          </button>
        </div>
      </form>
    </article>
  );
}
