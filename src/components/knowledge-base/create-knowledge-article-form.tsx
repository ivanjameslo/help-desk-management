"use client";

import {
  useActionState,
  useEffect,
  useRef,
} from "react";

import { createKnowledgeArticle } from "@/app/(app)/admin/knowledge-base/actions";
import type { CreateKnowledgeArticleState } from "@/lib/validations/knowledge-article";

type CategoryOption = {
  id: string;
  name: string;
};

type CreateKnowledgeArticleFormProps = {
  categories: CategoryOption[];
};

const initialState: CreateKnowledgeArticleState =
  {};

export function CreateKnowledgeArticleForm({
  categories,
}: CreateKnowledgeArticleFormProps) {
  const formRef =
    useRef<HTMLFormElement>(null);

  const [state, formAction, pending] =
    useActionState(
      createKnowledgeArticle,
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
      className="min-w-0 rounded-xl border bg-white p-4 shadow-sm sm:p-6"
    >
      <div>
        <h2 className="text-base font-semibold text-gray-900 sm:text-lg">
          Create Article
        </h2>

        <p className="mt-1 text-xs leading-5 text-gray-500 sm:text-sm">
          Add a help article that users and the AI assistant can use.
        </p>
      </div>

      {/* Title */}
      <div className="mt-5">
        <label
          htmlFor="kb-title"
          className="block text-xs font-medium text-gray-700 sm:text-sm"
        >
          Title
        </label>

        <input
          id="kb-title"
          name="title"
          type="text"
          required
          minLength={5}
          maxLength={160}
          placeholder="Troubleshooting Office Wi-Fi"
          className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2.5 text-xs text-black outline-none transition placeholder:text-gray-400 focus:border-slate-700 sm:text-sm"
        />

        {state.errors?.title?.map(
          (error) => (
            <p
              key={error}
              className="mt-1 text-xs text-red-600 sm:text-sm"
            >
              {error}
            </p>
          ),
        )}
      </div>

      {/* Category */}
      <div className="mt-4">
        <label
          htmlFor="kb-category"
          className="block text-xs font-medium text-gray-700 sm:text-sm"
        >
          Category
        </label>

        <select
          id="kb-category"
          name="categoryId"
          defaultValue=""
          className="mt-2 w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-xs text-black outline-none transition focus:border-slate-700 sm:text-sm"
        >
          <option value="">
            General
          </option>

          {categories.map(
            (category) => (
              <option
                key={category.id}
                value={category.id}
              >
                {category.name}
              </option>
            ),
          )}
        </select>

        {state.errors?.categoryId?.map(
          (error) => (
            <p
              key={error}
              className="mt-1 text-xs text-red-600 sm:text-sm"
            >
              {error}
            </p>
          ),
        )}
      </div>

      {/* Summary */}
      <div className="mt-4">
        <label
          htmlFor="kb-summary"
          className="block text-xs font-medium text-gray-700 sm:text-sm"
        >
          Summary
        </label>

        <textarea
          id="kb-summary"
          name="summary"
          rows={3}
          maxLength={300}
          placeholder="Briefly explain what this article helps the user solve."
          className="mt-2 min-h-20 w-full resize-y rounded-lg border border-gray-300 px-3 py-2.5 text-xs text-black outline-none transition placeholder:text-gray-400 focus:border-slate-700 sm:text-sm"
        />

        {state.errors?.summary?.map(
          (error) => (
            <p
              key={error}
              className="mt-1 text-xs text-red-600 sm:text-sm"
            >
              {error}
            </p>
          ),
        )}
      </div>

      {/* Content */}
      <div className="mt-4">
        <label
          htmlFor="kb-content"
          className="block text-xs font-medium text-gray-700 sm:text-sm"
        >
          Article Content
        </label>

        <textarea
          id="kb-content"
          name="content"
          required
          rows={12}
          minLength={20}
          maxLength={20000}
          placeholder={`Example:

If you are unable to connect to the office Wi-Fi:

1. Confirm Wi-Fi is enabled on your device.
2. Disconnect and reconnect to the network.
3. Restart your device.
4. Forget the network and reconnect.

If the issue continues, create a support ticket.`}
          className="mt-2 min-h-72 w-full resize-y rounded-lg border border-gray-300 px-3 py-2.5 text-xs leading-5 text-black outline-none transition placeholder:text-gray-400 focus:border-slate-700 sm:text-sm sm:leading-6"
        />

        {state.errors?.content?.map(
          (error) => (
            <p
              key={error}
              className="mt-1 text-xs text-red-600 sm:text-sm"
            >
              {error}
            </p>
          ),
        )}
      </div>

      {/* Publish */}
      <label className="mt-4 flex cursor-pointer items-start gap-3 rounded-lg border bg-gray-50 p-3 sm:p-4">
        <input
          type="checkbox"
          name="isPublished"
          className="mt-0.5 size-4 shrink-0 rounded border-gray-300"
        />

        <span>
          <span className="block text-xs font-medium text-gray-900 sm:text-sm">
            Publish article
          </span>

          <span className="mt-1 block text-[11px] leading-5 text-gray-500 sm:text-xs">
            Published articles are visible to users. Leave unchecked to save this article as a draft.
          </span>
        </span>
      </label>

      {state.message && (
        <p
          aria-live="polite"
          className={`mt-4 rounded-lg px-3 py-2.5 text-xs sm:text-sm ${
            state.success
              ? "bg-green-50 text-green-700"
              : "bg-red-50 text-red-700"
          }`}
        >
          {state.message}
        </p>
      )}

      <div className="mt-5">
        <button
          type="submit"
          disabled={pending}
          className="w-full rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {pending
            ? "Saving article..."
            : "Save Article"}
        </button>
      </div>
    </form>
  );
}