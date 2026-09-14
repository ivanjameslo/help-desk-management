import Link from "next/link";

import { DashboardBreakdown } from "@/components/dashboard/dashboard-breakdown";
import { DashboardStatCard } from "@/components/dashboard/dashboard-stat-card";
import type { Prisma } from "@/generated/prisma/client";
import { TicketPriority, TicketStatus, UserRole } from "@/generated/prisma/enums";
import { requireUser } from "@/lib/auth-guards";
import { formatDateTime, formatEnumLabel } from "@/lib/formatters";
import { prisma } from "@/lib/prisma";
import { getTicketAccessWhere, getTicketActivityAccessWhere } from "@/lib/ticket-access";

const ACTIVE_STATUSES: TicketStatus[] = [
  TicketStatus.OPEN,
  TicketStatus.ASSIGNED,
  TicketStatus.IN_PROGRESS,
  TicketStatus.WAITING_FOR_USER,
];

const STATUS_DISPLAY_ORDER: TicketStatus[] = [
  TicketStatus.OPEN,
  TicketStatus.ASSIGNED,
  TicketStatus.IN_PROGRESS,
  TicketStatus.WAITING_FOR_USER,
  TicketStatus.RESOLVED,
  TicketStatus.CLOSED,
];

const PRIORITY_DISPLAY_ORDER: TicketPriority[] = [
  TicketPriority.URGENT,
  TicketPriority.HIGH,
  TicketPriority.MEDIUM,
  TicketPriority.LOW,
];

export default async function DashboardPage() {
  const user = await requireUser();

  const isRequester = user.role === UserRole.REQUESTER;

  /*
   * Requesters can only retrieve dashboard data
   * from tickets that they personally submitted.
   *
   * Agents and administrators receive system-wide data.
   */
  const ticketAccessWhere: Prisma.TicketWhereInput = getTicketAccessWhere(user);

  const [
    totalTickets,
    statusGroups,
    priorityGroups,
    recentTickets,
    recentActivities,
    unassignedActiveTickets,
    urgentActiveTickets,
  ] = await Promise.all([
    /*
     * Total tickets visible to the current user.
     */
    prisma.ticket.count({
      where: ticketAccessWhere,
    }),

    /*
     * Group accessible tickets by status.
     */
    prisma.ticket.groupBy({
      by: ["status"],
      where: ticketAccessWhere,

      _count: {
        _all: true,
      },
    }),

    /*
     * Group accessible tickets by priority.
     */
    prisma.ticket.groupBy({
      by: ["priority"],
      where: ticketAccessWhere,

      _count: {
        _all: true,
      },
    }),

    /*
     * Load the five most recently updated tickets.
     */
    prisma.ticket.findMany({
      where: ticketAccessWhere,

      orderBy: {
        updatedAt: "desc",
      },

      take: 5,

      select: {
        id: true,
        ticketNumber: true,
        subject: true,
        status: true,
        priority: true,
        updatedAt: true,

        category: {
          select: {
            name: true,
          },
        },

        requester: {
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
    }),

    /*
     * Requesters only receive:
     * - activities belonging to their tickets
     * - non-internal activities
     *
     * Agents and administrators receive all recent
     * ticket activity.
     */
    prisma.ticketActivity.findMany({
      where: getTicketActivityAccessWhere(user),

      orderBy: {
        createdAt: "desc",
      },

      take: 6,

      select: {
        id: true,
        description: true,
        createdAt: true,
        isInternal: true,

        ticket: {
          select: {
            id: true,
            ticketNumber: true,
            subject: true,
          },
        },
      },
    }),

    /*
     * Requesters do not need system-wide assignment
     * statistics.
     */
    isRequester
      ? Promise.resolve(0)
      : prisma.ticket.count({
          where: {
            assignedAgentId: null,

            status: {
              in: ACTIVE_STATUSES,
            },
          },
        }),

    /*
     * Count urgent active tickets for agents and admins.
     */
    isRequester
      ? Promise.resolve(0)
      : prisma.ticket.count({
          where: {
            priority: TicketPriority.URGENT,

            status: {
              in: ACTIVE_STATUSES,
            },
          },
        }),
  ]);

  /*
   * Convert Prisma group results into maps so each
   * enum value can be retrieved easily.
   */
  const statusCountMap = new Map<TicketStatus, number>(
    statusGroups.map((group) => [group.status, group._count._all]),
  );

  const priorityCountMap = new Map<TicketPriority, number>(
    priorityGroups.map((group) => [group.priority, group._count._all]),
  );

  const activeTicketCount = ACTIVE_STATUSES.reduce(
    (total, status) => total + (statusCountMap.get(status) ?? 0),
    0,
  );

  const waitingForUserCount = statusCountMap.get(TicketStatus.WAITING_FOR_USER) ?? 0;

  const completedTicketCount =
    (statusCountMap.get(TicketStatus.RESOLVED) ?? 0) +
    (statusCountMap.get(TicketStatus.CLOSED) ?? 0);

  /*
   * Display different statistics depending on role.
   */
  const dashboardStatistics = isRequester
    ? [
        {
          label: "My Tickets",
          value: totalTickets,
          description: "All help desk requests you submitted.",
        },
        {
          label: "Active Tickets",
          value: activeTicketCount,
          description: "Tickets that still require attention.",
        },
        {
          label: "Waiting for You",
          value: waitingForUserCount,
          description: "Tickets waiting for your response.",
        },
        {
          label: "Completed",
          value: completedTicketCount,
          description: "Tickets marked resolved or closed.",
        },
      ]
    : [
        {
          label: "Total Tickets",
          value: totalTickets,
          description: "All tickets currently in the system.",
        },
        {
          label: "Active Tickets",
          value: activeTicketCount,
          description: "Tickets that are not resolved or closed.",
        },
        {
          label: "Unassigned",
          value: unassignedActiveTickets,
          description: "Active tickets without an assigned agent.",
        },
        {
          label: "Urgent",
          value: urgentActiveTickets,
          description: "Active tickets with urgent priority.",
        },
      ];

  const statusBreakdown = STATUS_DISPLAY_ORDER.map((status) => ({
    label: formatEnumLabel(status),
    value: statusCountMap.get(status) ?? 0,
  }));

  const priorityBreakdown = PRIORITY_DISPLAY_ORDER.map((priority) => ({
    label: formatEnumLabel(priority),
    value: priorityCountMap.get(priority) ?? 0,
  }));

  return (
    <div className="mx-auto max-w-7xl">
      {/* Page heading */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl 2xl:text-4xl">Dashboard</h1>

          <p className="mt-1 text-sm text-gray-600 sm:text-base 2xl:text-lg">
            Welcome back, {user.name}.
          </p>
        </div>

        <Link
          href={isRequester ? "/tickets/new" : "/tickets"}
          className="w-full rounded-lg bg-slate-900 px-4 py-2.5 text-center text-sm font-medium text-white transition hover:bg-slate-700 sm:w-auto 2xl:px-5 2xl:py-3 2xl:text-base"
        >
          {isRequester ? "Create Ticket" : "View All Tickets"}
        </Link>
      </div>

      {/* Statistic cards */}
      <section className="mt-5 grid grid-cols-2 gap-3 sm:mt-6 sm:gap-4 xl:grid-cols-4 2xl:gap-6">
        {dashboardStatistics.map((statistic) => (
          <DashboardStatCard
            key={statistic.label}
            label={statistic.label}
            value={statistic.value}
            description={statistic.description}
          />
        ))}
      </section>

      {/* Status and priority breakdowns */}
      <div className="mt-4 grid gap-4 sm:mt-6 sm:gap-6 lg:grid-cols-2">
        <DashboardBreakdown
          title="Tickets by Status"
          items={statusBreakdown}
          total={totalTickets}
        />

        <DashboardBreakdown
          title="Tickets by Priority"
          items={priorityBreakdown}
          total={totalTickets}
        />
      </div>

      {/* Recent tickets and activities */}
      <div className="mt-4 grid items-start gap-4 sm:mt-6 sm:gap-6 xl:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.8fr)]">
        {/* Recent tickets */}
        <section className="overflow-hidden rounded-xl border bg-white shadow-sm">
          <div className="flex items-center justify-between gap-4 border-b px-4 py-4 sm:px-6 sm:py-5">
            <h2 className="text-base font-semibold text-gray-900 sm:text-lg 2xl:text-xl">
              Recent Tickets
            </h2>

            <Link
              href="/tickets"
              className="text-sm font-medium text-slate-700 transition hover:text-slate-500"
            >
              View all
            </Link>
          </div>

          {recentTickets.length === 0 ? (
            <div className="p-6">
              <p className="text-sm text-gray-500">No tickets are available yet.</p>
            </div>
          ) : (
            <div className="divide-y">
              {recentTickets.map((ticket) => (
                <article
                  key={ticket.id}
                  className="flex flex-wrap items-start justify-between gap-3 px-4 py-4 transition hover:bg-gray-50 sm:gap-4 sm:px-6 sm:py-5"
                >
                  <div className="min-w-0">
                    <Link
                      href={`/tickets/${ticket.id}`}
                      className="font-semibold text-gray-900 transition hover:text-slate-600"
                    >
                      {ticket.subject}
                    </Link>

                    <p className="mt-1 text-xs font-medium text-gray-500">{ticket.ticketNumber}</p>

                    <p className="mt-3 text-sm text-gray-600">
                      {ticket.category.name}
                      {" · "}
                      {formatEnumLabel(ticket.priority)} priority
                    </p>

                    <p className="mt-1 text-xs text-gray-500">
                      {isRequester
                        ? `Assigned to ${ticket.assignedAgent?.name ?? "No agent yet"}`
                        : `Requested by ${ticket.requester.name}`}
                    </p>

                    <p className="mt-1 text-xs text-gray-500">
                      Updated {formatDateTime(ticket.updatedAt)}
                    </p>
                  </div>

                  <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700">
                    {formatEnumLabel(ticket.status)}
                  </span>
                </article>
              ))}
            </div>
          )}
        </section>

        {/* Recent activity */}
        <section className="overflow-hidden rounded-xl border bg-white shadow-sm">
          <div className="border-b px-4 py-4 sm:px-6 sm:py-5">
            <h2 className="text-base font-semibold text-gray-900 sm:text-lg 2xl:text-xl">
              Recent Activity
            </h2>
          </div>

          {recentActivities.length === 0 ? (
            <div className="p-4 sm:p-6">
              <p className="text-xs text-gray-500 sm:text-sm">
                No ticket activity has been recorded yet.
              </p>
            </div>
          ) : (
            <ol className="divide-y">
              {recentActivities.map((activity) => (
                <li key={activity.id} className="px-4 py-4 sm:px-6 sm:py-5">
                  <Link
                    href={`/tickets/${activity.ticket.id}`}
                    className="text-xs font-medium text-gray-900 transition hover:text-slate-600 sm:text-sm"
                  >
                    {activity.ticket.ticketNumber}
                  </Link>

                  <p className="mt-2 text-xs leading-5 text-gray-600 sm:text-sm sm:leading-6">
                    {activity.description}
                  </p>

                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <p className="text-[11px] text-gray-500 sm:text-xs">
                      {formatDateTime(activity.createdAt)}
                    </p>

                    {activity.isInternal && (
                      <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-medium text-amber-800 sm:text-xs">
                        Internal
                      </span>
                    )}
                  </div>
                </li>
              ))}
            </ol>
          )}
        </section>
      </div>
    </div>
  );
}
