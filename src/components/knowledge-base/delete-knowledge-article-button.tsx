"use client";

import { useState } from "react";

import { deleteKnowledgeArticle } from "@/app/(app)/admin/knowledge-base/actions";

type DeleteKnowledgeArticleButtonProps = {
  articleId: string;
  articleTitle: string;
};

export function DeleteKnowledgeArticleButton({
  articleId,
  articleTitle,
}: DeleteKnowledgeArticleButtonProps) {
  const [pending, setPending] = useState(false);

  async function handleDelete() {
    const confirmed = window.confirm(`Delete "${articleTitle}"?\n\nThis action cannot be undone.`);

    if (!confirmed) {
      return;
    }

    setPending(true);

    const result = await deleteKnowledgeArticle(articleId);

    setPending(false);

    if (!result.success) {
      window.alert(result.message ?? "Unable to delete the article.");
    }
  }

  return (
    <button
      type="button"
      onClick={handleDelete}
      disabled={pending}
      className="rounded-lg border border-red-200 px-3 py-2 text-xs font-medium text-red-700 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60 sm:text-sm"
    >
      {pending ? "Deleting..." : "Delete"}
    </button>
  );
}
