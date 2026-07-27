"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { TicketActivityType, UserRole } from "@/generated/prisma/enums";
import { requireRole } from "@/lib/auth-guards";
import { prisma } from "@/lib/prisma";
import {
  updateTicketSchema,
  type UpdateTicketState,
} from "@/lib/validations/ticket-management";
import { formatEnumLabel } from "@/lib/formatters";
import { stat } from "fs";

export async function updateTicket(
    ticketId: string,
    _previousState: UpdateTicketState,
    formData: FormData,
): Promise<UpdateTicketState>{
    /*
    * Only agents and administrators may update tickets.
    */
    const currentUser = await requireRole([
        UserRole.AGENT,
        UserRole.ADMIN,
    ]);

    const validatedFields = updateTicketSchema.safeParse({
        status: formData.get("status"),
        priority: formData.get("priority"),
        assignedAgentId: String(
            formData.get("assignedAgentId") ?? "",
        ),
    });

    if (!validatedFields.success) {
        return {
            errors: z.flattenError(
                validatedFields.error,
            ).fieldErrors,
            message: "Please correct the highlighted fields.",
            success: false,
        };
    }

    const {
        status,
        priority,
        assignedAgentId: submittedAgentId,
    } = validatedFields.data;

    const assignedAgentId = submittedAgentId. length > 0 ? submittedAgentId : null;

    const ticket = await prisma.ticket.findUnique({
        where: {
            id: ticketId,
        },
        select: {
            id: true,
            status: true,
            priority: true,
            assignedAgentId: true,
            resolvedAt: true,
            closedAt: true,        
            
            assignedAgent: {
                select: {
                    name: true,
                },
            },
        },
    });

    if (!ticket) {
        return {
            message: "The ticket could not be found.",
            success: false,
        };
    }

    /*
    * Verify that the selected user is an active Agent.
    * Never trust an agent ID submitted by the browser.
    */

    let selectedAgent: {
        id: string;
        name: string;
    } | null = null;

    if (assignedAgentId) {
        selectedAgent = await prisma.user.findFirst({
            where: {
                id: assignedAgentId,
                role: UserRole.AGENT,
                isActive: true,
            },
            select: {
                id: true,
                name: true,
            },
        });

        if (!selectedAgent) {
            return {
                errors: {
                    assignedAgentId: ["The selected agent is unavailable."],
                },
                message: "Please select another agent.",
                success: false,
            };
        }
    }

    /*
    * A ticket that has progressed beyond Open must have
    * an assigned support agent.
    */
    
    if (status !== "OPEN" && !assignedAgentId) {
        return {
            errors: {
                assignedAgentId: ["Assign an agent before changing this ticket from Open."],
            },
            message: "An assigned agent is required.",
            success: false,
        };
    }

    const now = new Date();

    let resolvedAt: Date | null = null;
    let closedAt: Date | null = null;

    if (status === "RESOLVED") {
        resolvedAt = ticket.resolvedAt ?? now;
    }

    if (status === "CLOSED") {
        resolvedAt = ticket.resolvedAt ?? now;
        closedAt = ticket.closedAt ?? now;
    }

    const activities: {
        type: TicketActivityType;
        description: string;
        oldValue: string | null;
        newValue: string | null;
        ticketId: string;
        performedById: string;
    }[] = [];

    if (ticket.status !== status) {
        activities.push({
            type: TicketActivityType.STATUS_CHANGED,
            description: `${currentUser.name} changed the status from ${formatEnumLabel(ticket.status,)} to ${formatEnumLabel(status)}.`,
            oldValue: ticket.status,
            newValue: status,
            ticketId: ticket.id,
            performedById: currentUser.id,
        });
    }

    if (ticket.priority !== priority) {
        activities.push({
            type: TicketActivityType.PRIORITY_CHANGED,
            description: `${currentUser.name} changed the priority from ${formatEnumLabel(ticket.priority,)} to ${formatEnumLabel(priority)}.`,
            oldValue: ticket.priority,
            newValue: priority,
            ticketId: ticket.id,
            performedById: currentUser.id,
        });
    }

    if (ticket.assignedAgentId !== assignedAgentId) {
        const previousAgentName = ticket.assignedAgent?.name ?? "Unassigned";

        const newAgentName = selectedAgent?.name ?? "Unassigned";

        activities.push({
            type: TicketActivityType.ASSIGNMENT_CHANGED,
            description: `${currentUser.name} changed the assigned agent from ${previousAgentName} to ${newAgentName}.`,
            oldValue: ticket.assignedAgentId,
            newValue: assignedAgentId,
            ticketId: ticket.id,
            performedById: currentUser.id,
        });
    }

    if (activities.length === 0) {
        return {
            message: "No ticket changes were detected.",
            success: true,
        };
    }

    try {
        await prisma.$transaction(async (transaction) => {
            await transaction.ticket.update({
                where: {
                    id: ticket.id,
                },
                data: {
                    status,
                    priority,
                    assignedAgentId,
                    resolvedAt,
                    closedAt,
                },
            });

            await transaction.ticketActivity.createMany({
                data: activities,
            });
        });
    } catch(error) {
        console.error("Failed to update ticket: ", error);

        return {
            message: "The ticket could not be updated. Please try again.",
            success: false,
        };
    }

    revalidatePath(`/tickets/${ticket.id}`);
    revalidatePath("/tickets");
    revalidatePath("/dashboard");

    return {
        message: "Ticket updated successfully.",
        success: true,
    };
}