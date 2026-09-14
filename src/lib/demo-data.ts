import { randomUUID } from "node:crypto";

import { del } from "@vercel/blob";

import {
  TicketActivityType,
  TicketPriority,
  TicketStatus,
  UserRole,
} from "@/generated/prisma/enums";
import { prisma } from "@/lib/prisma";

const DEMO_CATEGORY_NAMES = [
  "Account Access",
  "Hardware Support",
  "Network Support",
  "Software Support",
] as const;

function createDemoTicketNumber() {
  return `HD-${randomUUID().replaceAll("-", "").slice(0, 8).toUpperCase()}`;
}

export type ResetDemoDataResult = {
  deletedTicketCount: number;
  createdTicketCount: number;
  deletedBlobCount: number;
  blobCleanupFailed: boolean;
};

export async function resetDemoData(): Promise<ResetDemoDataResult> {
  const demoRequesterEmail =
    process.env.DEMO_REQUESTER_EMAIL?.trim().toLowerCase() ?? "demo.requester@helpdesk.local";

  const demoAgentEmail =
    process.env.DEMO_AGENT_EMAIL?.trim().toLowerCase() ?? "demo.agent@helpdesk.local";

  const [demoRequester, demoAgent, categories, attachments] = await Promise.all([
    prisma.user.findFirst({
      where: {
        email: {
          equals: demoRequesterEmail,
          mode: "insensitive",
        },
        role: UserRole.REQUESTER,
        isActive: true,
        isDemo: true,
      },
      select: {
        id: true,
        name: true,
      },
    }),

    prisma.user.findFirst({
      where: {
        email: {
          equals: demoAgentEmail,
          mode: "insensitive",
        },
        role: UserRole.AGENT,
        isActive: true,
        isDemo: true,
      },
      select: {
        id: true,
        name: true,
      },
    }),

    prisma.category.findMany({
      where: {
        name: {
          in: [...DEMO_CATEGORY_NAMES],
        },
      },
      select: {
        id: true,
        name: true,
      },
    }),

    prisma.ticketAttachment.findMany({
      where: {
        ticket: {
          OR: [
            {
              isDemo: true,
            },
            {
              requester: {
                isDemo: true,
              },
            },
          ],
        },
      },
      select: {
        url: true,
      },
    }),
  ]);

  if (!demoRequester) {
    throw new Error("The active Demo Requester account could not be found.");
  }

  if (!demoAgent) {
    throw new Error("The active Demo Agent account could not be found.");
  }

  const categoryByName = new Map(categories.map((category) => [category.name, category.id]));

  const missingCategories = DEMO_CATEGORY_NAMES.filter((name) => !categoryByName.has(name));

  if (missingCategories.length > 0) {
    throw new Error(`The following demo categories are missing: ${missingCategories.join(", ")}.`);
  }

  function getCategoryId(name: (typeof DEMO_CATEGORY_NAMES)[number]) {
    const categoryId = categoryByName.get(name);

    if (!categoryId) {
      throw new Error(`Category "${name}" could not be found.`);
    }

    return categoryId;
  }

  const now = Date.now();

  const minutesAgo = (minutes: number) => new Date(now - minutes * 60_000);

  const accessCreatedAt = minutesAgo(60);
  const accessAssignedAt = minutesAgo(55);
  const accessAgentReplyAt = minutesAgo(50);
  const accessRequesterReplyAt = minutesAgo(40);

  const networkCreatedAt = minutesAgo(120);
  const networkUpdatedAt = minutesAgo(110);

  const payrollCreatedAt = minutesAgo(180);
  const payrollUpdatedAt = minutesAgo(170);

  const hardwareCreatedAt = minutesAgo(240);
  const hardwareResolvedAt = minutesAgo(210);

  const [deletedTickets] = await prisma.$transaction([
    prisma.ticket.deleteMany({
      where: {
        OR: [
          {
            isDemo: true,
          },
          {
            requester: {
              isDemo: true,
            },
          },
        ],
      },
    }),

    prisma.ticket.create({
      data: {
        ticketNumber: createDemoTicketNumber(),
        subject: "Unable to access employee portal",
        description:
          "I am unable to sign in to the employee portal. After entering my credentials, the page returns an “Invalid session” message. I have already restarted my browser and cleared the cache, but the issue continues.",
        status: TicketStatus.IN_PROGRESS,
        priority: TicketPriority.HIGH,
        isDemo: true,
        requesterId: demoRequester.id,
        assignedAgentId: demoAgent.id,
        categoryId: getCategoryId("Account Access"),
        createdAt: accessCreatedAt,
        updatedAt: accessRequesterReplyAt,

        comments: {
          create: [
            {
              content:
                "Thanks for reporting this issue. I’m reviewing the account session and access settings now. Please confirm whether the same error appears in a private or incognito browser window.",
              authorId: demoAgent.id,
              createdAt: accessAgentReplyAt,
            },
            {
              content:
                "Yes, the same “Invalid session” message appears in an incognito window. I also tested another browser, but I still cannot access the portal.",
              authorId: demoRequester.id,
              createdAt: accessRequesterReplyAt,
            },
          ],
        },

        activities: {
          create: [
            {
              type: TicketActivityType.CREATED,
              description: `${demoRequester.name} created the ticket.`,
              performedById: demoRequester.id,
              createdAt: accessCreatedAt,
            },
            {
              type: TicketActivityType.ASSIGNMENT_CHANGED,
              description: `${demoAgent.name} changed the assigned agent from Unassigned to ${demoAgent.name}.`,
              oldValue: "Unassigned",
              newValue: demoAgent.name,
              performedById: demoAgent.id,
              createdAt: accessAssignedAt,
            },
            {
              type: TicketActivityType.STATUS_CHANGED,
              description: `${demoAgent.name} changed the status from Open to In Progress.`,
              oldValue: TicketStatus.OPEN,
              newValue: TicketStatus.IN_PROGRESS,
              performedById: demoAgent.id,
              createdAt: accessAssignedAt,
            },
          ],
        },
      },
    }),

    prisma.ticket.create({
      data: {
        ticketNumber: createDemoTicketNumber(),
        subject: "Laptop cannot detect office Wi-Fi",
        description:
          "My laptop no longer shows the office Wi-Fi network in the available networks list. Other employees can connect normally, and restarting the laptop did not resolve the issue.",
        status: TicketStatus.WAITING_FOR_USER,
        priority: TicketPriority.MEDIUM,
        isDemo: true,
        requesterId: demoRequester.id,
        assignedAgentId: demoAgent.id,
        categoryId: getCategoryId("Network Support"),
        createdAt: networkCreatedAt,
        updatedAt: networkUpdatedAt,

        comments: {
          create: {
            content:
              "Could you confirm whether Airplane Mode is disabled and whether other Wi-Fi networks appear in the available networks list? This will help determine whether the issue is with the laptop adapter or the office network.",
            authorId: demoAgent.id,
            createdAt: networkUpdatedAt,
          },
        },

        activities: {
          create: [
            {
              type: TicketActivityType.CREATED,
              description: `${demoRequester.name} created the ticket.`,
              performedById: demoRequester.id,
              createdAt: networkCreatedAt,
            },
            {
              type: TicketActivityType.ASSIGNMENT_CHANGED,
              description: `${demoAgent.name} changed the assigned agent from Unassigned to ${demoAgent.name}.`,
              oldValue: "Unassigned",
              newValue: demoAgent.name,
              performedById: demoAgent.id,
              createdAt: networkUpdatedAt,
            },
            {
              type: TicketActivityType.STATUS_CHANGED,
              description: `${demoAgent.name} changed the status from Open to Waiting For User.`,
              oldValue: TicketStatus.OPEN,
              newValue: TicketStatus.WAITING_FOR_USER,
              performedById: demoAgent.id,
              createdAt: networkUpdatedAt,
            },
          ],
        },
      },
    }),

    prisma.ticket.create({
      data: {
        ticketNumber: createDemoTicketNumber(),
        subject: "Payroll application crashes on startup",
        description:
          "The payroll application closes immediately after I sign in. I restarted the computer and tried opening the application again, but the same problem occurs. Payroll processing is scheduled today, so access is needed as soon as possible.",
        status: TicketStatus.ASSIGNED,
        priority: TicketPriority.URGENT,
        isDemo: true,
        requesterId: demoRequester.id,
        assignedAgentId: demoAgent.id,
        categoryId: getCategoryId("Software Support"),
        createdAt: payrollCreatedAt,
        updatedAt: payrollUpdatedAt,

        comments: {
          create: {
            content:
              "I’ve received this urgent request and assigned it for immediate investigation. I’m checking the application logs and recent payroll software updates now.",
            authorId: demoAgent.id,
            createdAt: payrollUpdatedAt,
          },
        },

        activities: {
          create: [
            {
              type: TicketActivityType.CREATED,
              description: `${demoRequester.name} created the ticket.`,
              performedById: demoRequester.id,
              createdAt: payrollCreatedAt,
            },
            {
              type: TicketActivityType.ASSIGNMENT_CHANGED,
              description: `${demoAgent.name} changed the assigned agent from Unassigned to ${demoAgent.name}.`,
              oldValue: "Unassigned",
              newValue: demoAgent.name,
              performedById: demoAgent.id,
              createdAt: payrollUpdatedAt,
            },
            {
              type: TicketActivityType.STATUS_CHANGED,
              description: `${demoAgent.name} changed the status from Open to Assigned.`,
              oldValue: TicketStatus.OPEN,
              newValue: TicketStatus.ASSIGNED,
              performedById: demoAgent.id,
              createdAt: payrollUpdatedAt,
            },
          ],
        },
      },
    }),

    prisma.ticket.create({
      data: {
        ticketNumber: createDemoTicketNumber(),
        subject: "External monitor flickers occasionally",
        description:
          "The external monitor connected to my workstation flickers for a few seconds several times each day. Reconnecting the HDMI cable temporarily fixes it, but the issue returns later.",
        status: TicketStatus.RESOLVED,
        priority: TicketPriority.LOW,
        isDemo: true,
        requesterId: demoRequester.id,
        assignedAgentId: demoAgent.id,
        categoryId: getCategoryId("Hardware Support"),
        createdAt: hardwareCreatedAt,
        updatedAt: hardwareResolvedAt,
        resolvedAt: hardwareResolvedAt,

        comments: {
          create: {
            content:
              "The issue was traced to a loose HDMI connection. The cable was reseated and tested, and the monitor is now displaying normally without flickering. Please reopen the request if the issue returns.",
            authorId: demoAgent.id,
            createdAt: hardwareResolvedAt,
          },
        },

        activities: {
          create: [
            {
              type: TicketActivityType.CREATED,
              description: `${demoRequester.name} created the ticket.`,
              performedById: demoRequester.id,
              createdAt: hardwareCreatedAt,
            },
            {
              type: TicketActivityType.ASSIGNMENT_CHANGED,
              description: `${demoAgent.name} changed the assigned agent from Unassigned to ${demoAgent.name}.`,
              oldValue: "Unassigned",
              newValue: demoAgent.name,
              performedById: demoAgent.id,
              createdAt: hardwareResolvedAt,
            },
            {
              type: TicketActivityType.STATUS_CHANGED,
              description: `${demoAgent.name} changed the status from Open to Resolved.`,
              oldValue: TicketStatus.OPEN,
              newValue: TicketStatus.RESOLVED,
              performedById: demoAgent.id,
              createdAt: hardwareResolvedAt,
            },
          ],
        },
      },
    }),
  ]);

  let blobCleanupFailed = false;

  if (attachments.length > 0) {
    try {
      await del(attachments.map((attachment) => attachment.url));
    } catch (error) {
      blobCleanupFailed = true;

      /*
       * The database reset has already succeeded. Logging this
       * prevents an orphaned Blob cleanup failure from restoring
       * or corrupting the reset ticket records.
       */
      console.error("Demo data was reset, but Blob cleanup failed:", error);
    }
  }

  return {
    deletedTicketCount: deletedTickets.count,
    createdTicketCount: 4,
    deletedBlobCount: blobCleanupFailed ? 0 : attachments.length,
    blobCleanupFailed,
  };
}
