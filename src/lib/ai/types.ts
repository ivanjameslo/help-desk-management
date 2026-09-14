export const AI_TICKET_PRIORITIES = ["LOW", "MEDIUM", "HIGH", "URGENT"] as const;

export type AiTicketPriority = (typeof AI_TICKET_PRIORITIES)[number];

export type AiCategoryOption = {
  id: string;
  name: string;
};

export type AiTicketDraft = {
  subject: string;
  categoryId: string;
  priority: AiTicketPriority;
  description: string;
  suggestionNote: string;
};
