import { UserRole } from "@/generated/prisma/client";
import { requireRole } from "@/lib/auth-guards";
import { prisma } from "@/lib/prisma";

import { CreateTicketForm } from "@/components/tickets/create-ticket-form";

export default async function NewTicketPage() {
  await requireRole([UserRole.REQUESTER]);

  const categories = await prisma.category.findMany({
    where: {
      isActive: true,
    },
    orderBy: {
      name: "asc",
    },
    select: {
      id: true,
      name: true,
    },
  });

  return (
    <div className="mx-auto w-full max-w-3xl min-w-0">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl 2xl:text-4xl">Create Ticket</h1>

        <p className="mt-1 text-sm text-gray-600 sm:text-base 2xl:text-lg">
          Submit a new request to the help desk team.
        </p>
      </div>

      <div className="mt-5 sm:mt-6 lg:mt-8">
        {categories.length === 0 ? (
          <div className="rounded-xl border bg-white p-4 shadow-sm sm:p-6">
            <p className="text-xs leading-5 wrap-break-word text-gray-600 sm:text-sm sm:leading-6">
              No active ticket categories are available.
            </p>
          </div>
        ) : (
          <CreateTicketForm categories={categories} />
        )}
      </div>
    </div>
  );
}
