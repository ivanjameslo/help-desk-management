import { z } from "zod";

export const categorySchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Category name must contain at least 2 characters.")
    .max(80, "Category name cannot exceed 80 characters."),

  description: z.string().trim().max(500, "Description cannot exceed 500 characters."),
});

export type CategoryFormData = z.infer<typeof categorySchema>;

export type CategoryActionState = {
  errors?: Partial<Record<keyof CategoryFormData, string[]>>;
  message?: string;
  success?: boolean;
};
