"use client";

import { useActionState, useEffect, useRef } from "react";

import { createUser } from "@/app/(app)/admin/users/actions";
import { formatEnumLabel } from "@/lib/formatters";
import {
  USER_ROLE_VALUES,
  type CreateUserActionState,
} from "@/lib/validations/user-management";

const initialState: CreateUserActionState = {};

export function CreateUserForm() {
    const formRef = useRef<HTMLFormElement>(null);

    const [state, formAction, pending] = useActionState(
        createUser,
        initialState,
    );

    useEffect(() => {
        if (state.success) {
            formRef.current?.reset();
        }
    }, [state.success]);

    return (
        <form
            ref={formRef}
            action={formAction}
            className="rounded-xl border bg-white p-6 shadow-sm"
        >
            <h2 className="text-lg font-semibold text-gray-900">
                Create User
            </h2>

            <p className="mt-1 text-sm text-gray-500">
                Add a requester, support agent, or administrator account.
            </p>

            <div className="mt-6 space-y-5">
                <div>
                    <label
                        htmlFor="new-user-name"
                        className="block text-sm font-medium text-gray-700"
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
                        className="mt-2 w-full text-black rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none transition focus:border-slate-700"
                    />

                    {state.errors?.name?.map((error) => (
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
                        htmlFor="new-user-email"
                        className="block text-sm font-medium text-gray-700"
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
                        className="mt-2 w-full text-black rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none transition focus:border-slate-700"
                    />

                    {state.errors?.email?.map((error) => (
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
                        htmlFor="new-user-password"
                        className="block text-sm font-medium text-gray-700"
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
                        className="mt-2 w-full text-black rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none transition focus:border-slate-700"
                    />

                    {state.errors?.password?.map((error) => (
                        <p
                            key={error}
                            className="mt-1 text-sm text-red-600"
                        >
                            {error}
                        </p>
                    ))}

                    <p className="mt-1 text-xs leading-5 text-gray-500">
                        Share the initial password securely with the user. A password-change workflow will be added later.
                    </p>
                </div>

                <div>
                    <label
                        htmlFor="new-user-role"
                        className="block text-sm font-medium text-gray-700"
                    >
                        Role
                    </label>

                    <select
                        id="new-user-role"
                        name="role"
                        defaultValue="REQUESTER"
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

                <button
                    type="submit"
                    disabled={pending}
                    className="w-full rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                    {pending ? "Creating account..." : "Create User"}
                </button>
            </div>
        </form>
    );
}