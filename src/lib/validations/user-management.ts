import { z } from "zod";

export const USER_ROLE_VALUES = ["REQUESTER", "AGENT", "ADMIN"] as const;

export const createUserSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Name must contain at least 2 characters.")
    .max(100, "Name cannot exceed 100 characters."),

  email: z
    .string()
    .trim()
    .email("Enter a valid email address.")
    .max(255, "Email cannot exceed 255 characters."),

  password: z
    .string()
    .min(8, "Password must contain at least 8 characters.")
    .max(128, "Password cannot exceed 128 characters."),

  role: z.enum(USER_ROLE_VALUES),

  isDemo: z.preprocess((value) => value === "true", z.boolean()),
});

export const updateUserAccessSchema = z.object({
  role: z.enum(USER_ROLE_VALUES),

  isActive: z.enum(["true", "false"]).transform((value) => value === "true"),
});

export type UserRoleValue = (typeof USER_ROLE_VALUES)[number];

export type CreateUserActionState = {
  errors?: {
    name?: string[];
    email?: string[];
    password?: string[];
    role?: string[];
    isDemo?: string[];
  };
  message?: string;
  success?: boolean;
};

export type UpdateUserAccessState = {
  errors?: {
    role?: string[];
    isActive?: string[];
  };
  message?: string;
  success?: boolean;
};
