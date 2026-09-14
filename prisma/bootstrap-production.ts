import { PrismaPg } from "@prisma/adapter-pg";
import { hash } from "bcryptjs";

import { PrismaClient } from "../src/generated/prisma/client";
import { UserRole } from "../src/generated/prisma/enums";

function getRequiredEnvironmentVariable(name: string) {
  const value = process.env[name]?.trim();

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

async function main() {
  const databaseUrl = getRequiredEnvironmentVariable("DATABASE_URL");

  const adminName = getRequiredEnvironmentVariable("INITIAL_ADMIN_NAME");

  const adminEmail = getRequiredEnvironmentVariable("INITIAL_ADMIN_EMAIL").toLowerCase();

  const adminPassword = getRequiredEnvironmentVariable("INITIAL_ADMIN_PASSWORD");

  if (adminName.length < 2) {
    throw new Error("The administrator name must contain at least 2 characters.");
  }

  if (!adminEmail.includes("@") || adminEmail.length > 255) {
    throw new Error("Enter a valid administrator email address.");
  }

  if (adminPassword.length < 12) {
    throw new Error("The production administrator password must contain at least 12 characters.");
  }

  const adapter = new PrismaPg({
    connectionString: databaseUrl,
  });

  const prisma = new PrismaClient({
    adapter,
  });

  try {
    const passwordHash = await hash(adminPassword, 12);

    const administrator = await prisma.user.upsert({
      where: {
        email: adminEmail,
      },

      update: {
        name: adminName,
        passwordHash,
        role: UserRole.ADMIN,
        isActive: true,
      },

      create: {
        name: adminName,
        email: adminEmail,
        passwordHash,
        role: UserRole.ADMIN,
        isActive: true,
      },

      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
    });

    const initialCategories = [
      {
        name: "Hardware Support",
        description: "Issues involving computers, peripherals, and physical equipment.",
      },
      {
        name: "Software Support",
        description: "Application installation, errors, and software-related concerns.",
      },
      {
        name: "Network Support",
        description: "Internet, Wi-Fi, local network, and connectivity issues.",
      },
      {
        name: "Account Access",
        description: "Login, password, permission, and account-access requests.",
      },
      {
        name: "Other",
        description: "Help desk concerns that do not match another category.",
      },
    ];

    for (const category of initialCategories) {
      await prisma.category.upsert({
        where: {
          name: category.name,
        },

        update: {
          description: category.description,
          isActive: true,
        },

        create: {
          name: category.name,
          description: category.description,
          isActive: true,
        },
      });
    }

    console.log(`Production administrator ready: ${administrator.email}`);

    console.log(`${initialCategories.length} production categories are ready.`);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error("Production bootstrap failed:", error);

  process.exitCode = 1;
});
