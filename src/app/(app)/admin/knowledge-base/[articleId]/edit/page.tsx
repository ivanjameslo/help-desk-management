import Link from "next/link";
import { notFound } from "next/navigation";

import { EditKnowledgeArticleForm } from "@/components/knowledge-base/edit-knowledge-article-form";
import { UserRole } from "@/generated/prisma/enums";
import { requireRole } from "@/lib/auth-guards";
import { prisma } from "@/lib/prisma";

type EditKnowledgeArticlePageProps = {
  params: Promise<{
    articleId: string;
  }>;
};

export default async function EditKnowledgeArticlePage({
  params,
}: EditKnowledgeArticlePageProps) {
  await requireRole([
    UserRole.ADMIN,
  ]);

  const { articleId } = await params;

  const [article, categories] =
    await Promise.all([
      prisma.knowledgeArticle.findUnique({
        where: {
          id: articleId,
        },

        select: {
          id: true,
          title: true,
          summary: true,
          content: true,
          categoryId: true,
          isPublished: true,
        },
      }),

      prisma.category.findMany({
        orderBy: {
          name: "asc",
        },

        select: {
          id: true,
          name: true,
        },
      }),
    ]);

  if (!article) {
    notFound();
  }

  return (
    <div className="mx-auto w-full max-w-4xl">
      <Link
        href="/admin/knowledge-base"
        className="text-sm font-medium text-slate-700 transition hover:text-slate-500"
      >
        ← Back to Manage Knowledge Base
      </Link>

      <div className="mt-6">
        <h1 className="wrap-break-word text-2xl font-bold text-gray-900 sm:text-3xl 2xl:text-4xl">
          Edit Article
        </h1>

        <p className="mt-1 text-sm text-gray-600 sm:text-base">
          Update the article content,
          category, and publication status.
        </p>
      </div>

      <div className="mt-6 sm:mt-8">
        <EditKnowledgeArticleForm
          article={article}
          categories={categories}
        />
      </div>
    </div>
  );
}