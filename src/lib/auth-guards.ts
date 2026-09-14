import { redirect } from "next/navigation";

import { auth } from "@/auth";
import type { UserRole } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";

export async function requireUser() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: {
      id: session.user.id,
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isActive: true,
      isDemo: true,
    },
  });

  if (!user || !user.isActive) {
    redirect("/login");
  }

  return user;
}

export async function requireRole(allowedRoles: UserRole[]) {
  const user = await requireUser();

  if (!allowedRoles.includes(user.role)) {
    redirect("/dashboard");
  }

  return user;
}
