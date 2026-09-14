"use server";

import { del, put } from "@vercel/blob";
import { revalidatePath } from "next/cache";

import { TicketStatus } from "@/generated/prisma/enums";
import { requireUser } from "@/lib/auth-guards";
import { getTicketAccessWhere } from "@/lib/ticket-access";
import { prisma } from "@/lib/prisma";
import {
  isAllowedAttachmentType,
  MAX_ATTACHMENT_SIZE,
  type TicketAttachmentState,
} from "@/lib/validations/ticket-attachment";

function sanitizeFileName(fileName: string) {
  const sanitizedName = fileName
    .normalize("NFKD")
    .replace(/[^a-zA-Z0-9._-]/g, "_")
    .replace(/_+/g, "_")
    .slice(0, 120);

  return sanitizedName || "attachment";
}

export async function uploadTicketAttachment(
  ticketId: string,
  _previousState: TicketAttachmentState,
  formData: FormData,
): Promise<TicketAttachmentState> {
  const user = await requireUser();

  if (user.isDemo) {
    return {
      message: "Attachment uploads are disabled for public demo accounts.",
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
      message: "This ticket is unavailable or you do not have permission to access it.",
      success: false,
    };
  }

  if (ticket.status === TicketStatus.CLOSED) {
    return {
      message: "Closed tickets cannot receive new attachments.",
      success: false,
    };
  }

  const submittedFile = formData.get("file");

  if (!(submittedFile instanceof File)) {
    return {
      errors: {
        file: ["Select a file to upload."],
      },
      message: "A file is required.",
      success: false,
    };
  }

  if (submittedFile.size === 0) {
    return {
      errors: {
        file: ["The selected file is empty."],
      },
      message: "Select another file.",
      success: false,
    };
  }

  if (submittedFile.size > MAX_ATTACHMENT_SIZE) {
    return {
      errors: {
        file: ["The file cannot exceed 4 MB."],
      },
      message: "Select a smaller file.",
      success: false,
    };
  }

  if (!isAllowedAttachmentType(submittedFile.type)) {
    return {
      errors: {
        file: ["Only JPEG, PNG, WebP, and PDF files are supported."],
      },
      message: "Select a supported file type.",
      success: false,
    };
  }

  const safeFileName = sanitizeFileName(submittedFile.name);

  let uploadedBlob: Awaited<ReturnType<typeof put>> | null = null;

  try {
    uploadedBlob = await put(`tickets/${ticket.id}/${safeFileName}`, submittedFile, {
      access: "private",
      addRandomSuffix: true,
      contentType: submittedFile.type,
    });

    await prisma.ticketAttachment.create({
      data: {
        fileName: submittedFile.name,
        pathname: uploadedBlob.pathname,
        url: uploadedBlob.url,
        contentType: submittedFile.type,
        size: submittedFile.size,
        ticketId: ticket.id,
        uploadedById: user.id,
      },
    });
  } catch (error) {
    /*
     * If the Blob upload succeeded but the database
     * record failed, delete the orphaned Blob.
     */
    if (uploadedBlob) {
      try {
        await del(uploadedBlob.url);
      } catch (cleanupError) {
        console.error("Failed to clean up uploaded blob:", cleanupError);
      }
    }

    console.error("Failed to upload ticket attachment:", error);

    return {
      message: "The attachment could not be uploaded. Please try again.",
      success: false,
    };
  }

  revalidatePath(`/tickets/${ticket.id}`);

  return {
    message: "Attachment uploaded successfully.",
    success: true,
  };
}
