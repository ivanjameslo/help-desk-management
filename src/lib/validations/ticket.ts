import { z } from "zod";

export const createTicketSchema = z.object({
  subject: z
    .string()
    .trim()
    .min(5, "Subject must contain at least 5 characters.")
    .max(120, "Subject cannot exceed 120 characters."),

  description: z
    .string()
    .trim()
    .min(10, "Description must contain at least 10 characters.")
    .max(5000, "Description cannot exceed 5,000 characters."),

  categoryId: z.string().trim().min(1, "Please select a category."),

  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]),
});

export type CreateTicketFormData = z.infer<typeof createTicketSchema>;

export type CreateTicketState = {
  errors?: Partial<Record<keyof CreateTicketFormData, string[]>>;
  message?: string;
};
