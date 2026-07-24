"use server";

import { randomUUID } from "node:crypto";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

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
   * Temporary development user.
   *
   * Authentication will eventually replace this lookup
   * with the currently logged-in user's ID.
   */

    const requester = await prisma.user.findUnique({
        where: {
            email: "requester@helpdesk.local",
        },
        select: {
            id: true,
            isActive: true,
        }
    });

    if (!requester || !requester.isActive) {
        return {
            message: "The development requester account could not be found.",
        };
    }

    /*
    * Do not trust categoryId simply because it came from
    * a select element. Verify that the category exists and
    * is active.
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
        await prisma.ticket.create({
            data: {
                ticketNumber: `HD-${randomUUID()
                    .slice(0, 8)
                    .toUpperCase()
                }`,
                subject,
                description,
                priority,
                requesterId: requester.id,
                categoryId: category.id,
            },
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