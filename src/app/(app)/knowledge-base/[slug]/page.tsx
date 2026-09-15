import Link from "next/link";
import { notFound } from "next/navigation";

import { requireUser } from "@/lib/auth-guards";
import { formatDate } from "@/lib/formatters";
import { prisma } from "@/lib/prisma";

type KnowledgeArticlePageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export default async function KnowledgeArticlePage({
  params,
}: KnowledgeArticlePageProps) {
  await requireUser();

  const { slug } = await params;

  const article =
    await prisma.knowledgeArticle.findFirst({
      where: {
        slug,
        isPublished: true,
      },

      select: {
        title: true,
        summary: true,
        content: true,
        updatedAt: true,

        category: {
          select: {
            name: true,
          },
        },

        createdBy: {
          select: {
            name: true,
          },
        },
      },
    });

  if (!article) {
    notFound();
  }

  return (
    <div className="mx-auto w-full max-w-4xl">
      <Link
        href="/knowledge-base"
        className="text-sm font-medium text-slate-700 transition hover:text-slate-500"
      >
        ← Back to Knowledge Base
      </Link>

      <article className="mt-6 rounded-xl border bg-white p-5 shadow-sm sm:p-8">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-gray-100 px-2.5 py-1 text-[10px] font-medium text-gray-600 sm:text-xs">
            {article.category?.name ??
              "General"}
          </span>
        </div>

        <h1 className="mt-4 wrap-break-word text-2xl font-bold text-gray-900 sm:text-3xl">
          {article.title}
        </h1>

        {article.summary && (
          <p className="mt-3 wrap-break-word text-sm leading-6 text-gray-600 sm:text-base">
            {article.summary}
          </p>
        )}

        <div className="mt-5 flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-400">
          <span>
            Created by{" "}
            {article.createdBy.name}
          </span>

          <span>
            Updated{" "}
            {formatDate(
              article.updatedAt,
            )}
          </span>
        </div>

        <div className="mt-8 border-t pt-6">
          <div className="whitespace-pre-wrap wrap-break-word text-sm leading-7 text-gray-700 sm:text-base">
            {article.content}
          </div>
        </div>
      </article>
    </div>
  );
}