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

export default async function KnowledgeArticlePage({ params }: KnowledgeArticlePageProps) {
  await requireUser();

  const { slug } = await params;

  const article = await prisma.knowledgeArticle.findFirst({
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
        className="text-sm font-medium text-blue-600 transition hover:text-blue-700"
      >
        ← Back to Knowledge Base
      </Link>

      <article className="mt-6 rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-cyan-50 px-2.5 py-1 text-[10px] font-medium text-cyan-700 sm:text-xs">
            {article.category?.name ?? "General"}
          </span>
        </div>

        <h1 className="mt-4 text-2xl font-bold wrap-break-word text-slate-900 sm:text-3xl">
          {article.title}
        </h1>

        {article.summary && (
          <p className="mt-3 text-sm leading-6 wrap-break-word text-slate-600 sm:text-base sm:leading-7">
            {article.summary}
          </p>
        )}

        <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-slate-400">
          <span>
            Created by <span className="font-medium text-slate-600">{article.createdBy.name}</span>
          </span>

          <span>
            Updated{" "}
            <span className="font-medium text-slate-600">{formatDate(article.updatedAt)}</span>
          </span>
        </div>

        <div className="mt-8 border-t border-slate-200 pt-6">
          <div className="text-sm leading-7 wrap-break-word whitespace-pre-wrap text-slate-700 sm:text-base sm:leading-8">
            {article.content}
          </div>
        </div>
      </article>
    </div>
  );
}
