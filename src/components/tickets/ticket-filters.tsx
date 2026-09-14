import Link from "next/link";

import { formatEnumLabel } from "@/lib/formatters";
import { TICKET_PRIORITY_VALUES, TICKET_STATUS_VALUES } from "@/lib/validations/ticket-management";

type TicketFiltersProps = {
  currentFilters: {
    query: string;
    status: string;
    priority: string;
    categoryId: string;
    assignedAgentId: string;
    sort: string;
  };

  categories: {
    id: string;
    name: string;
    isActive: boolean;
  }[];

  agents: {
    id: string;
    name: string;
    isActive: boolean;
  }[];

  showAgentFilter: boolean;
};

function SelectChevron() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className="pointer-events-none absolute top-1/2 right-4 h-4 w-4 -translate-y-1/2 text-gray-600"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="m6 9 6 6 6-6" />
    </svg>
  );
}

const selectClassName =
  "w-full appearance-none rounded-lg border border-gray-300 bg-white py-2 pl-3 pr-11 text-sm text-black outline-none transition focus:border-slate-700";

export function TicketFilters({
  currentFilters,
  categories,
  agents,
  showAgentFilter,
}: TicketFiltersProps) {
  return (
    <form
      action="/tickets"
      method="get"
      className="mt-6 rounded-xl border bg-white p-4 shadow-sm sm:mt-8 sm:p-5"
    >
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-6">
        {/* Search */}
        <div className="md:col-span-2">
          <label htmlFor="ticket-search" className="block text-sm font-medium text-gray-700">
            Search
          </label>

          <input
            id="ticket-search"
            name="q"
            type="search"
            defaultValue={currentFilters.query}
            maxLength={100}
            placeholder="Ticket number or subject"
            className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-black transition outline-none focus:border-slate-700"
          />
        </div>

        {/* Status */}
        <div>
          <label htmlFor="ticket-status" className="block text-sm font-medium text-gray-700">
            Status
          </label>

          <div className="relative mt-2">
            <select
              id="ticket-status"
              name="status"
              defaultValue={currentFilters.status}
              className={selectClassName}
            >
              <option value="">All statuses</option>

              {TICKET_STATUS_VALUES.map((status) => (
                <option key={status} value={status}>
                  {formatEnumLabel(status)}
                </option>
              ))}
            </select>

            <SelectChevron />
          </div>
        </div>

        {/* Priority */}
        <div>
          <label htmlFor="ticket-priority" className="block text-sm font-medium text-gray-700">
            Priority
          </label>

          <div className="relative mt-2">
            <select
              id="ticket-priority"
              name="priority"
              defaultValue={currentFilters.priority}
              className={selectClassName}
            >
              <option value="">All priorities</option>

              {TICKET_PRIORITY_VALUES.map((priority) => (
                <option key={priority} value={priority}>
                  {formatEnumLabel(priority)}
                </option>
              ))}
            </select>

            <SelectChevron />
          </div>
        </div>

        {/* Category */}
        <div>
          <label htmlFor="ticket-category" className="block text-sm font-medium text-gray-700">
            Category
          </label>

          <div className="relative mt-2">
            <select
              id="ticket-category"
              name="category"
              defaultValue={currentFilters.categoryId}
              className={selectClassName}
            >
              <option value="">All categories</option>

              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                  {!category.isActive ? " (Inactive)" : ""}
                </option>
              ))}
            </select>

            <SelectChevron />
          </div>
        </div>

        {/* Sort */}
        <div>
          <label htmlFor="ticket-sort" className="block text-sm font-medium text-gray-700">
            Sort
          </label>

          <div className="relative mt-2">
            <select
              id="ticket-sort"
              name="sort"
              defaultValue={currentFilters.sort}
              className={selectClassName}
            >
              <option value="newest">Newest First</option>

              <option value="oldest">Oldest First</option>

              <option value="updated">Recently Updated</option>
            </select>

            <SelectChevron />
          </div>
        </div>
      </div>

      {/* Assigned Agent */}
      {showAgentFilter && (
        <div className="mt-4 w-full sm:max-w-sm">
          <label htmlFor="assigned-agent" className="block text-sm font-medium text-gray-700">
            Assigned Agent
          </label>

          <div className="relative mt-2">
            <select
              id="assigned-agent"
              name="assignedAgent"
              defaultValue={currentFilters.assignedAgentId}
              className={selectClassName}
            >
              <option value="">All assignments</option>

              <option value="unassigned">Unassigned</option>

              {agents.map((agent) => (
                <option key={agent.id} value={agent.id}>
                  {agent.name}
                  {!agent.isActive ? " (Inactive)" : ""}
                </option>
              ))}
            </select>

            <SelectChevron />
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="mt-5 grid grid-cols-2 gap-3 sm:flex sm:flex-wrap sm:justify-end">
        <Link
          href="/tickets"
          className="rounded-lg border px-4 py-2 text-center text-sm font-medium text-gray-700 transition hover:bg-gray-100"
        >
          Clear Filters
        </Link>

        <button
          type="submit"
          className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700"
        >
          Apply Filters
        </button>
      </div>
    </form>
  );
}
