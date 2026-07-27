import { z } from "zod";

export const addTicketCommentSchema = z.object({
    content: z
        .string()
        .trim()
        .min(1, "Enter a reply or note.")
        .max(5000, "Comment cannot exceed 5,000 characters."),

    isInternal: z.boolean(),
});

export type AddTicketCommentFormData = z.infer<typeof addTicketCommentSchema>;

export type AddTicketCommentState = {
    errors?: Partial<
        Record<keyof AddTicketCommentFormData, string[]>
    >;
    message?: string;
    success?: boolean;
};