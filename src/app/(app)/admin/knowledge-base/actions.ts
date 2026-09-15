"use server";

import { revalidatePath } from "next/cache";

import { UserRole } from "@/generated/prisma/enums";
import { requireRole } from "@/lib/auth-guards";
import { prisma } from "@/lib/prisma";
import {
  knowledgeArticleSchema,
  type CreateKnowledgeArticleState,
} from "@/lib/validations/knowledge-article";

function createSlug(title: string) {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function getUniqueSlug(title: string) {
  const baseSlug = createSlug(title) || "article";

  let slug = baseSlug;
  let suffix = 2;

  while (
    await prisma.knowledgeArticle.findUnique({
      where: {
        slug,
      },

      select: {
        id: true,
      },
    })
  ) {
    slug = `${baseSlug}-${suffix}`;
    suffix += 1;
  }

  return slug;
}

export async function createKnowledgeArticle(
  _previousState: CreateKnowledgeArticleState,
  formData: FormData,
): Promise<CreateKnowledgeArticleState> {
  try {
    const admin = await requireRole([
      UserRole.ADMIN,
    ]);

    const parsed =
      knowledgeArticleSchema.safeParse({
        title: formData.get("title"),
        summary:
          formData.get("summary") || undefined,
        content: formData.get("content"),
        categoryId:
          formData.get("categoryId") || undefined,
        isPublished:
          formData.get("isPublished") === "on",
      });

    if (!parsed.success) {
      return {
        success: false,

        errors:
          parsed.error.flatten()
            .fieldErrors,

        message:
          "Please correct the highlighted fields.",
      };
    }

    const {
      title,
      summary,
      content,
      categoryId,
      isPublished,
    } = parsed.data;

    /*
     * Make sure an optional category really
     * exists before saving it.
     */
    if (categoryId) {
      const category =
        await prisma.category.findUnique({
          where: {
            id: categoryId,
          },

          select: {
            id: true,
          },
        });

      if (!category) {
        return {
          success: false,

          errors: {
            categoryId: [
              "The selected category does not exist.",
            ],
          },

          message:
            "Please select a valid category.",
        };
      }
    }

    const slug =
      await getUniqueSlug(title);

    await prisma.knowledgeArticle.create({
      data: {
        title,
        slug,

        summary:
          summary?.trim() || null,

        content,

        categoryId:
          categoryId || null,

        isPublished,

        createdById: admin.id,
      },
    });

    revalidatePath(
      "/admin/knowledge-base",
    );

    revalidatePath("/knowledge-base");

    return {
      success: true,

      message: isPublished
        ? "Article published successfully."
        : "Article saved as a draft.",
    };
  } catch (error) {
    console.error(
      "Create knowledge article error:",
      error,
    );

    return {
      success: false,

      message:
        "Unable to create the article. Please try again.",
    };
  }
}

export async function updateKnowledgeArticle(
  articleId: string,
  _previousState: CreateKnowledgeArticleState,
  formData: FormData,
): Promise<CreateKnowledgeArticleState> {
  try {
    await requireRole([UserRole.ADMIN]);

    const parsed =
      knowledgeArticleSchema.safeParse({
        title: formData.get("title"),
        summary:
          formData.get("summary") || undefined,
        content: formData.get("content"),
        categoryId:
          formData.get("categoryId") || undefined,
        isPublished:
          formData.get("isPublished") === "on",
      });

    if (!parsed.success) {
      return {
        success: false,

        errors:
          parsed.error.flatten().fieldErrors,

        message:
          "Please correct the highlighted fields.",
      };
    }

    const existingArticle =
      await prisma.knowledgeArticle.findUnique({
        where: {
          id: articleId,
        },

        select: {
          id: true,
          slug: true,
        },
      });

    if (!existingArticle) {
      return {
        success: false,
        message:
          "The article could not be found.",
      };
    }

    const {
      title,
      summary,
      content,
      categoryId,
      isPublished,
    } = parsed.data;

    if (categoryId) {
      const category =
        await prisma.category.findUnique({
          where: {
            id: categoryId,
          },

          select: {
            id: true,
          },
        });

      if (!category) {
        return {
          success: false,

          errors: {
            categoryId: [
              "The selected category does not exist.",
            ],
          },

          message:
            "Please select a valid category.",
        };
      }
    }

    await prisma.knowledgeArticle.update({
      where: {
        id: articleId,
      },

      data: {
        title,

        summary:
          summary?.trim() || null,

        content,

        categoryId:
          categoryId || null,

        isPublished,
      },
    });

    revalidatePath(
      "/admin/knowledge-base",
    );

    revalidatePath(
      `/admin/knowledge-base/${articleId}/edit`,
    );

    revalidatePath("/knowledge-base");

    revalidatePath(
      `/knowledge-base/${existingArticle.slug}`,
    );

    return {
      success: true,
      message:
        "Article updated successfully.",
    };
  } catch (error) {
    console.error(
      "Update knowledge article error:",
      error,
    );

    return {
      success: false,

      message:
        "Unable to update the article. Please try again.",
    };
  }
}

export async function deleteKnowledgeArticle(
  articleId: string,
) {
  try {
    await requireRole([UserRole.ADMIN]);

    const article =
      await prisma.knowledgeArticle.findUnique({
        where: {
          id: articleId,
        },

        select: {
          id: true,
          slug: true,
        },
      });

    if (!article) {
      return {
        success: false,
        message: "Article not found.",
      };
    }

    await prisma.knowledgeArticle.delete({
      where: {
        id: articleId,
      },
    });

    revalidatePath(
      "/admin/knowledge-base",
    );

    revalidatePath("/knowledge-base");

    revalidatePath(
      `/knowledge-base/${article.slug}`,
    );

    return {
      success: true,
      message:
        "Article deleted successfully.",
    };
  } catch (error) {
    console.error(
      "Delete knowledge article error:",
      error,
    );

    return {
      success: false,
      message:
        "Unable to delete the article. Please try again.",
    };
  }
}