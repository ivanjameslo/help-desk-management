"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { TicketStatus, UserRole } from "@/generated/prisma/enums";
import { requireUser } from "@/lib/auth-guards";
import { getTicketAccessWhere } from "@/lib/ticket-access";
import { prisma } from "@/lib/prisma";
import {
  addTicketCommentSchema,
  type AddTicketCommentState,
} from "@/lib/validations/ticket-comment";

export async function addTicketComment(
    ticketId: string,
    _previousState: AddTicketCommentState,
    formData: FormData,
): Promise<AddTicketCommentState> {
    
    const user = await requireUser();

    const validatedFields = addTicketCommentSchema.safeParse({
        content: formData.get("content"),
        isInternal: formData.get("isInternal") === "on",
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

    const ticket = await prisma.ticket.findFirst({
        where: {
            ...getTicketAccessWhere(user),
            id: ticketId,
        },
        select: {
            id: true,
            status: true,
        },
    });

    if (!ticket) {
        return {
            message: "The ticket could not be found.",
            success: false,
        };
    }

    if (ticket.status === TicketStatus.CLOSED) {
        return {
            message: "Closed tickets cannot receive new replies. An agent must reopen the ticket first.",
            success: false,
        };
    }

    const canCreateInternalNote = 
        user.role === UserRole.AGENT ||
        user.role === UserRole.ADMIN;

    if (validatedFields.data.isInternal && !canCreateInternalNote) {
        return {
            message: "Your account cannot create internal notes.",
            success: false,
        };
    }

    try {
        await prisma.ticketComment.create({
            data: {
                content: validatedFields.data.content,
                isInternal: canCreateInternalNote
                    ? validatedFields.data.isInternal
                    : false,
                ticketId: ticket.id,
                authorId: user.id,
            },
        });
    } catch(error) { 
        console.error("Failed to add ticket comment: ", error);

        return {
            message: "Your reply could not be added. Please try again.",
            success: false,
        };
    }
    
    revalidatePath(`/tickets/${ticket.id}`);
    
    return {
        message: validatedFields.data.isInternal
            ? "Internal note added successfully."
            : "Reply added successfully.",
        success: true,
    };
}