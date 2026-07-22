const statistics = [
  {
    label: "Open Tickets",
    value: 12,
  },
  {
    label: "In Progress",
    value: 7,
  },
  {
    label: "Waiting for User",
    value: 4,
  },
  {
    label: "Resolved Today",
    value: 9,
  },
];

export default function DashboardPage() {
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

      <section className="mt-8 rounded-xl border bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900">
          Recent Tickets
        </h2>

        <p className="mt-2 text-sm text-gray-500">
          Ticket information will appear here after we connect the database.
        </p>
      </section>
    </div>
  );
}