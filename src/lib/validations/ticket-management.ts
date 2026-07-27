import { z } from "zod";

export const TICKET_STATUS_VALUES = [
    "OPEN",
    "ASSIGNED",
    "IN_PROGRESS",
    "WAITING_FOR_USER",
    "RESOLVED",
    "CLOSED",
] as const;

export const TICKET_PRIORITY_VALUES = [
    "LOW",
    "MEDIUM",
    "HIGH",
    "URGENT",
] as const;

export const updateTicketSchema = z.object({
    status: z.enum(TICKET_STATUS_VALUES),
    priority: z.enum(TICKET_PRIORITY_VALUES),
    assignedAgentId: z.string().trim(),
});

export type TicketStatusValue = (typeof TICKET_STATUS_VALUES) [number];

export type TicketPriorityValue = (typeof TICKET_PRIORITY_VALUES) [number];

export type UpdateTicketState = {
    errors?: {
        status?: string[];
        priority?: string[];
        assignedAgentId?: string[];
    };
    message?: string;
    success?: boolean;
};