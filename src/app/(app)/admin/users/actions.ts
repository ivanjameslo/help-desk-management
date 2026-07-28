"use server";

import { hash } from "bcryptjs";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { UserRole } from "@/generated/prisma/enums";
import { requireRole } from "@/lib/auth-guards";
import { prisma } from "@/lib/prisma";
import {
  createUserSchema,
  updateUserAccessSchema,
  type CreateUserActionState,
  type UpdateUserAccessState,
} from "@/lib/validations/user-management";
import { Update } from "next/dist/build/swc/types";

function isUniqueConstraintError(error: unknown) {
    return (
        typeof error === "object" &&
        error !== null &&
        "code" in error &&
        error.code === "P2002"
    );
}

export async function createUser(
    _previousState: CreateUserActionState,
    formData: FormData,
): Promise<CreateUserActionState> {
    await requireRole([UserRole.ADMIN]);

    const validatedFields = createUserSchema.safeParse({
        name: formData.get("name"),
        email: formData.get("email"),
        password: formData.get("password"),
        role: formData.get("role"),
    });

    if (!validatedFields.success) {
        return {
            errors: z.flattenError(
                validatedFields.error,
            ).fieldErrors,
            message: "Please correct the highlighted fields.",
            success: false,
        };
    }

    const { name, email, password, role } = validatedFields.data;

    const normalizedEmail = email.toLocaleLowerCase();

    const existingUser = await prisma.user.findFirst({
        where: {
            email: {
                equals: normalizedEmail,
                mode: "insensitive",
            },
        },
        select: {
            id: true,
        },
    });

    if (existingUser) {
        return {
            errors: {
                email: ["An account with this email address already exists."],
            },
            message: "Enter a different email address.",
            success: false,
        };
    }

    const passwordHash = await hash(password, 12);

    try {
        await prisma.user.create({
            data: {
                name,
                email: normalizedEmail,
                passwordHash,
                role,
            },
        });
    } catch (error) {
        if (isUniqueConstraintError(error)) {
            return {
                errors: {
                    email: ["An account with this email address already exists."],
                },
                message: "Enter a differnt email address.",
                success: false,
            };
        }

        console.error("Failed to create user: ", error);

        return {
            message: "The user account could not be created. Please try again.",
            success: false,
        };
    }

    revalidatePath("/admin/users");

    return {
        message: "User account created successfully.",
        success: true,
    };
}

export async function updateUserAccess(
    userId: string,
    _previousState: UpdateUserAccessState,
    formData: FormData,
): Promise<UpdateUserAccessState> {
    const currentAdmin = await requireRole([UserRole.ADMIN]);

    const validatedFields = updateUserAccessSchema.safeParse({
        role: formData.get("role"),
        isActive: formData.get("isActive"),
    });

    if (!validatedFields.success) {
        return {
            errors: z.flattenError(
                validatedFields.error,
            ).fieldErrors,
            message: "Please correct the highlighted fields.",
            success: false,
        };
    }

    const targetUser = await prisma.user.findUnique({
        where: {
            id: userId,
        },
        select: {
            id: true,
            name: true,
            role: true,
            isActive: true,
        },
    });

    if (!targetUser) {
        return {
            message: "The user account could not be found.",
            success: false,
        };
    }

    const {
        role: nextRole,
        isActive: nextIsActive,
    } = validatedFields.data;

    /*
    * Prevent the current administrator from disabling
    * or removing their own administrator access.
    */

    if (
        targetUser.id === currentAdmin.id && 
        (
            nextRole !== UserRole.ADMIN || !nextIsActive
        )
    ) {
        return {
           message: "You cannot deactivate or remove the administrator role from your own account.",
           success: false, 
        };
    }

    /*
    * Prevent changes that would leave the system without
    * any active administrator account.
    */

    const removeActiveAdministrator = 
        targetUser.role === UserRole.ADMIN &&
        targetUser.isActive &&
            (
                nextRole !== UserRole.ADMIN ||
                !nextIsActive
            );
    
    if (removeActiveAdministrator) {
        const otherActiveAdministratorCount = 
            await prisma.user.count({
                where: {
                    id: {
                        not: targetUser.id,
                    },
                    role: UserRole.ADMIN,
                    isActive: true,
                },
            });

        if (otherActiveAdministratorCount === 0) {
            return {
                message: "This account is the system's last active administrator and cannot be demoted or deactivated.",
                success: false,
            };
        }
    }

    if (
        targetUser.role === nextRole &&
        targetUser.isActive === nextIsActive
    ) {
        return {
            message: "No account changes were detected.",
            success: true,
        };
    }

    try {
        await prisma.user.update({
            where: {
                id: targetUser.id,
            },
            data: {
                role: nextRole,
                isActive: nextIsActive,
            },
        });
    } catch (error) {
        console.error("Failed to update user: ", error);

        return {
            message: "The user account could not be updated. Please try again.",
            success: false,
        };
    }

    revalidatePath("/admin/users");
    revalidatePath("/dashboard");
    revalidatePath("/tickets");
    
    return {
        message: "User access updated successfully.",
        success: true,
    }
}