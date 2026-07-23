import { prisma } from "@/lib/prisma";

export default async function DashboardPage() {
  const [
    openTickets,
    inProgressTickets,
    waitingTickets,
    resolvedTickets,
    recentTickets,
  ] = await Promise.all([
    prisma.ticket.count({
      where: {
        status: "OPEN",
      },
    }),

    prisma.ticket.count({
      where: {
        status: "IN_PROGRESS",
      },
    }),

    prisma.ticket.count({
      where: {
        status: "WAITING_FOR_USER",
      },
    }),

    prisma.ticket.count({
      where: {
        status: "RESOLVED",
      },
    }),

    prisma.ticket.findMany({
      take: 5,
      orderBy: {
        createdAt: "desc",
      },
      include: {
        requester: true,
        assignedAgent: true,
        category: true,
      },
    }),
  ]);

  const statistics = [
    {
      label: "Open Tickets",
      value: openTickets,
    },
    {
      label: "In Progress",
      value: inProgressTickets,
    },
    {
      label: "Waiting for User",
      value: waitingTickets,
    },
    {
      label: "Resolved",
      value: resolvedTickets,
    },
  ];

  return (
    <div className="mx-auto max-w-7xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Dashboard
        </h1>

        <p className="mt-1 text-gray-600">
          Monitor help desk activity and ticket performance.
        </p>
      </div>

      <section className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {statistics.map((statistic) => (
          <article
            key={statistic.label}
            className="rounded-xl border bg-white p-6 shadow-sm"
          >
            <p className="text-sm font-medium text-gray-500">
              {statistic.label}
            </p>

            <p className="mt-2 text-3xl font-bold text-gray-900">
              {statistic.value}
            </p>
          </article>
        ))}
      </section>

      <section className="mt-8 overflow-hidden rounded-xl border bg-white shadow-sm">
        <div className="border-b p-6">
          <h2 className="text-lg font-semibold text-gray-900">
            Recent Tickets
          </h2>
        </div>

        {recentTickets.length === 0 ? (
          <p className="p-6 text-sm text-gray-500">
            No tickets are available.
          </p>
        ) : (
          <div className="divide-y">
            {recentTickets.map((ticket) => (
              <article
                key={ticket.id}
                className="flex items-start justify-between gap-4 p-6"
              >
                <div>
                  <p className="text-sm font-semibold text-gray-900">
                    {ticket.ticketNumber} — {ticket.subject}
                  </p>

                  <p className="mt-1 text-sm text-gray-500">
                    Requested by {ticket.requester.name}
                  </p>

                  <p className="mt-1 text-xs text-gray-500">
                    Category: {ticket.category.name}
                  </p>
                </div>

                <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700">
                  {ticket.status.replaceAll("_", " ")}
                </span>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}