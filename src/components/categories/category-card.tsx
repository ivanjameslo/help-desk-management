"use client";

import { useActionState } from "react";

import { toggleCategoryStatus, updateCategory } from "@/app/(app)/admin/categories/actions";
import type { CategoryActionState } from "@/lib/validations/category";

type CategoryCardProps = {
    category:  {
        id: string;
        name: string;
        description: string | null;
        isActive: boolean;
        ticketCount: number;
    };
};

const initialState: CategoryActionState = {};

export function CategoryCard({ category }: CategoryCardProps) {
    const updateCategoryWithId = updateCategory.bind(null, category.id);

    const toggleStatusWithId = toggleCategoryStatus.bind(null, category.id);

    const [state, formAction, pending] = useActionState(
        updateCategoryWithId,
        initialState,
    );

    return (
        <article className="rounded-xl border bg-white p-6 shadow-sm">
            <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
                <div>
                    <div className="flex flex-wrap items-center gap-2">
                        <h2 className="font-semibold text-gray-900">
                            {category.name}
                        </h2>

                        <span
                           className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                                category.isActive
                                ? "bg-green-50 text-green-700"
                                : "bg-gray-100 text-gray-600"
                            }`} 
                        >
                            {category.isActive ? "Active" : "Inactive"}
                        </span>
                    </div>
                    
                    <p className="mt-2 text-xs text-gray-500">
                        Used by {category.ticketCount}{" "}{category.ticketCount === 1 ? "ticket" : "tickets"}
                    </p>
                </div>

                <form action={toggleStatusWithId}>
                    <input 
                        type="hidden"
                        name="nextIsActive"
                        value={
                            category.isActive ? "false" : "true"
                        }
                    />

                    <button
                        type="submit"
                        className="rounded-lg border px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100"
                    >
                        {category.isActive ? "Deactivate" : "Activate"}
                    </button>
                </form>
            </div>
            
            <form action={formAction} className="space-y-5">
                <div>
                    <label
                        htmlFor={`category-name-${category.id}`}
                        className="block text-sm font-medium text-gray-700"
                    >
                        Category Name
                    </label>

                    <input 
                        id={`category-name-${category.id}`}
                        name="name"
                        type="text"
                        required
                        minLength={2}
                        maxLength={80}
                        defaultValue={category.name}
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
                        htmlFor={`category-description-${category.id}`}
                        className="block text-sm font-medium text-gray-700"
                    >
                        Description
                    </label>

                    <textarea 
                        id={`category-description-${category.id}`}
                        name="description"
                        rows={3}
                        maxLength={500}
                        defaultValue={category.description ?? ""}
                        className="mt-2 w-full text-black resize-y rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none transition focus:border-slate-700"
                    />

                    {state.errors?.description?.map(
                        (error) => (
                        <p
                            key={error}
                            className="mt-1 text-sm text-red-600"
                        >
                            {error}
                        </p>
                        ),
                    )}
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
                       {pending ? "Saving..." : "Save Changes"} 
                    </button>
                </div>
            </form>
        </article>
    )
}