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
        createdAtLabel: string;
        requestedTicketCount: number;
        assignedTicketCount: number;
    };
    currentUserId: string;
};

const initialState: UpdateUserAccessState = {};

export function UserAccessCard({
    user,
    currentUserId,
}: UserAccessCardProps) {
    const updateUserWithId = updateUserAccess.bind(
        null,
        user.id,
    );

    const [state, formAction, pending] = useActionState(
        updateUserWithId,
        initialState,
    );

    const isCurrentUser = user.id === currentUserId;

    return (
        <article className="rounded-xl border bg-white p-6 shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                    <div className="flex flex-wrap items-center gap-2">
                        <h2 className="font-semibold text-gray-900">
                            {user.name}
                        </h2>

                        {isCurrentUser && (
                            <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700">
                                You
                            </span>
                        )}

                        <span
                            className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                                user.isActive
                                ? "bg-green-50 text-green-700"
                                : "bg-gray-100 text-gray-600"
                            }`}
                        >
                            {user.isActive ? "Active" : "Inactive"}
                        </span>
                    </div>

                    <p className="mt-2 text-sm text-gray-600">
                        {user.email}
                    </p>

                    <p className="mt-2 text-xs text-gray-500">
                        Created {user.createdAtLabel}
                    </p>
                </div>

                <div className="text-right text-xs text-gray-500">
                    <p>
                        {user.requestedTicketCount} requested{" "}
                        {user.requestedTicketCount === 1
                        ? "ticket"
                        : "tickets"}
                    </p>

                    <p className="mt-1">
                        {user.assignedTicketCount} assigned{" "}
                        {user.assignedTicketCount === 1
                        ? "ticket"
                        : "tickets"}
                    </p>
                </div>
            </div>

            <form action={formAction} className="mt-6 space-y-5">
                <div>
                    <label
                        htmlFor={`user-role-${user.id}`}
                        className="block text-sm font-medium text-gray-700"
                    >
                        Role
                    </label>

                    <select
                        id={`user-role-${user.id}`}
                        name="role"
                        defaultValue={user.role}
                        className="mt-2 w-full text-black rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-slate-700"
                    >
                        {USER_ROLE_VALUES.map((role) => (
                            <option key={role} value={role}>
                                {formatEnumLabel(role)}
                            </option>
                        ))}
                    </select>

                    {state.errors?.role?.map((error) => (
                        <p
                            key={error}
                            className="mt-1 text-sm text-red-600"
                        >
                            {error}
                        </p>
                    ))}
                </div>

                <div>
                    <label
                        htmlFor={`user-status-${user.id}`}
                        className="block text-sm font-medium text-gray-700"
                    >
                        Account Status
                    </label>

                    <select
                        id={`user-status-${user.id}`}
                        name="isActive"
                        defaultValue={String(user.isActive)}
                        className="mt-2 w-full text-black rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-slate-700"
                    >
                        <option value="true">Active</option>
                        <option value="false">Inactive</option>
                    </select>

                    {state.errors?.isActive?.map((error) => (
                        <p
                            key={error}
                            className="mt-1 text-sm text-red-600"
                        >
                            {error}
                        </p>
                    ))}
                </div>

                {state.message && (
                    <p
                        aria-live="polite"
                        className={`rounded-lg px-4 py-3 text-sm ${
                        state.success
                            ? "bg-green-50 text-green-700"
                            : "bg-red-50 text-red-700"
                        }`}
                    >
                        {state.message}
                    </p>
                )}

                <div className="flex justify-end">
                    <button
                        type="submit"
                        disabled={pending}
                        className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {pending ? "Saving..." : "Save Access"}
                    </button>
                </div>
            </form>
        </article>
    );
}