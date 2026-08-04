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
        <article className="min-w-0 rounded-xl border bg-white p-4 shadow-sm sm:p-6">
            <div className="mb-4 flex flex-col gap-4 sm:mb-5 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                        <h2 className="wrap-break-word text-sm font-semibold text-gray-900 sm:text-base 2xl:text-lg">
                            {category.name}
                        </h2>

                        <span
                           className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-medium sm:text-xs ${
                                category.isActive
                                ? "bg-green-50 text-green-700"
                                : "bg-gray-100 text-gray-600"
                            }`} 
                        >
                            {category.isActive ? "Active" : "Inactive"}
                        </span>
                    </div>
                    
                    <p className="mt-2 text-[11px] leading-5 text-gray-500 sm:text-xs 2xl:text-sm">
                        Used by {category.ticketCount}{" "}{category.ticketCount === 1 ? "ticket" : "tickets"}
                    </p>
                </div>

                <form action={toggleStatusWithId} className="w-full shrink-0 sm:w-auto">
                    <input 
                        type="hidden"
                        name="nextIsActive"
                        value={
                            category.isActive ? "false" : "true"
                        }
                    />

                    <button
                        type="submit"
                        className="w-full rounded-lg border px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100 sm:w-auto"
                    >
                        {category.isActive ? "Deactivate" : "Activate"}
                    </button>
                </form>
            </div>
            
            <form action={formAction} className="space-y-4 sm:space-y-5">
                <div className="min-w-0">
                    <label
                        htmlFor={`category-name-${category.id}`}
                        className="block text-xs font-medium text-gray-700 sm:text-sm"
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
                        className="mt-2 w-full min-w-0 rounded-lg border border-gray-300 px-3 py-2.5 text-xs text-black outline-none transition placeholder:text-gray-400 focus:border-slate-700 sm:text-sm"
                    />

                    {state.errors?.name?.map((error) => (
                        <p
                            key={error}
                            className="mt-1 wrap-break-word text-xs text-red-600 sm:text-sm"
                        >
                            {error}
                        </p>
                    ))}
                </div>

                <div className="min-w-0">
                    <label
                        htmlFor={`category-description-${category.id}`}
                        className="block text-xs font-medium text-gray-700 sm:text-sm"
                    >
                        Description
                    </label>

                    <textarea 
                        id={`category-description-${category.id}`}
                        name="description"
                        rows={3}
                        maxLength={500}
                        defaultValue={category.description ?? ""}
                        className="mt-2 min-h-24 w-full min-w-0 resize-y rounded-lg border border-gray-300 px-3 py-2.5 text-xs text-black outline-none transition placeholder:text-gray-400 focus:border-slate-700 sm:text-sm"
                    />

                    {state.errors?.description?.map(
                        (error) => (
                        <p
                            key={error}
                            className="mt-1 wrap-break-word text-xs text-red-600 sm:text-sm"
                        >
                            {error}
                        </p>
                        ),
                    )}
                </div>

                {state.message && (
                    <p
                        aria-live="polite"
                        className={`wrap-break-word rounded-lg px-3 py-2.5 text-xs sm:px-4 sm:py-3 sm:text-sm ${
                        state.success
                            ? "bg-green-50 text-green-700"
                            : "bg-red-50 text-red-700"
                        }`}
                    >
                        {state.message}
                    </p>
                )}

                <div className="sm:flex sm:justify-end">
                    <button
                        type="submit"
                        disabled={pending}
                        className="w-full rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto 2xl:px-5 2xl:py-3 2xl:text-base"
                    >
                       {pending ? "Saving..." : "Save Changes"} 
                    </button>
                </div>
            </form>
        </article>
    )
}