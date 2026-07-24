"use server";

import { AuthError } from "next-auth";
import { z } from "zod";

import { signIn } from "@/auth";

const loginSchema = z.object({
    email: z.string().trim().email("Enter a valid email address."),
    password: z.string().min(1, "Password is required,"),
});

export type LoginState = {
    error?: string;
};

export async function login(
    _previousState: LoginState,
    formData: FormData,
): Promise<LoginState> {
    const validatedFields = loginSchema.safeParse({
        email: formData.get("email"),
        password: formData.get("password"),
    });

    if (!validatedFields.success) {
        return {
            error:
                validatedFields.error.issues[0]?.message ?? "Enter valid login credentials.",
        };
    }

    try {
        await signIn("credentials", {
            email: validatedFields.data.email,
            password: validatedFields.data.password,
            redirectTo: "/dashboard",
        })
    } catch (error) {
        if (error instanceof AuthError) {
            if (error.type === "CredentialsSignin") {
                return {
                    error: "Invalid email or password."
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