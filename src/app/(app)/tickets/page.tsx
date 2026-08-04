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
import { getTicketAccessWhere } from "@/lib/ticket-access";

const PAGE_SIZE = 10;

const SORT_VALUES = [
  "newest",
  "oldest",
  "updated",
] as const;

type SortValue = (typeof SORT_VALUES)[number];

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
  );
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

  const ticketAccessWhere = getTicketAccessWhere(user);

  const where: Prisma.TicketWhereInput = {
    /*
     * Requesters can only retrieve their own tickets.
     * Agents and administrators can retrieve all tickets.
     */

    ...ticketAccessWhere,

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
        categoryId,
        }
      : {}),

    ...(assignedAgentId === "unassigned"
      ? {
        assignedAgentId: null,
        }
      : assignedAgentId
        ? {
          assignedAgentId,
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
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl 2xl:text-4xl">
            Tickets
          </h1>

          <p className="mt-1 text-sm text-gray-600 sm:text-base 2xl:text-lg">
            View and manage help desk requests.
          </p>
        </div>

        {user.role === UserRole.REQUESTER && (
          <Link
            href="/tickets/new"
            className="w-full rounded-lg bg-slate-900 px-4 py-2.5 text-center text-sm font-medium text-white transition hover:bg-slate-700 sm:w-auto 2xl:px-5 2xl:py-3 2xl:text-base"
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

      <div className="mt-4 flex flex-col gap-1 sm:mt-6 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
        <p className="text-xs text-gray-600 sm:text-sm">
          Showing {firstResult}–{lastResult} of{" "}
          {totalTickets}{" "}
          {totalTickets === 1 ? "ticket" : "tickets"}
        </p>

        {hasActiveFilters && (
          <p className="text-xs text-gray-500 sm:text-sm">
            Filters are currently applied.
          </p>
        )}
      </div>

      <div className="mt-4">
        {tickets.length === 0 ? (
          <section className="rounded-xl border bg-white p-6 text-center shadow-sm sm:p-8">
            <h2 className="text-sm font-semibold text-gray-900 sm:text-base">
              {hasActiveFilters
                ? "No matching tickets"
                : "No tickets available"}
            </h2>

            <p className="mt-2 text-xs text-gray-500 sm:text-sm">
              {hasActiveFilters
                ? "Try changing or clearing your filters."
                : user.role === UserRole.REQUESTER
                  ? "Create your first ticket to get started."
                  : "There are currently no help desk tickets."}
            </p>
          </section>
        ) : (
          <>
            {/* Mobile and tablet ticket cards */}
            <div className="grid gap-3 lg:hidden">
              {tickets.map((ticket) => (
                <article
                  key={ticket.id}
                  className="rounded-xl border bg-white p-4 shadow-sm sm:p-5"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <Link
                        href={`/tickets/${ticket.id}`}
                        className="block truncate text-sm font-semibold text-gray-900 transition hover:text-slate-600 sm:text-base"
                      >
                        {ticket.subject}
                      </Link>

                      <p className="mt-1 text-[11px] font-medium text-gray-500 sm:text-xs">
                        {ticket.ticketNumber}
                      </p>
                    </div>

                    <span className="shrink-0 rounded-full bg-gray-100 px-2.5 py-1 text-[10px] font-medium text-gray-700 sm:text-xs">
                      {formatEnumLabel(ticket.status)}
                    </span>
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3">
                    <div className="min-w-0">
                      <p className="text-[10px] font-medium uppercase tracking-wide text-gray-400 sm:text-xs">
                        Category
                      </p>

                      <p className="mt-1 truncate text-xs text-gray-700 sm:text-sm">
                        {ticket.category.name}
                      </p>
                    </div>

                    <div>
                      <p className="text-[10px] font-medium uppercase tracking-wide text-gray-400 sm:text-xs">
                        Priority
                      </p>

                      <div className="mt-1">
                        <span className="inline-flex rounded-full bg-gray-100 px-2.5 py-1 text-[10px] font-medium text-gray-700 sm:text-xs">
                          {formatEnumLabel(ticket.priority)}
                        </span>
                      </div>
                    </div>

                    <div className="min-w-0">
                      <p className="text-[10px] font-medium uppercase tracking-wide text-gray-400 sm:text-xs">
                        Requester
                      </p>

                      <p className="mt-1 truncate text-xs text-gray-700 sm:text-sm">
                        {ticket.requester.name}
                      </p>
                    </div>

                    <div className="min-w-0">
                      <p className="text-[10px] font-medium uppercase tracking-wide text-gray-400 sm:text-xs">
                        Assigned Agent
                      </p>

                      <p className="mt-1 truncate text-xs text-gray-700 sm:text-sm">
                        {ticket.assignedAgent?.name ?? "Unassigned"}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-between border-t pt-3">
                    <p className="text-[11px] text-gray-500 sm:text-xs">
                      Created {formatDate(ticket.createdAt)}
                    </p>

                    <Link
                      href={`/tickets/${ticket.id}`}
                      className="text-xs font-medium text-slate-700 transition hover:text-slate-500 sm:text-sm"
                    >
                      View ticket
                    </Link>
                  </div>
                </article>
              ))}
            </div>

            {/* Laptop and desktop table */}
            <div className="hidden overflow-hidden rounded-xl border bg-white shadow-sm lg:block">
              <div className="overflow-x-auto">
                <table className="w-full min-w-225 text-left text-sm 2xl:text-base">
                  <thead className="border-b bg-gray-50 text-xs uppercase tracking-wide text-gray-500 2xl:text-sm">
                    <tr>
                      <th className="px-5 py-4 2xl:px-6">
                        Ticket
                      </th>

                      <th className="px-5 py-4 2xl:px-6">
                        Category
                      </th>

                      <th className="px-5 py-4 2xl:px-6">
                        Requester
                      </th>

                      <th className="px-5 py-4 2xl:px-6">
                        Priority
                      </th>

                      <th className="px-5 py-4 2xl:px-6">
                        Status
                      </th>

                      <th className="px-5 py-4 2xl:px-6">
                        Assigned Agent
                      </th>

                      <th className="px-5 py-4 2xl:px-6">
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
                        <td className="px-5 py-4 2xl:px-6 2xl:py-5">
                          <Link
                            href={`/tickets/${ticket.id}`}
                            className="group block"
                          >
                            <p className="font-medium text-gray-900 transition group-hover:text-slate-600">
                              {ticket.subject}
                            </p>

                            <p className="mt-1 text-xs text-gray-500 2xl:text-sm">
                              {ticket.ticketNumber}
                            </p>
                          </Link>
                        </td>

                        <td className="px-5 py-4 text-gray-600 2xl:px-6 2xl:py-5">
                          {ticket.category.name}
                        </td>

                        <td className="px-5 py-4 text-gray-600 2xl:px-6 2xl:py-5">
                          {ticket.requester.name}
                        </td>

                        <td className="px-5 py-4 2xl:px-6 2xl:py-5">
                          <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700 2xl:text-sm">
                            {formatEnumLabel(ticket.priority)}
                          </span>
                        </td>

                        <td className="px-5 py-4 2xl:px-6 2xl:py-5">
                          <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700 2xl:text-sm">
                            {formatEnumLabel(ticket.status)}
                          </span>
                        </td>

                        <td className="px-5 py-4 text-gray-600 2xl:px-6 2xl:py-5">
                          {ticket.assignedAgent?.name ??
                            "Unassigned"}
                        </td>

                        <td className="whitespace-nowrap px-5 py-4 text-gray-600 2xl:px-6 2xl:py-5">
                          {formatDate(ticket.createdAt)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>

      {totalPages > 1 && (
        <nav
          aria-label="Ticket pagination"
          className="mt-5 flex flex-col gap-3 sm:mt-6 sm:flex-row sm:items-center sm:justify-between sm:gap-4"
        >
          <p className="text-center text-xs text-gray-500 sm:text-left sm:text-sm">
            Page {currentPage} of {totalPages}
          </p>

          <div className="grid grid-cols-2 gap-2 sm:flex sm:items-center">
            {currentPage > 1 ? (
              <Link
                href={buildTicketsHref(
                  filters,
                  currentPage - 1,
                )}
                className="rounded-lg border px-3 py-2 text-center text-xs font-medium text-gray-700 transition hover:bg-gray-100 sm:px-4 sm:text-sm"
              >
                Previous
              </Link>
            ) : (
              <span className="cursor-not-allowed rounded-lg border px-3 py-2 text-center text-xs font-medium text-gray-400 sm:px-4 sm:text-sm">
                Previous
              </span>
            )}

            {currentPage < totalPages ? (
              <Link
                href={buildTicketsHref(
                  filters,
                  currentPage + 1,
                )}
                className="rounded-lg border px-3 py-2 text-center text-xs font-medium text-gray-700 transition hover:bg-gray-100 sm:px-4 sm:text-sm"
              >
                Next
              </Link>
            ) : (
              <span className="cursor-not-allowed rounded-lg border px-3 py-2 text-center text-xs font-medium text-gray-400 sm:px-4 sm:text-sm">
                Next
              </span>
            )}
          </div>
        </nav>
      )}
    </div>
  );
}