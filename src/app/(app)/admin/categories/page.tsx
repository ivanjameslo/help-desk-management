import { CategoryCard } from "@/components/categories/category-card";
import { CreateCategoryForm } from "@/components/categories/create-category-form";
import { UserRole } from "@/generated/prisma/enums";
import { requireRole } from "@/lib/auth-guards";
import { prisma } from "@/lib/prisma";
import { categorySchema } from "@/lib/validations/category";

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
    <div className="mx-auto max-w-7xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Manage Categories
        </h1>

        <p className="mt-1 text-gray-600">
          Create and maintain the categories used for help desk tickets.
        </p>
      </div>

      <div className="mt-8 grid items-start gap-8 lg:grid-cols-[360px_minmax(0,1fr)]">
        <div className="lg:sticky lg:top-6">
          <CreateCategoryForm />
        </div>

        <section>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">
              Existing Categories
            </h2>

            <p className="text-sm text-gray-500">
              {categories.length} total
            </p>
          </div>

          {categories.length === 0 ? (
            <div className="rounded-xl border bg-white p-8 text-center shadow-sm">
              <p className="text-sm text-gray-500">
                No categories have been created yet.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {categories.map((category) => (
                <CategoryCard 
                  key={category.id}
                  category={{
                    id: category.id,
                    name: category.name,
                    description: category.description,
                    isActive: category.isActive,
                    ticketCount: category._count.tickets
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