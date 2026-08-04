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
        <header className="sticky top-0 z-30 flex min-h-16 items-center justify-between gap-3 border-b border-gray-200 bg-white px-4 pl-18 sm:px-6 sm:pl-18 lg:px-6 lg:pl-6 2xl:min-h-20 2xl:px-8">
          <div className="min-w-0">
            <p className="min-w-0 truncate font-semibold text-gray-900">
              <span className="text-lg sm:hidden">
                Help Desk
              </span>

              <span className="hidden text-sm sm:inline 2xl:text-base">
                Help Desk Management System
              </span>
            </p>

            <p className="mt-0.5 hidden text-xs text-gray-500 sm:block 2xl:text-sm">
              Support request and ticket management
            </p>
          </div>

          <div className="flex shrink-0 items-center gap-2 sm:gap-4 2xl:gap-5">
            <div className="hidden text-right sm:block">
              <p className="max-w-36 truncate text-sm font-medium text-gray-900 2xl:max-w-48 2xl:text-base">
                {user.name}
              </p>

              <p className="mt-0.5 text-xs capitalize text-gray-500 2xl:text-sm">
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
                className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100 hover:text-gray-950 2xl:px-4 2xl:py-2.5 2xl:text-base"
              >
                Sign Out
              </button>
            </form>
          </div>
        </header>

        <main className="min-w-0 flex-1 p-4 sm:p-6 lg:p-8 2xl:p-10">
          {children}
        </main>
      </div>
    </div>
  );
}