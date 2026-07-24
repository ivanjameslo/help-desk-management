import Link from "next/link";

export default function TicketNotFound() {
  return (
    <div className="mx-auto max-w-xl rounded-xl border bg-white p-8 text-center shadow-sm">
      <p className="text-sm font-semibold uppercase tracking-wide text-gray-500">
        Ticket unavailable
      </p>

      <h1 className="mt-3 text-2xl font-bold text-gray-900">
        This ticket could not be found
      </h1>

      <p className="mt-3 text-sm leading-6 text-gray-600">
        The ticket may not exist, or your account may not have
        permission to view it.
      </p>

      <Link
        href="/tickets"
        className="mt-6 inline-block rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700"
      >
        Return to Tickets
      </Link>
    </div>
  );
}