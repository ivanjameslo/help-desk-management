"use client";

import { useActionState, useEffect, useRef } from "react";

import { createCategory } from "@/app/(app)/admin/categories/actions";
import type { CategoryActionState } from "@/lib/validations/category";

const initialState: CategoryActionState = {};

export function CreateCategoryForm() {
  const formRef = useRef<HTMLFormElement>(null);

  const [state, formAction, pending] = useActionState(createCategory, initialState);

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
      <h2 className="text-base font-semibold text-gray-900 sm:text-lg 2xl:text-xl">
        Create Category
      </h2>

      <p className="mt-1 text-xs leading-5 wrap-break-word text-gray-500 sm:text-sm sm:leading-6">
        Add a category that requesters can select when submitting tickets.
      </p>

      <div className="mt-5 space-y-4 sm:mt-6 sm:space-y-5">
        <div className="min-w-0">
          <label
            htmlFor="new-category-name"
            className="block text-xs font-medium text-gray-700 sm:text-sm"
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
            className="mt-2 w-full min-w-0 rounded-lg border border-gray-300 px-3 py-2.5 text-xs text-black transition outline-none placeholder:text-gray-400 focus:border-slate-700 sm:text-sm"
          />

          <div id="new-category-name-error" aria-live="polite" className="mt-1">
            {state.errors?.name?.map((error) => (
              <p key={error} className="text-xs wrap-break-word text-red-600 sm:text-sm">
                {error}
              </p>
            ))}
          </div>
        </div>

        <div className="min-w-0">
          <label
            htmlFor="new-category-description"
            className="block text-xs font-medium text-gray-700 sm:text-sm"
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
            className="mt-2 min-h-28 w-full min-w-0 resize-y rounded-lg border border-gray-300 px-3 py-2.5 text-xs text-black transition outline-none placeholder:text-gray-400 focus:border-slate-700 sm:min-h-32 sm:text-sm"
          />

          <div id="new-category-description-error" aria-live="polite" className="mt-1">
            {state.errors?.description?.map((error) => (
              <p key={error} className="text-xs wrap-break-word text-red-600 sm:text-sm">
                {error}
              </p>
            ))}
          </div>
        </div>

        {state.message && (
          <p
            aria-live="polite"
            className={`rounded-lg px-3 py-2.5 text-xs wrap-break-word sm:px-4 sm:py-3 sm:text-sm ${
              state.success ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
            }`}
          >
            {state.message}
          </p>
        )}

        <button
          type="submit"
          disabled={pending}
          className="w-full rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60 2xl:py-3 2xl:text-base"
        >
          {pending ? "Creating..." : "Create Category"}
        </button>
      </div>
    </form>
  );
}
