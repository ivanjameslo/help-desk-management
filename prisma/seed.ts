import "dotenv/config";

import { PrismaPg } from "@prisma/adapter-pg";
import { hash } from "bcryptjs";

import {
  PrismaClient,
  TicketPriority,
  UserRole,
} from "../src/generated/prisma/client";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is not defined.");
}

const adapter = new PrismaPg({
  connectionString,
});

const prisma = new PrismaClient({
  adapter,
});

async function main() {
    const passwordHash = await hash("Password123!", 12);

    const admin = await prisma.user.upsert({
        where: { 
            email: "admin@helpdesk.local",
        },
        update: {},
        create: {
            name: "System Administrator",
            email: "admin@helpdesk.local",
            passwordHash,
            role: UserRole.ADMIN,
        },
    });
    
    const agent = await prisma.user.upsert({
        where: {
            email: "agent@helpdesk.local",
        },
        update: {},
        create: {
            name: "Support Agent",
            email: "agent@helpdesk.local",
            passwordHash,
            role: UserRole.AGENT,
        },
    });

    const requester = await prisma.user.upsert({
        where: {
            email: "requester@helpdesk.local",
        },
        update: {},
        create: {
            name: "Sample Requester",
            email: "requester@helpdesk.local",
            passwordHash,
            role: UserRole.REQUESTER,
        },
    });
    
    const technicalCategory = await prisma.category.upsert({
        where: {
            name: "Technical Support",
        },
        update: {},
        create: {
            name: "Technical Support",
            description: "Hardware, software, and network-related concerns.",
        },
    });

    await prisma.category.upsert({
        where: {
            name: "Account Access",
        },
        update: {},
        create: {
            name: "Account Access",
            description: "Login, password, and user-account concerns.",
        },
    });

    await prisma.category.upsert({
        where: {
            name: "General Inquiry",
        },
        update: {},
        create :{
            name: "General Inquiry",
            description: "Questions that do not belong to another categeory.",
        },
    });

    await prisma.ticket.upsert({
        where: {
            ticketNumber: "HD-000001",
        },
        update: {},
        create: {
            ticketNumber: "HD-000001",
            subject: "Unable to connect to office Wi-Fi",
            description: "The laptop detects the office network but cannot establish a connection.",
            priority: TicketPriority.HIGH,
            requesterId: requester.id,
            assignedAgentId: agent.id,
            categoryId: technicalCategory.id,
        },
    });

    console.log("Database seeding completed successfully.");
    console.log(`Administrator created: ${admin.email}`);
}

main().catch((error: unknown) => {
    console.error("Database seeding failed:", error);
    process.exitCode = 1;
}).finally(async () => {
    await prisma.$disconnect();
});