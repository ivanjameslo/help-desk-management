"use client";

import { useActionState } from "react";

import { updateTicket } from "@/app/(app)/tickets/[ticketId]/actions";
import { formatEnumLabel } from "@/lib/formatters";
import {
  TICKET_PRIORITY_VALUES,
  TICKET_STATUS_VALUES,
  type TicketPriorityValue,
  type TicketStatusValue,
  type UpdateTicketState,
} from "@/lib/validations/ticket-management";

type AgentOption = {
    id: string;
    name: string;
    email: string;
};

type TicketManagementFormProps = {
    ticket: {
        id: string;
        status: TicketStatusValue;
        priority: TicketPriorityValue;
        assignedAgentId: string | null;
    };
    agents: AgentOption[];
};

const initialState: UpdateTicketState = {};

export function TicketManagementForm({
    ticket,
    agents,
}: TicketManagementFormProps) {
    const updateTicketWithId = updateTicket.bind(
        null,
        ticket.id,
    );

    const [state, formAction, pending] = useActionState(
        updateTicketWithId,
        initialState,
    );

    return (
        <form
            action={formAction}
            className="rounded-xl border bg-white p-6 shadow-sm"
        >
            <h2 className="font-semibold text-gray-900">
                Manage Ticket
            </h2>

            <div className="mt-5 space-y-5">
                <div>
                    <label
                        htmlFor="assignedAgentId"
                        className="block text-sm font-medium text-gray-700"
                    >
                        Assigned Agent
                    </label>

                    <select
                        id="assignedAgentId"
                        name="assignedAgentId"
                        defaultValue={ticket.assignedAgentId ?? ""}
                        className="mt-2 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-slate-700"
                    >
                        <option value="">Unassigned</option>

                        {agents.map((agent) => (
                            <option key={agent.id} value={agent.id}>
                                {agent.name} — {agent.email}
                            </option>
                        ))}
                    </select>

                    {state.errors?.assignedAgentId?.map(
                        (error) => (
                        <p
                            key={error}
                            className="mt-1 text-sm text-red-600"
                        >
                            {error}
                        </p>
                        ),
                    )}
                </div>

                <div>
                    <label
                        htmlFor="status"
                        className="block text-sm font-medium text-gray-700"
                    >
                        Status
                    </label>

                    <select
                        id="status"
                        name="status"
                        defaultValue={ticket.status}
                        className="mt-2 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-slate-700"
                    >
                        {TICKET_STATUS_VALUES.map((status) => (
                            <option key={status} value={status}>
                                {formatEnumLabel(status)}
                            </option>
                        ))}
                    </select>

                    {state.errors?.status?.map((error) => (
                        <p
                            key={error}
                            className="mt-1 text-sm text-red-600"
                        >
                            {error}
                        </p>
                    ))}
                </div>
                
                <div>
                    <label
                        htmlFor="priority"
                        className="block text-sm font-medium text-gray-700"
                    >
                        Priority
                    </label>

                    <select
                        id="priority"
                        name="priority"
                        defaultValue={ticket.priority}
                        className="mt-2 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-slate-700"
                    >
                        {TICKET_PRIORITY_VALUES.map((priority) => (
                            <option key={priority} value={priority}>
                                {formatEnumLabel(priority)}
                            </option>
                        ))}
                    </select>

                    {state.errors?.priority?.map((error) => (
                        <p
                            key={error}
                            className="mt-1 text-sm text-red-600"
                        >
                            {error}
                        </p>
                    ))}
                </div>

                {state.message && (
                    <p
                        aria-live="polite"
                        className={`rounded-lg px-4 py-3 text-sm ${
                        state.success
                            ? "bg-green-50 text-green-700"
                            : "bg-red-50 text-red-700"
                        }`}
                    >
                        {state.message}
                    </p>
                )}

                <button
                    type="submit"
                    disabled={pending}
                    className="w-full rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                    {pending ? "Saving changes..." : "Save Changes"}
                </button>
            </div>
        </form>
    );
}