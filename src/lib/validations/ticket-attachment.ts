export const MAX_ATTACHMENT_SIZE = 4 * 1024 * 1024;

export const ALLOWED_ATTACHMENT_TYPES = [
    "image/jpeg",
    "image/png",
    "image/webp",
    "application/pdf",
] as const;

export type TicketAttachmentState = {
    errors?: {
        file?: string[];
    };
    message?: string;
    success?: boolean;
};

export function isAllowedAttachmentType(
    contentType: string,
) {
    return ALLOWED_ATTACHMENT_TYPES.includes(
        contentType as (typeof ALLOWED_ATTACHMENT_TYPES) [number],
    );
}