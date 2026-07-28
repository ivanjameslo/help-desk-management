import { get } from "@vercel/blob";
import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { UserRole } from "@/generated/prisma/enums";
import { prisma } from "@/lib/prisma";

type AttachmentRouteProps = {
  params: Promise<{
    attachmentId: string;
  }>;
};

export async function GET(
  _request: Request,
  { params }: AttachmentRouteProps,
) {
  const session = await auth();

  if (!session?.user?.id) {
    return new NextResponse("Unauthorized", {
      status: 401,
    });
  }

  const user = await prisma.user.findUnique({
    where: {
      id: session.user.id,
    },
    select: {
      id: true,
      role: true,
      isActive: true,
    },
  });

  if (!user?.isActive) {
    return new NextResponse("Unauthorized", {
      status: 401,
    });
  }

  const { attachmentId } = await params;

  const attachment =
    await prisma.ticketAttachment.findUnique({
      where: {
        id: attachmentId,
      },
      select: {
        id: true,
        fileName: true,
        pathname: true,
        contentType: true,

        ticket: {
          select: {
            requesterId: true,
          },
        },
      },
    });

  if (!attachment) {
    console.error(
      "Attachment record not found:",
      attachmentId,
    );

    return new NextResponse("Not found", {
      status: 404,
    });
  }

  const isRequesterOwner =
    user.role === UserRole.REQUESTER &&
    attachment.ticket.requesterId === user.id;

  const canAccessAllTickets =
    user.role === UserRole.AGENT ||
    user.role === UserRole.ADMIN;

  if (!isRequesterOwner && !canAccessAllTickets) {
    console.error(
      "Attachment access denied:",
      attachment.id,
    );

    return new NextResponse("Not found", {
      status: 404,
    });
  }

  const oidcToken =
    process.env.VERCEL_OIDC_TOKEN;

  const storeId =
    process.env.BLOB_STORE_ID;

  if (!oidcToken || !storeId) {
    console.error(
      "Missing Blob credentials:",
      {
        hasOidcToken: Boolean(oidcToken),
        hasStoreId: Boolean(storeId),
      },
    );

    return new NextResponse(
      "File storage is not configured.",
      {
        status: 500,
      },
    );
  }

  try {
    const result = await get(attachment.pathname, {
      access: "private",
      oidcToken,
      storeId,
      useCache: false,
    });

    if (!result?.stream) {
        console.error(
            "Blob file could not be retrieved:",
            {
            attachmentId: attachment.id,
            pathname: attachment.pathname,
            hasResult: Boolean(result),
            hasStream: Boolean(result?.stream),
            },
        );

        return new NextResponse("Not found", {
            status: 404,
        });
    }

    return new NextResponse(result.stream, {
      status: 200,

      headers: {
        "Content-Type":
          result.blob.contentType ??
          attachment.contentType,

        "Content-Disposition":
          `attachment; filename*=UTF-8''${encodeURIComponent(
            attachment.fileName,
          )}`,

        "X-Content-Type-Options": "nosniff",
        "Cache-Control": "private, no-store",
      },
    });
  } catch (error) {
    console.error(
      "Failed to download attachment:",
      error,
    );

    return new NextResponse(
      "The attachment could not be downloaded.",
      {
        status: 500,
      },
    );
  }
}