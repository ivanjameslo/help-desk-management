import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { generateTicketDraft } from "@/lib/ai/ticket-assistant";
import { UserRole } from "@/generated/prisma/enums";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        {
          error: "You must be signed in to use the AI assistant.",
        },
        {
          status: 401,
        },
      );
    }

    if (session.user.role !== UserRole.REQUESTER) {
      return NextResponse.json(
        {
          error: "Only requester accounts can use the ticket intake assistant.",
        },
        {
          status: 403,
        },
      );
    }

    let body: unknown;

    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        {
          error: "Invalid request.",
        },
        {
          status: 400,
        },
      );
    }

    const requestBody = body as {
      issue?: unknown;
    };

    const issue = typeof requestBody.issue === "string" ? requestBody.issue.trim() : "";

    if (issue.length < 10) {
      return NextResponse.json(
        {
          error: "Please provide a little more detail about your issue.",
        },
        {
          status: 400,
        },
      );
    }

    if (issue.length > 3000) {
      return NextResponse.json(
        {
          error: "Please keep your issue description under 3,000 characters.",
        },
        {
          status: 400,
        },
      );
    }

    const categories = await prisma.category.findMany({
      where: {
        isActive: true,
      },

      orderBy: {
        name: "asc",
      },

      select: {
        id: true,
        name: true,
      },
    });

    if (categories.length === 0) {
      return NextResponse.json(
        {
          error: "No active ticket categories are available.",
        },
        {
          status: 400,
        },
      );
    }

    const draft = await generateTicketDraft({
      issue,
      categories,
    });

    return NextResponse.json({
      draft,
    });
  } catch (error) {
    console.error("AI ticket assistant error:", error);

    return NextResponse.json(
      {
        error:
          "The AI assistant is temporarily unavailable. You can still create your ticket manually.",
      },
      {
        status: 500,
      },
    );
  }
}
