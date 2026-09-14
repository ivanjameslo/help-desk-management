"use server";

import { AuthError } from "next-auth";
import { z } from "zod";

import { signIn } from "@/auth";
import { UserRole } from "@/generated/prisma/enums";
import { prisma } from "@/lib/prisma";

const loginSchema = z.object({
  email: z.string().trim().email("Enter a valid email address."),
  password: z.string().min(1, "Password is required."),
});

const demoLoginSchema = z.object({
  demoRole: z.enum(["requester", "agent"]),
});

export type LoginState = {
  error?: string;
};

async function signInWithCredentials(email: string, password: string): Promise<LoginState> {
  try {
    await signIn("credentials", {
      email,
      password,
      redirectTo: "/dashboard",
    });
  } catch (error) {
    if (error instanceof AuthError) {
      if (error.type === "CredentialsSignin") {
        return {
          error: "Invalid email or password.",
        };
      }
      return {
        error: "Unable to sign in. Please try again.",
      };
    }

    /*
     * Successful Auth.js redirects are implemented internally
     * by throwing a redirect response, so non-auth errors must
     * be rethrown.
     */
    throw error;
  }

  return {};
}

export async function login(_previousState: LoginState, formData: FormData): Promise<LoginState> {
  const validatedFields = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!validatedFields.success) {
    return {
      error: validatedFields.error.issues[0]?.message ?? "Enter valid login credentials.",
    };
  }

  return signInWithCredentials(validatedFields.data.email, validatedFields.data.password);
}

export async function demoLogin(
  _previousState: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const validatedFields = demoLoginSchema.safeParse({
    demoRole: formData.get("demoRole"),
  });

  if (!validatedFields.success) {
    return {
      error: "Select a valid demo account.",
    };
  }

  const demoAccount =
    validatedFields.data.demoRole === "agent"
      ? {
          email: process.env.DEMO_AGENT_EMAIL,
          password: process.env.DEMO_AGENT_PASSWORD,
          role: UserRole.AGENT,
        }
      : {
          email: process.env.DEMO_REQUESTER_EMAIL,
          password: process.env.DEMO_REQUESTER_PASSWORD,
          role: UserRole.REQUESTER,
        };

  if (!demoAccount.email || !demoAccount.password) {
    return {
      error: "Demo login is not configured.",
    };
  }

  const normalizedEmail = demoAccount.email.trim().toLowerCase();

  /*
   * Prevent a configuration mistake from exposing a normal,
   * inactive, or incorrectly assigned account through one-click login.
   */
  const validDemoUser = await prisma.user.findFirst({
    where: {
      email: {
        equals: normalizedEmail,
        mode: "insensitive",
      },
      role: demoAccount.role,
      isActive: true,
      isDemo: true,
    },
    select: {
      id: true,
    },
  });

  if (!validDemoUser) {
    return {
      error: "The selected demo account is unavailable.",
    };
  }

  return signInWithCredentials(normalizedEmail, demoAccount.password);
}
