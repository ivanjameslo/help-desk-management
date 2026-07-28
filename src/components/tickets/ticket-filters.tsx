import Link from "next/link";

import { formatEnumLabel } from "@/lib/formatters";
import {
  TICKET_PRIORITY_VALUES,
  TICKET_STATUS_VALUES,
} from "@/lib/validations/ticket-management";

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
            className="mt-8 rounded-xl border bg-white p-5 shadow-sm"
        >
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-6">
                <div className="md:col-span-2">
                    <label
                        htmlFor="ticekt-search"
                        className="block text-sm font-medium text-gray-700"
                    >
                        Search
                    </label>

                    <input
                        id="ticket-search"
                        name="q"
                        type="search"
                        defaultValue={currentFilters.query}
                        maxLength={100}
                        placeholder="Ticket number or subject"
                        className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none transition focus:border-slate-700"  
                    />
                </div>

                <div>
                    <label
                        htmlFor="ticket-status"
                        className="block text-sm font-medium text-gray-700"
                    >
                        Status
                    </label>

                    <select
                        id="ticket-status"
                        name="status"
                        defaultValue={currentFilters.status}
                        className="mt-2 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-slate-700"
                    >
                        <option value="">All statuses</option>

                        {TICKET_STATUS_VALUES.map((status) => (
                            <option key={status} value={status}>
                                {formatEnumLabel(status)}
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <label
                        htmlFor="ticket-priority"
                        className="block text-sm font-medium text-gray-700"
                    >
                        Priority
                    </label>

                    <select
                        id="ticket-priority"
                        name="priority"
                        defaultValue={currentFilters.priority}
                        className="mt-2 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-slate-700"
                    >
                        <option value="">All priorities</option>

                        {TICKET_PRIORITY_VALUES.map((priority) => (
                            <option key={priority} value={priority}>
                                {formatEnumLabel(priority)}
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <label
                        htmlFor="ticket-category"
                        className="block text-sm font-medium text-gray-700"
                    >
                        Category
                    </label>

                    <select
                        id="ticket-category"
                        name="category"
                        defaultValue={currentFilters.categoryId}
                        className="mt-2 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-slate-700"
                    >
                        <option value="">All categories</option>

                        {categories.map((category) => (
                            <option
                                key={category.id}
                                value={category.id}
                            >
                                {category.name}
                                {!category.isActive ? " (Inactive)" : ""}
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <label
                        htmlFor="ticket-sort"
                        className="block text-sm font-medium text-gray-700"
                    >
                        Sort
                    </label>

                    <select
                        id="ticket-sort"
                        name="sort"
                        defaultValue={currentFilters.sort}
                        className="mt-2 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-slate-700"
                    >
                        <option value="newest">Newest First</option>
                        <option value="oldest">Oldest First</option>
                        <option value="updated">Recently Updated</option>
                    </select>
                </div>
            </div>

            {showAgentFilter && (
                <div className="mt-4 max-w-sm">
                    <label
                        htmlFor="assigned-agent"
                        className="block text-sm font-medium text-gray-700"
                    >
                        Assigned Agent
                    </label>
                    
                    <select
                        id="assigned-agent"
                        name="assignedAgent"
                        defaultValue={currentFilters.assignedAgentId}
                        className="mt-2 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-slate-700"
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
                </div>
            )}

            <div className="mt-5 flex flex-wrap justify-end gap-3">
                <Link
                    href="/tickets"
                    className="rounded-lg border px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100"
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