import { CreateTicketForm } from "@/components/tickets/create-ticket-form";
import { prisma } from "@/lib/prisma"

import { UserRole } from "@/generated/prisma/client";
import { requireRole } from "@/lib/auth-guards";

export default async function NewTicketsPage() {
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
    <div className="mx-auto max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Create Ticket
        </h1>

        <p className="mt-1 text-gray-600">
          Submit a new request to the help desk team.
        </p>
      </div>

      <div className="mt-8">
        {categories.length === 0 ? (
          <div className="rounded-xl border bg-white p-6 shadow-sm">
            <p className="text-sm text-gray-600">
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