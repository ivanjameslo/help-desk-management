import { CategoryCard } from "@/components/categories/category-card";
import { CreateCategoryForm } from "@/components/categories/create-category-form";
import { UserRole } from "@/generated/prisma/enums";
import { requireRole } from "@/lib/auth-guards";
import { prisma } from "@/lib/prisma";

export default async function CategoriesPage() {
  await requireRole([UserRole.ADMIN]);

  const categories = await prisma.category.findMany({
    orderBy: [
      {
        isActive: "desc",
      },
      {
        name: "asc",
      },
    ],

    select: {
      id: true,
      name: true,
      description: true,
      isActive: true,

      _count: {
        select: {
          tickets: true,
        },
      },
    },
  });

  return (
    <div className="mx-auto w-full max-w-7xl min-w-0">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl 2xl:text-4xl">
          Manage Categories
        </h1>

        <p className="mt-1 text-sm leading-6 text-gray-600 sm:text-base 2xl:text-lg">
          Create and maintain the categories used for help desk tickets.
        </p>
      </div>

      <div className="mt-5 grid items-start gap-5 sm:mt-6 sm:gap-6 lg:mt-8 lg:grid-cols-[320px_minmax(0,1fr)] lg:gap-6 xl:grid-cols-[340px_minmax(0,1fr)] xl:gap-8 2xl:grid-cols-[360px_minmax(0,1fr)]">
        <div className="min-w-0 lg:sticky lg:top-24">
          <CreateCategoryForm />
        </div>

        <section className="min-w-0">
          <div className="mb-3 flex items-center justify-between gap-3 sm:mb-4 sm:gap-4">
            <h2 className="min-w-0 text-base font-semibold text-gray-900 sm:text-lg 2xl:text-xl">
              Existing Categories
            </h2>

            <p className="shrink-0 text-xs text-gray-500 sm:text-sm">
              {categories.length} total
            </p>
          </div>

          {categories.length === 0 ? (
            <div className="rounded-xl border bg-white p-5 text-center shadow-sm sm:p-8">
              <p className="text-xs leading-5 text-gray-500 sm:text-sm sm:leading-6">
                No categories have been created yet.
              </p>
            </div>
          ) : (
            <div className="space-y-3 sm:space-y-4">
              {categories.map((category) => (
                <CategoryCard
                  key={category.id}
                  category={{
                    id: category.id,
                    name: category.name,
                    description: category.description,
                    isActive: category.isActive,
                    ticketCount: category._count.tickets,
                  }}
                />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}