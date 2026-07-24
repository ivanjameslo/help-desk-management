import { compare } from "bcryptjs"
import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { z } from "zod";

import { prisma } from "@/lib/prisma"

const credentialsSchema = z.object({
    email: z.string().trim().email(),
    password: z.string().min(1),
});

export const { handlers, auth, signIn, signOut } = NextAuth({
    // trustHost: true,

    pages: {
        signIn: "/login"
    },
    
    session: {
        strategy: "jwt",
    },

    providers: [
        Credentials({
            credentials: {
                email: {
                    label: "Email",
                    type: "email",
                    // placeholder: "requester@helpdesk.local"
                },

                password: {
                    label: "Password",
                    type: "password",
                },
            },

            async authorize(credentials) {
                const validatedCredentials = credentialsSchema.safeParse(credentials);

                if (!validatedCredentials.success) {
                    return null;
                }

                const { email, password } = validatedCredentials.data;

                const user = await prisma.user.findUnique({
                    where: {
                        email: email.toLowerCase()
                    },
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        passwordHash: true,
                        role: true,
                        isActive: true,
                    },
                });

                if (!user || !user.isActive) {
                    return null;
                }

                const passwordMatches = await compare(
                    password,
                    user.passwordHash
                );

                if (!passwordMatches) {
                    return null;
                }

                return {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                };
            },
        }),
    ],

    callbacks: {
        jwt({ token, user }) {
            if (user) {
                token.role = user.role;
            }

            return token;
        },

        session({ session, token }) {
            if (token.sub) {
                session.user.id = token.sub;
            }

            if (token.role) {
                session.user.role = token.role;
            }

            return session;
        },
    },
});