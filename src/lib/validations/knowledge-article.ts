import { z } from "zod";

export const knowledgeArticleSchema = z.object({
  title: z
    .string()
    .trim()
    .min(5, "Title must be at least 5 characters.")
    .max(160, "Title must be 160 characters or fewer."),

  summary: z.string().trim().max(300, "Summary must be 300 characters or fewer.").optional(),

  content: z
    .string()
    .trim()
    .min(20, "Content must be at least 20 characters.")
    .max(20000, "Content must be 20,000 characters or fewer."),

  categoryId: z.string().trim().optional(),

  isPublished: z.boolean(),
});

export type CreateKnowledgeArticleState = {
  success?: boolean;
  message?: string;

  errors?: {
    title?: string[];
    summary?: string[];
    content?: string[];
    categoryId?: string[];
    isPublished?: string[];
  };
};
