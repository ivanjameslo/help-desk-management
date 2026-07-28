import Link from "next/link";

import { TicketFilters } from "@/components/tickets/ticket-filters";
import type { Prisma } from "@/generated/prisma/client";
import { UserRole } from "@/generated/prisma/enums";
import { requireUser } from "@/lib/auth-guards";
import {
  formatDate,
  formatEnumLabel,
} from "@/lib/formatters";
import { prisma } from "@/lib/prisma";
import {
  TICKET_PRIORITY_VALUES,
  TICKET_STATUS_VALUES,
  type TicketPriorityValue,
  type TicketStatusValue,
} from "@/lib/validations/ticket-management";

const PAGE_SIZE = 10;

const SORT_VALUES = [
  "newest",
  "oldest",
  "updated",
] as const;

type SortValue = (typeof SORT_VALUES) [number];

type TicketsPageProps = {
  searchParams: Promise<{
    q?: string | string[];
    status?: string | string[];
    priority?: string | string[];
    category?: string | string[];
    assignedAgent?: string | string[];
    sort?: string | string[];
    page?: string | string[];
  }>;
};

type ActiveFilters = {
  query: string;
  status: string;
  priority: string;
  categoryId: string;
  assignedAgentId: string;
  sort: SortValue;
};

function getSingleValue(
  value: string | string[] | undefined,
) {
  if (Array.isArray(value)) {
    return value[0] ?? "";
  }

  return value ?? "";
}

function parsePositiveInteger(value: string) {
  const parsedValue = Number.parseInt(value, 10);

  if (
    !Number.isFinite(parsedValue) ||
    parsedValue < 1
  ) {
    return 1;
  }

  return parsedValue;
}

function isValidStatus( 
  value: string,
): value is TicketStatusValue {
  return TICKET_STATUS_VALUES.includes(
    value as TicketStatusValue,
  );
}

function isValidPriority(
  value: string,
): value is TicketPriorityValue {
  return TICKET_PRIORITY_VALUES.includes(
    value as TicketPriorityValue,
  )
}

function isValidSort(
  value: string,
): value is SortValue {
  return SORT_VALUES.includes(value as SortValue);
}

function buildTicketsHref(
  filters: ActiveFilters,
  page: number,
) {
  const parameters = new URLSearchParams();

  if (filters.query) {
    parameters.set("q", filters.query);
  }

  if (filters.status) {
    parameters.set("status", filters.status);
  }

  if (filters.priority) {
    parameters.set("priority", filters.priority);
  }

  if (filters.categoryId) {
    parameters.set("category", filters.categoryId);
  }

  if (filters.assignedAgentId) {
    parameters.set("assignedAgent", filters.assignedAgentId);
  }

  if (filters.sort) {
    parameters.set("sort", filters.sort);
  }

  if (page > 1) {
    parameters.set("page", String(page));
  }

  const queryString = parameters.toString();

  return queryString 
    ? `/tickets?${queryString}`
    : "/tickets";
}

export default async function TicketsPage({ searchParams }: TicketsPageProps) {
  const user = await requireUser();
  const parameters = await searchParams;

  const query = getSingleValue(parameters.q)
    .trim()
    .slice(0, 100);

  const rawStatus = getSingleValue(parameters.status);

  const rawPriority = getSingleValue(parameters.priority);

  const categoryId = getSingleValue(parameters.category);

  const rawAssignedAgentId = getSingleValue(parameters.assignedAgent);

  const rawSort = getSingleValue(parameters.sort);

  const requestedPage = parsePositiveInteger(getSingleValue(parameters.page));

  const status = isValidStatus(rawStatus) ? rawStatus : "";

  const priority = isValidPriority(rawPriority) ? rawPriority : "";

  const sort: SortValue = isValidSort(rawSort) ? rawSort : "newest";

  /*
   * Requesters do not receive the assignment filter.
   * Ignore the URL parameter if they add it manually.
   */

  const assignedAgentId = 
    user.role === UserRole.REQUESTER
      ? ""
      : rawAssignedAgentId;

  const filters: ActiveFilters = {
    query,
    status,
    priority,
    categoryId,
    assignedAgentId,
    sort,
  };

  const where: Prisma.TicketWhereInput = {
    /*
     * Requesters can only retrieve their own tickets.
     * Agents and administrators can retrieve all tickets.
     */

    ...(user.role === UserRole.REQUESTER
      ? {
        requesterId: user.id,
        }
      : {}),

    ...(query 
      ? {
        OR: [
          {
            ticketNumber: {
              contains: query,
              mode: "insensitive",
            },
          },
          {
            subject: {
              contains: query,
              mode: "insensitive",
            },
          },
        ],
      }
    :{}),

    ...(status
      ? {
        status,
        }
      : {}),

    ...(priority
      ? {
        priority,
        }
      : {}),

    ...(categoryId
      ? {
        categoryId
        }
      : {}),

    ...(assignedAgentId === "unassigned"
      ? {
        assignedAgentId: null,
        }
      : assignedAgentId
        ? {
          assignedAgentId
          }
        : {}),
  };

  const orderBy: Prisma.TicketOrderByWithRelationInput = 
    sort === "oldest"
      ? {
          createdAt: "asc",
        }
      : sort === "updated"
        ? {
            updatedAt: "desc",
          }
        : {
            createdAt: "desc",
          };

  const [
    totalTickets,
    categories,
    agents,
  ] = await Promise.all([
    prisma.ticket.count({
      where,
    }),

    /*
     * Include inactive categories so historical tickets
     * can still be filtered correctly.
     */
    prisma.category.findMany({
      orderBy: {
        name: "asc",
      },
      select: {
        id: true,
        name: true,
        isActive: true,
      },
    }),

    user.role === UserRole.REQUESTER
      ? Promise.resolve([])
      : prisma.user.findMany({
          where: {
            role: UserRole.AGENT,
          },
          orderBy: {
            name: "asc",
          },
          select: {
            id: true,
            name: true,
            isActive: true,
          },
        }),
  ]);

  const totalPages = Math.max(1, Math.ceil(totalTickets / PAGE_SIZE));

  const currentPage = Math.min(requestedPage, totalPages);

  const tickets = await prisma.ticket.findMany({
    where,
    orderBy,
    skip: (currentPage - 1) * PAGE_SIZE,
    take: PAGE_SIZE,

    include: {
      requester: {
        select: {
          name: true,
        },
      },

      category: {
        select: {
          name: true,
        },
      },

      assignedAgent: {
        select: {
          name: true,
        },
      },
    },
  });

  const firstResult = 
    totalTickets === 0 
      ? 0
      : (currentPage - 1) * PAGE_SIZE + 1;

  const lastResult = Math.min(
    currentPage * PAGE_SIZE,
    totalTickets,
  );

  const hasActiveFilters = Boolean(
    query ||
      status ||
      priority ||
      categoryId ||
      assignedAgentId ||
      sort !== "newest",
  );

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

        {user.role === UserRole.REQUESTER && (
          <Link
            href="/tickets/new"
            className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700"
          >
            Create Ticket
          </Link>
        )}
      </div>

      <TicketFilters
        currentFilters={filters}
        categories={categories}
        agents={agents}
        showAgentFilter={
          user.role !== UserRole.REQUESTER
        }
      />

      <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-gray-600">
          Showing {firstResult}–{lastResult} of{" "}
          {totalTickets}{" "}
          {totalTickets === 1 ? "ticket" : "tickets"}
        </p>

        {hasActiveFilters && (
          <p className="text-sm text-gray-500">
            Filters are currently applied.
          </p>
        )}
      </div>

      <div className="mt-4 overflow-hidden rounded-xl border bg-white shadow-sm">
        {tickets.length === 0 ? (
          <div className="p-8 text-center">
            <h2 className="font-semibold text-gray-900">
              {hasActiveFilters
                ? "No matching tickets"
                : "No tickets available"}
            </h2>

            <p className="mt-2 text-sm text-gray-500">
              {hasActiveFilters
                ? "Try changing or clearing your filters."
                : user.role === UserRole.REQUESTER
                  ? "Create your first ticket to get started."
                  : "There are currently no help desk tickets."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-225 text-left text-sm">
              <thead className="border-b bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
                <tr>
                  <th className="px-6 py-4">Ticket</th>
                  <th className="px-6 py-4">
                    Category
                  </th>
                  <th className="px-6 py-4">
                    Requester
                  </th>
                  <th className="px-6 py-4">
                    Priority
                  </th>
                  <th className="px-6 py-4">
                    Status
                  </th>
                  <th className="px-6 py-4">
                    Assigned Agent
                  </th>
                  <th className="px-6 py-4">
                    Created
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y">
                {tickets.map((ticket) => (
                  <tr
                    key={ticket.id}
                    className="transition hover:bg-gray-50"
                  >
                    <td className="px-6 py-4">
                      <Link
                        href={`/tickets/${ticket.id}`}
                        className="group block"
                      >
                        <p className="font-medium text-gray-900 transition group-hover:text-slate-600">
                          {ticket.subject}
                        </p>

                        <p className="mt-1 text-xs text-gray-500">
                          {ticket.ticketNumber}
                        </p>
                      </Link>
                    </td>

                    <td className="px-6 py-4 text-gray-600">
                      {ticket.category.name}
                    </td>

                    <td className="px-6 py-4 text-gray-600">
                      {ticket.requester.name}
                    </td>

                    <td className="px-6 py-4">
                      <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700">
                        {formatEnumLabel(
                          ticket.priority,
                        )}
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700">
                        {formatEnumLabel(
                          ticket.status,
                        )}
                      </span>
                    </td>

                    <td className="px-6 py-4 text-gray-600">
                      {ticket.assignedAgent?.name ??
                        "Unassigned"}
                    </td>

                    <td className="px-6 py-4 text-gray-600">
                      {formatDate(ticket.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {totalPages > 1 && (
        <nav
          aria-label="Ticket pagination"
          className="mt-6 flex flex-wrap items-center justify-between gap-4"
        >
          <p className="text-sm text-gray-500">
            Page {currentPage} of {totalPages}
          </p>

          <div className="flex items-center gap-2">
            {currentPage > 1 ? (
              <Link
                href={buildTicketsHref(
                  filters,
                  currentPage - 1,
                )}
                className="rounded-lg border px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100"
              >
                Previous
              </Link>
            ) : (
              <span className="cursor-not-allowed rounded-lg border px-4 py-2 text-sm font-medium text-gray-400">
                Previous
              </span>
            )}

            {currentPage < totalPages ? (
              <Link
                href={buildTicketsHref(
                  filters,
                  currentPage + 1,
                )}
                className="rounded-lg border px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100"
              >
                Next
              </Link>
            ) : (
              <span className="cursor-not-allowed rounded-lg border px-4 py-2 text-sm font-medium text-gray-400">
                Next
              </span>
            )}
          </div>
        </nav>
      )}
    </div>
  );
}