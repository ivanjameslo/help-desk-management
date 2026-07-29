import { get } from "@vercel/blob";
import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { getTicketAccessWhere } from "@/lib/ticket-access";
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
      isDemo: true,
    },
  });

  if (!user?.isActive) {
    return new NextResponse("Unauthorized", {
      status: 401,
    });
  }

  const { attachmentId } = await params;

  const attachment =
    await prisma.ticketAttachment.findFirst({
      where: {
        id: attachmentId,

        ticket: {
          is: getTicketAccessWhere(user),
        },
      },
      select: {
        id: true,
        fileName: true,
        pathname: true,
        contentType: true,
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

  try {
    const result = await get(attachment.pathname, {
      access: "private",
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