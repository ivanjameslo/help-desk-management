import Link from "next/link";

export default function TicketsPage() {
  return (
    <div className="mx-auto max-w-7xl">
      <div className="flex items-center justify-between">
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

      <div className="mt-8 rounded-xl border bg-white p-8 text-center shadow-sm">
        <h2 className="font-semibold text-gray-900">
          No tickets available
        </h2>

        <p className="mt-2 text-sm text-gray-500">
          Tickets will appear here after the database is connected.
        </p>
      </div>
    </div>
  );
}