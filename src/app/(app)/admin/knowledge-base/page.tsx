import { CreateKnowledgeArticleForm } from "@/components/knowledge-base/create-knowledge-article-form";
import { UserRole } from "@/generated/prisma/enums";
import { requireRole } from "@/lib/auth-guards";
import { formatDate } from "@/lib/formatters";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { DeleteKnowledgeArticleButton } from "@/components/knowledge-base/delete-knowledge-article-button";

export default async function AdminKnowledgeBasePage() {
  await requireRole([UserRole.ADMIN]);

  const [categories, articles] = await Promise.all([
    prisma.category.findMany({
      orderBy: {
        name: "asc",
      },

      select: {
        id: true,
        name: true,
      },
    }),

    prisma.knowledgeArticle.findMany({
      orderBy: {
        updatedAt: "desc",
      },

      select: {
        id: true,
        title: true,
        slug: true,
        summary: true,
        isPublished: true,
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
    }),
  ]);

  return (
    <div className="mx-auto w-full max-w-7xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl 2xl:text-4xl">
          Manage Knowledge Base
        </h1>

        <p className="mt-1 text-sm text-gray-600 sm:text-base">
          Create and manage help articles for users and the AI assistant.
        </p>
      </div>

      <div className="mt-6 grid items-start gap-6 lg:grid-cols-[360px_minmax(0,1fr)] xl:grid-cols-[400px_minmax(0,1fr)]">
        <div className="min-w-0 lg:sticky lg:top-24">
          <CreateKnowledgeArticleForm categories={categories} />
        </div>

        <section className="min-w-0">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="text-base font-semibold text-gray-900 sm:text-lg">Articles</h2>

            <p className="text-xs text-gray-500 sm:text-sm">{articles.length} total</p>
          </div>

          {articles.length === 0 ? (
            <div className="rounded-xl border bg-white p-6 text-center shadow-sm sm:p-8">
              <p className="text-xs text-gray-500 sm:text-sm">
                No knowledge base articles have been created yet.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {articles.map((article) => (
                <article
                  key={article.id}
                  className="min-w-0 rounded-xl border bg-white p-4 shadow-sm sm:p-5"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-sm font-semibold wrap-break-word text-gray-900 sm:text-base">
                          {article.title}
                        </h3>

                        <span
                          className={`rounded-full px-2.5 py-1 text-[10px] font-medium sm:text-xs ${
                            article.isPublished
                              ? "bg-green-50 text-green-700"
                              : "bg-amber-50 text-amber-700"
                          }`}
                        >
                          {article.isPublished ? "Published" : "Draft"}
                        </span>
                      </div>

                      <p className="mt-2 text-xs text-gray-500 sm:text-sm">
                        {article.category?.name ?? "General"}
                      </p>

                      {article.summary && (
                        <p className="mt-3 text-xs leading-5 wrap-break-word text-gray-600 sm:text-sm sm:leading-6">
                          {article.summary}
                        </p>
                      )}

                      <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-gray-400 sm:text-xs">
                        <span>Created by {article.createdBy.name}</span>

                        <span>Updated {formatDate(article.updatedAt)}</span>
                      </div>
                    </div>
                    <div className="flex shrink-0 gap-2">
                      <Link
                        href={`/admin/knowledge-base/${article.id}/edit`}
                        className="rounded-lg border px-3 py-2 text-center text-xs font-medium text-gray-700 transition hover:bg-gray-50 sm:text-sm"
                      >
                        Edit
                      </Link>

                      <DeleteKnowledgeArticleButton
                        articleId={article.id}
                        articleTitle={article.title}
                      />
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
