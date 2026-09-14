import Link from "next/link";

export default function TicketNotFound() {
  return (
    <div className="mx-auto w-full max-w-xl min-w-0 rounded-xl border bg-white p-5 text-center shadow-sm sm:p-8">
      <p className="text-xs font-semibold tracking-wide text-gray-500 uppercase sm:text-sm">
        Ticket unavailable
      </p>

      <h1 className="mt-3 text-xl font-bold wrap-break-word text-gray-900 sm:text-2xl 2xl:text-3xl">
        This ticket could not be found
      </h1>

      <p className="mt-3 text-xs leading-5 wrap-break-word text-gray-600 sm:text-sm sm:leading-6 2xl:text-base">
        The ticket may not exist, or your account may not have permission to view it.
      </p>

      <Link
        href="/tickets"
        className="mt-6 inline-flex w-full items-center justify-center rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-700 sm:w-auto 2xl:px-5 2xl:py-3 2xl:text-base"
      >
        Return to Tickets
      </Link>
    </div>
  );
}
