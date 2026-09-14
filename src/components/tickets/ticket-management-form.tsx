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

const selectClassName =
  "w-full appearance-none rounded-lg border border-gray-300 bg-white py-2.5 pl-3 pr-12 text-xs text-black outline-none transition focus:border-slate-700 sm:text-sm";

function SelectChevron() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className="pointer-events-none absolute top-1/2 right-4 h-4 w-4 -translate-y-1/2 text-gray-700"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="m6 9 6 6 6-6" />
    </svg>
  );
}

export function TicketManagementForm({ ticket, agents }: TicketManagementFormProps) {
  const updateTicketWithId = updateTicket.bind(null, ticket.id);

  const [state, formAction, pending] = useActionState(updateTicketWithId, initialState);

  return (
    <form action={formAction} className="min-w-0 rounded-xl border bg-white p-4 shadow-sm sm:p-6">
      <h2 className="text-base font-semibold text-gray-900 sm:text-lg">Manage Ticket</h2>

      <div className="mt-4 grid gap-4 sm:mt-5 sm:gap-5 md:grid-cols-2 lg:grid-cols-1">
        <div>
          <label
            htmlFor="assignedAgentId"
            className="block text-xs font-medium text-gray-700 sm:text-sm"
          >
            Assigned Agent
          </label>

          <div className="relative mt-2">
            <select
              id="assignedAgentId"
              name="assignedAgentId"
              defaultValue={ticket.assignedAgentId ?? ""}
              className={selectClassName}
            >
              <option value="">Unassigned</option>

              {agents.map((agent) => (
                <option key={agent.id} value={agent.id}>
                  {agent.name} — {agent.email}
                </option>
              ))}
            </select>

            <SelectChevron />
          </div>

          {state.errors?.assignedAgentId?.map((error) => (
            <p key={error} className="mt-1 text-xs text-red-600 sm:text-sm">
              {error}
            </p>
          ))}
        </div>

        <div className="min-w-0">
          <label htmlFor="status" className="block text-xs font-medium text-gray-700 sm:text-sm">
            Status
          </label>

          <div className="relative mt-2">
            <select
              id="status"
              name="status"
              defaultValue={ticket.status}
              className={selectClassName}
            >
              {TICKET_STATUS_VALUES.map((status) => (
                <option key={status} value={status}>
                  {formatEnumLabel(status)}
                </option>
              ))}
            </select>

            <SelectChevron />
          </div>

          {state.errors?.status?.map((error) => (
            <p key={error} className="mt-1 text-xs text-red-600 sm:text-sm">
              {error}
            </p>
          ))}
        </div>

        <div className="min-w-0">
          <label htmlFor="priority" className="block text-xs font-medium text-gray-700 sm:text-sm">
            Priority
          </label>

          <div className="relative mt-2">
            <select
              id="priority"
              name="priority"
              defaultValue={ticket.priority}
              className={selectClassName}
            >
              {TICKET_PRIORITY_VALUES.map((priority) => (
                <option key={priority} value={priority}>
                  {formatEnumLabel(priority)}
                </option>
              ))}
            </select>

            <SelectChevron />
          </div>

          {state.errors?.priority?.map((error) => (
            <p key={error} className="mt-1 text-xs text-red-600 sm:text-sm">
              {error}
            </p>
          ))}
        </div>

        {state.message && (
          <p
            aria-live="polite"
            className={`rounded-lg px-3 py-2.5 text-xs sm:px-4 sm:py-3 sm:text-sm md:col-span-2 lg:col-span-1 ${
              state.success ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
            }`}
          >
            {state.message}
          </p>
        )}

        <button
          type="submit"
          disabled={pending}
          className="w-full rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60 md:col-span-2 lg:col-span-1"
        >
          {pending ? "Saving changes..." : "Save Changes"}
        </button>
      </div>
    </form>
  );
}
