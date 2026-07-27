"use client";

import { useActionState, useEffect, useRef } from "react";

import { createCategory } from "@/app/(app)/admin/categories/actions";
import type { CategoryActionState } from "@/lib/validations/category";

const initialState: CategoryActionState = {};

export function CreateCategoryForm() {
    const formRef = useRef<HTMLFormElement>(null);

    const [state, formAction, pending] = useActionState(
        createCategory,
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
                Create Category
            </h2>

            <p className="mt-1 text-sm text-gray-500">
                Adding a category requesters can select when submitting tickets.
            </p>

            <div className="mt-6 space-y-5">
                <div>
                    <label
                        htmlFor="new-category-name"
                        className="block text-sm font-medium text-gray-700"
                    >
                        Category Name
                    </label>

                    <input 
                        id="new-category-name"
                        name="name"
                        type="text"
                        required
                        minLength={2}
                        maxLength={80}
                        placeholder="For example: Hardware Support"
                        aria-describedby="new-category-name-error"
                        className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none transition focus:border-slate-700"
                    />

                    <div
                        id="new-category-name-error"
                        aria-live="polite"
                        className="mt-1"
                    >
                        {state.errors?.name?.map((error) => (
                            <p
                                key={error}
                                className="text-sm text-red-600"
                            >
                                {error}
                            </p>
                        ))}
                    </div>
                </div>

                <div>
                    <label
                        htmlFor="new-category-description"
                        className="block text-sm font-medium text-gray-700"
                    >
                        Description
                    </label>

                    <textarea 
                        id="new-category-description"
                        name="description"
                        rows={4}
                        maxLength={500}
                        placeholder="Describe the concerns covered by this category."
                        aria-describedby="new-category-description-error"
                        className="mt-2 w-full resize-y rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none transition focus:border-slate-700"
                    />

                    <div
                        id="new-category-description-error"
                        aria-live="polite"
                        className="mt-1"
                    >
                        {state.errors?.description?.map(
                            (error) => (
                                <p
                                    key={error}
                                    className="text-sm text-red-600"
                                >
                                    {error}
                                </p>
                            ),
                        )}
                    </div>
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
                    {pending ? "Creating..." : "Create Category"}
                </button>
            </div>
        </form>
    )
}