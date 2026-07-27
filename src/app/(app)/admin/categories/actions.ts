"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { UserRole } from "@/generated/prisma/enums";
import { requireRole } from "@/lib/auth-guards";
import { prisma } from "@/lib/prisma";
import {
  categorySchema,
  type CategoryActionState,
} from "@/lib/validations/category";

function isUniqueConstraintError(error: unknown) {
    return (
        typeof error === "object" &&
        error !== null &&
        "code" in error &&
        error.code === "P2002"
    );
}

export async function createCategory(
    _previousState: CategoryActionState,
    formData: FormData,
): Promise<CategoryActionState> {
    await requireRole([UserRole.ADMIN]);

    const validatedFields = categorySchema.safeParse({
        name: formData.get("name"),
        description: formData.get("description")
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

    const { name, description } = validatedFields.data;

    /*
    * PostgreSQL's normal unique comparison can distinguish
    * uppercase and lowercase. This additional check prevents
    * names such as "Technical Support" and "technical support".
    */

    const existingCategory = await prisma.category.findFirst({
        where: {
            name: {
                equals: name,
                mode: "insensitive",
            },
        },
        select: {
            id: true,
        },
    });

    if (existingCategory) {
        return {
            errors: {
                name: ["A category with this name already exists."],
            },
            message: "Enter a different category name.",
            success: false,
        };
    }

    try {
        await prisma.category.create({
            data: {
                name,
                description: description.length > 0 ? description : null,
            },
        });
    } catch (error) {
        if (isUniqueConstraintError(error)) {
            return {
                errors: {
                    name: ["A category with this name already exists."],
                },
                message: "Enter a different category name.",
                success: false,
            };
        }

        console.error("Failed to create category: ", error);

        return {
            message: "The category could not be created. Please try again.",
            success: false,
        };
    }

    revalidatePath("/admin/categories");
    revalidatePath("/tickets/new");

    return {
        message: "Category created successfully.",
        success: true,
    };
}

export async function updateCategory(
    categoryId: string,
    _previousState: CategoryActionState,
    formData: FormData,
): Promise<CategoryActionState> {
    await requireRole([UserRole.ADMIN]);

    const validatedFields = categorySchema.safeParse({
        name: formData.get("name"),
        description: formData.get("description"),
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

    const category = await prisma.category.findUnique({
        where: {
            id: categoryId,
        },
        select: {
            id: true,
        },
    });

    if (!category) {
        return {
            message: "The category could not be found.",
            success: false,
        };
    }

    const { name, description } = validatedFields.data;

    const duplicateCategory = await prisma.category.findFirst({
        where: {
            id: {
                not: category.id,
            },
            name: {
                equals: name,
                mode: "insensitive",
            },
        },
        select: {
            id: true,
        },
    });

    if (duplicateCategory) {
        return {
            errors: {
                name: ["A category with this name already exists."],
            },
            message: "Enter a different category name.",
            success: false,
        };
    }

    try {
        await prisma.category.update({
            where: {
                id: category.id,
            },
            data: {
                name,
                description: description.length > 0 ? description : null,
            },
        });
    } catch (error) {
        if (isUniqueConstraintError(error)) {
            return {
                errors: {
                    name: ["A category with this name already exists."],
                },
                message: "Enter a different category name.",
                success: false,
            };
        }

        console.error("Failed to update category: ", error);

        return {
            message: "The category could not be updated. Please try again.",
            success: false,
        }
    }

    revalidatePath("/admin/categories");
    revalidatePath("/tickets/new");
    revalidatePath("/tickets");

    return {
        message: "Category updated successfully.",
        success: true,
    };
}

export async function toggleCategoryStatus(
    categoryId: string,
    formData: FormData,
): Promise<void> {
    await requireRole([UserRole.ADMIN]);

    const nextIsActive = formData.get("nextIsActive") === "true";

    const category = await prisma.category.findUnique({
        where: {
            id: categoryId,
        },
        select: {
            id: true,
        },
    });

    if (!category) {
        return;
    }

    try {
        await prisma.category.update({
            where: {
                id: category.id,
            },
            data: {
                isActive: nextIsActive,
            },
        });
    } catch (error) {
        console.error("Failed to change category status: ", error);

        return;
    }

    revalidatePath("/admin/categories");
    revalidatePath("/tickets/new");
}