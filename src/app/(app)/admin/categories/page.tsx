import { UserRole } from "@/generated/prisma/client";
import { requireRole } from "@/lib/auth-guards"

export default async function CategoriesPage() {
  await requireRole([UserRole.ADMIN]);

  return (
    <div className="mx-auto max-w-7xl">
      <h1 className="text-2xl font-bold text-gray-900">
        Manage Categories
      </h1>

      <p className="mt-1 text-gray-600">
        Create and maintain help desk ticket categories.
      </p>
    </div>
  );
}