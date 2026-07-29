"use server";

import { revalidatePath } from "next/cache";

import { UserRole } from "@/generated/prisma/enums";
import { requireRole } from "@/lib/auth-guards";
import { resetDemoData } from "@/lib/demo-data";

export type ResetDemoDataState = {
  message?: string;
  success?: boolean;
};

export async function resetDemoDataAction(
  _previousState: ResetDemoDataState,
  formData: FormData,
): Promise<ResetDemoDataState> {
  const currentAdmin = await requireRole([
    UserRole.ADMIN,
  ]);

  if (currentAdmin.isDemo) {
    return {
      message:
        "Demo accounts cannot reset the shared demo data.",
      success: false,
    };
  }

  const confirmation = formData.get("confirmation");

  if (confirmation !== "RESET") {
    return {
      message: 'Type "RESET" exactly to confirm.',
      success: false,
    };
  }

  try {
    const result = await resetDemoData();

    revalidatePath("/dashboard");
    revalidatePath("/tickets");
    revalidatePath("/admin/users");

    const blobWarning = result.blobCleanupFailed
      ? " The ticket data was restored, but some stored files may require manual cleanup."
      : "";

    return {
      message:
        `Demo data reset successfully. ` +
        `${result.deletedTicketCount} demo tickets were removed and ` +
        `${result.createdTicketCount} sample tickets were created.` +
        blobWarning,
      success: true,
    };
  } catch (error) {
    console.error("Failed to reset demo data:", error);

    return {
      message:
        "The demo data could not be reset. Please try again.",
      success: false,
    };
  }
}