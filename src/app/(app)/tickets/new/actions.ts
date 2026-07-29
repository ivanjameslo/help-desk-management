"use server";

import { randomUUID } from "node:crypto";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { TicketActivityType, UserRole } from "@/generated/prisma/enums";
import { requireRole } from "@/lib/auth-guards";


import { prisma } from "@/lib/prisma";
import { createTicketSchema, type CreateTicketState } from "@/lib/validations/ticket";

export async function createTicket(
    _previousState: CreateTicketState,
    formData: FormData,
): Promise<CreateTicketState> {
    const validatedFields = createTicketSchema.safeParse({
        subject: formData.get("subject"),
        description: formData.get("description"),
        categoryId: formData.get("categoryId"),
        priority: formData.get("priority"),
    });

    if (!validatedFields.success) {
        return {
            errors: z.flattenError(
                validatedFields.error,
            ).fieldErrors,
            message: "Please correct the highlighted fields.",
        };
    }

    const {
        subject,
        description,
        categoryId,
        priority,
    } = validatedFields.data;

    /*
    * Confirms that the current user is logged in,
    * active, and has the REQUESTER role.
    *
    * The returned requester is the current database user.
    */

    const requester = await requireRole([
        UserRole.REQUESTER
    ]);

    /*
    * Verify that the submitted category exists and remains active.
    */

    const category = await prisma.category.findFirst({
        where: {
            id: categoryId,
            isActive: true,
        },
        select: {
            id: true,
        },
    });

    if (!category) {
        return {
            errors: {
                categoryId: ["The selected category is no longer available."],    
            },
            message: "Please select another category.",
        };
    }

    try {
        await prisma.$transaction(async (transaction) => {
            const ticket = await transaction.ticket.create({
                data: {
                    ticketNumber: `HD-${randomUUID()
                        .slice(0, 8)
                        .toUpperCase()}`,
                    subject,
                    description,
                    priority,
                    requesterId: requester.id,
                    categoryId: category.id,
                    isDemo: requester.isDemo, // Tickets created by demo requesters are automatically marked as demo tickets.
                },
            });

            await transaction.ticketActivity.create({
                data: {
                    type: TicketActivityType.CREATED,
                    description: `${requester.name} created the ticket.`,
                    newValue: ticket.status,
                    ticketId: ticket.id,
                    performedById: requester.id
                },
            });
        });
    } catch (error) {
        console.error("Failed to create ticket: ", error);

        return {
            message: "The ticket could not be created. Please try again.",
        };
    }

    revalidatePath("/tickets");
    revalidatePath("/dashboard");

    redirect("/tickets");
}