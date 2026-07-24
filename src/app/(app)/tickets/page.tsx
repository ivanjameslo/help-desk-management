import Link from "next/link";

import { prisma } from "@/lib/prisma";
import { UserRole } from "@/generated/prisma/client";
import { requireUser } from "@/lib/auth-guards";

function formatLabel(value: string) {
  return value
    .toLowerCase()
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export default async function TicketsPage() {
  const user = await requireUser();

  const tickets = await prisma.ticket.findMany({
    where: 
      user.role === UserRole.REQUESTER 
        ? {
            requesterId: user.id
          }
        : undefined,
        
      // Prisma returns only tickets belonging to that user.
      // Undefined: No ownership filter is applied, so all tickets are returned.
   
      orderBy: {
      createdAt: "desc",
    },
    include: {
      requester: {
        select: {
          name: true,
        },
      },
      category: {
        select: {
          name: true,
        }
      },
      assignedAgent: {
        select: {
          name: true,
        },
      },
    },
  });

  return (
    <div className="mx-auto max-w-7xl">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Tickets
          </h1>

          <p className="mt-1 text-gray-600">
            View and manage help desk requests.
          </p>
        </div>

        <Link
          href="/tickets/new"
          className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700"
        >
          Create Ticket
        </Link>
      </div>

      <div className="mt-8 overflow-hidden rounded-xl border bg-white shadow-sm">
        {tickets.length === 0 ? (
          <div className="p-8 text-center">
            <h2 className="font-semibold text-gray-900">
              No tickets available
            </h2>

            <p className="mt-2 text-sm text-gray-500">
              Create your first ticket to get started.
            </p>
          </div>
        ): (
          <div className="overflow-x-auto">
            <table className="w-full min-w-225 text-left text-sm">
              <thead className="border-b bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
                <tr>
                  <th className="px-6 py-4">Ticket</th>
                  <th className="px-6 py-4">Category</th>
                  <th className="px-6 py-4">Requester</th>
                  <th className="px-6 py-4">Priority</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Assigned Agent</th>
                  <th className="px-6 py-4">Created</th>
                </tr>
              </thead>

              <tbody className="divide-y">
                {tickets.map((ticket) => (
                  <tr
                    key={ticket.id}
                    className="transition hover:bg-gray-50"
                  >
                    <td className="px-6 py-4">
                      <p className="font-medium text-gray-900">
                        {ticket.subject}
                      </p>

                      <p className="mt-1 text-xs text-gray-500">
                        {ticket.ticketNumber}
                      </p>
                    </td>

                    <td className="px-6 py-4 text-gray-600">
                      {ticket.category.name}
                    </td>

                    <td className="px-6 py-4 text-gray-600">
                      {ticket.requester.name}
                    </td>

                    <td className="px-6 py-4">
                      <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700">
                        {formatLabel(ticket.priority)}
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700">
                        {formatLabel(ticket.status)}
                      </span>
                    </td>

                    <td className="px-6 py-4 text-gray-600">
                      {ticket.assignedAgent?.name ?? "Unassigned"}
                    </td>

                    <td className="px-6 py-4 text-gray-600">
                      {new Intl.DateTimeFormat("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      }).format(ticket.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}