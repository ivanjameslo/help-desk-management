import type { DefaultSession } from "next-auth";
import "next-auth/jwt";

import type { UserRole } from "@/generated/prisma/enums";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: UserRole;
      isDemo: boolean;
    } & DefaultSession["user"];
  }

  interface User {
    role: UserRole;
    isDemo: boolean;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: UserRole;
    isDemo: boolean;
  }
}

export {};
