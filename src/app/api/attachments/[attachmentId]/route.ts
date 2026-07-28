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
        /*
        * Return 404 instead of confirming that the private
        * attachment exists.
        */
        return new NextResponse("Not found", {
            status: 404,
        });
    }

    const result = await get(attachment.pathname, {
        access: "private",
    });

    if (
        !result ||
        result.statusCode !== 200 ||
        !result.stream
    ) {
        return new NextResponse("Not found", {
            status: 404,
        });
    }

    return new NextResponse(result.stream, {
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
}