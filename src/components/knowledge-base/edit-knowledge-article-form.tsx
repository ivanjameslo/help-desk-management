"use client";

import Link from "next/link";
import { useActionState } from "react";

import { updateKnowledgeArticle } from "@/app/(app)/admin/knowledge-base/actions";
import type { CreateKnowledgeArticleState } from "@/lib/validations/knowledge-article";

type CategoryOption = {
  id: string;
  name: string;
};

type ArticleData = {
  id: string;
  title: string;
  summary: string | null;
  content: string;
  categoryId: string | null;
  isPublished: boolean;
};

type EditKnowledgeArticleFormProps = {
  article: ArticleData;
  categories: CategoryOption[];
};

const initialState: CreateKnowledgeArticleState = {};

export function EditKnowledgeArticleForm({
  article,
  categories,
}: EditKnowledgeArticleFormProps) {
  const updateArticleWithId =
    updateKnowledgeArticle.bind(
      null,
      article.id,
    );

  const [state, formAction, pending] =
    useActionState(
      updateArticleWithId,
      initialState,
    );

  return (
    <form
      action={formAction}
      className="rounded-xl border bg-white p-4 shadow-sm sm:p-6"
    >
      {/* Title */}
      <div>
        <label
          htmlFor="kb-edit-title"
          className="block text-xs font-medium text-gray-700 sm:text-sm"
        >
          Title
        </label>

        <input
          id="kb-edit-title"
          name="title"
          type="text"
          required
          minLength={5}
          maxLength={160}
          defaultValue={article.title}
          className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2.5 text-xs text-black outline-none transition focus:border-slate-700 sm:text-sm"
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
      <div className="mt-5">
        <label
          htmlFor="kb-edit-category"
          className="block text-xs font-medium text-gray-700 sm:text-sm"
        >
          Category
        </label>

        <select
          id="kb-edit-category"
          name="categoryId"
          defaultValue={
            article.categoryId ?? ""
          }
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
      <div className="mt-5">
        <label
          htmlFor="kb-edit-summary"
          className="block text-xs font-medium text-gray-700 sm:text-sm"
        >
          Summary
        </label>

        <textarea
          id="kb-edit-summary"
          name="summary"
          rows={3}
          maxLength={300}
          defaultValue={
            article.summary ?? ""
          }
          className="mt-2 min-h-20 w-full resize-y rounded-lg border border-gray-300 px-3 py-2.5 text-xs text-black outline-none transition focus:border-slate-700 sm:text-sm"
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
      <div className="mt-5">
        <label
          htmlFor="kb-edit-content"
          className="block text-xs font-medium text-gray-700 sm:text-sm"
        >
          Article Content
        </label>

        <textarea
          id="kb-edit-content"
          name="content"
          required
          rows={14}
          minLength={20}
          maxLength={20000}
          defaultValue={article.content}
          className="mt-2 min-h-80 w-full resize-y rounded-lg border border-gray-300 px-3 py-2.5 text-xs leading-5 text-black outline-none transition focus:border-slate-700 sm:text-sm sm:leading-6"
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

      {/* Publication status */}
      <label className="mt-5 flex cursor-pointer items-start gap-3 rounded-lg border bg-gray-50 p-3 sm:p-4">
        <input
          type="checkbox"
          name="isPublished"
          defaultChecked={
            article.isPublished
          }
          className="mt-0.5 size-4 shrink-0 rounded border-gray-300"
        />

        <span>
          <span className="block text-xs font-medium text-gray-900 sm:text-sm">
            Published
          </span>

          <span className="mt-1 block text-[11px] leading-5 text-gray-500 sm:text-xs">
            Published articles are visible
            to users and can be used by
            the AI assistant.
          </span>
        </span>
      </label>

      {state.message && (
        <p
          aria-live="polite"
          className={`mt-5 rounded-lg px-3 py-2.5 text-xs sm:text-sm ${
            state.success
              ? "bg-green-50 text-green-700"
              : "bg-red-50 text-red-700"
          }`}
        >
          {state.message}
        </p>
      )}

      <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <Link
          href="/admin/knowledge-base"
          className="rounded-lg border px-5 py-2.5 text-center text-sm font-medium text-gray-700 transition hover:bg-gray-50"
        >
          Cancel
        </Link>

        <button
          type="submit"
          disabled={pending}
          className="rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {pending
            ? "Saving changes..."
            : "Save Changes"}
        </button>
      </div>
    </form>
  );
}