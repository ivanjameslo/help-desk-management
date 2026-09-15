import Link from "next/link";

import { requireUser } from "@/lib/auth-guards";
import { formatDate } from "@/lib/formatters";
import { prisma } from "@/lib/prisma";

type KnowledgeBasePageProps = {
  searchParams: Promise<{
    q?: string | string[];
  }>;
};

function getSingleValue(value: string | string[] | undefined) {
  if (Array.isArray(value)) {
    return value[0] ?? "";
  }

  return value ?? "";
}

function normalizeSearchValue(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]/g, "");
}

export default async function KnowledgeBasePage({ searchParams }: KnowledgeBasePageProps) {
  await requireUser();

  const parameters = await searchParams;

  const query = getSingleValue(parameters.q).trim().slice(0, 100);

  const allArticles = await prisma.knowledgeArticle.findMany({
    where: {
      isPublished: true,
    },

    orderBy: {
      updatedAt: "desc",
    },

    select: {
      id: true,
      title: true,
      slug: true,
      summary: true,
      content: true,
      updatedAt: true,

      category: {
        select: {
          name: true,
        },
      },
    },
  });

  const normalizedQuery = normalizeSearchValue(query);

  const articles = query
    ? allArticles.filter((article) => {
        const searchableText = [
          article.title,
          article.summary ?? "",
          article.content,
          article.category?.name ?? "",
        ].join(" ");

        return normalizeSearchValue(searchableText).includes(normalizedQuery);
      })
    : allArticles;

  return (
    <div className="mx-auto w-full max-w-7xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl 2xl:text-4xl">
          Knowledge Base
        </h1>

        <p className="mt-1 text-sm text-gray-600 sm:text-base 2xl:text-lg">
          Find helpful guides and solutions for common support issues.
        </p>
      </div>

      {/* Search */}
      <form action="/knowledge-base" method="get" className="mt-6 flex flex-col gap-3 sm:flex-row">
        <div className="min-w-0 flex-1">
          <label htmlFor="knowledge-search" className="sr-only">
            Search knowledge base
          </label>

          <input
            id="knowledge-search"
            name="q"
            type="search"
            defaultValue={query}
            maxLength={100}
            placeholder="Search help articles..."
            className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 transition outline-none placeholder:text-gray-400 focus:border-slate-700"
          />
        </div>

        <button
          type="submit"
          className="rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-slate-700 sm:w-auto"
        >
          Search
        </button>
      </form>

      {/* Search information */}
      <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-gray-500 sm:text-sm">
          {query ? (
            <>
              {articles.length} {articles.length === 1 ? "result" : "results"} for{" "}
              <span className="font-medium text-gray-700">&quot;{query}&quot;</span>
            </>
          ) : (
            <>
              {articles.length} {articles.length === 1 ? "article" : "articles"} available
            </>
          )}
        </p>

        {query && (
          <Link
            href="/knowledge-base"
            className="text-xs font-medium text-slate-700 transition hover:text-slate-500 sm:text-sm"
          >
            Clear search
          </Link>
        )}
      </div>

      {/* Articles */}
      <div className="mt-4 sm:mt-6">
        {articles.length === 0 ? (
          <section className="rounded-xl border bg-white p-6 text-center shadow-sm sm:p-8">
            <h2 className="text-sm font-semibold text-gray-900 sm:text-base">
              {query ? "No matching articles" : "No articles available yet"}
            </h2>

            <p className="mt-2 text-xs leading-5 text-gray-500 sm:text-sm sm:leading-6">
              {query
                ? "Try using different or fewer search terms."
                : "Published help articles will appear here once they are added."}
            </p>
          </section>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {articles.map((article) => (
              <article
                key={article.id}
                className="min-w-0 rounded-xl border bg-white p-4 shadow-sm transition hover:border-gray-300 hover:shadow-md sm:p-5"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-gray-100 px-2.5 py-1 text-[10px] font-medium text-gray-600 sm:text-xs">
                    {article.category?.name ?? "General"}
                  </span>
                </div>

                <h2 className="mt-4 text-base font-semibold wrap-break-word text-gray-900 sm:text-lg">
                  <Link
                    href={`/knowledge-base/${article.slug}`}
                    className="transition hover:text-slate-600"
                  >
                    {article.title}
                  </Link>
                </h2>

                <p className="mt-2 text-xs leading-5 wrap-break-word text-gray-600 sm:text-sm sm:leading-6">
                  {article.summary ?? "No summary provided."}
                </p>

                <div className="mt-4 flex items-center justify-between gap-3">
                  <p className="text-[11px] text-gray-400 sm:text-xs">
                    Updated {formatDate(article.updatedAt)}
                  </p>

                  <Link
                    href={`/knowledge-base/${article.slug}`}
                    className="text-xs font-medium text-slate-700 transition hover:text-slate-500 sm:text-sm"
                  >
                    Read article →
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
