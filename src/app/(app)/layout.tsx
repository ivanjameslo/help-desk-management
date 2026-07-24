import type { ReactNode } from "react";
// import { redirect } from "next/navigation";

import { signOut } from "@/auth";
import { AppSidebar } from "@/components/app-sidebar";
import { requireUser } from "@/lib/auth-guards";

type AppLayoutProps = {
  children: ReactNode;
};

export default async function AppLayout({ children }: AppLayoutProps) {
  const user = await requireUser();

  const roleLabel = user.role.toLowerCase().replaceAll("_", " ");

  return (
    <div className="flex min-h-screen bg-slate-50">
      <AppSidebar role={user.role} />

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex min-h-16 items-center justify-between border-b bg-white px-6">
          <p className="text-sm font-medium text-gray-900">
            Help Desk Management System
          </p>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-medium text-gray-900">
                {user.name}
              </p>

              <p className="text-xs text-gray-500">
                {roleLabel}
              </p>
            </div>

            <form
              action={async () => {
                "use server";

                await signOut({
                  redirectTo: "/login",
                });
              }}
            >
              <button
                type="submit"
                className="rounded-lg border px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100"
              >
                Sign Out
              </button>
            </form>
          </div>
        </header>
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}