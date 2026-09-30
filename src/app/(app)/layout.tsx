import type { ReactNode } from "react";

import { signOut } from "@/auth";
import { HelpDeskAssistant } from "@/components/ai/help-desk-assistant";
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
        <header className="sticky top-0 z-30 flex min-h-16 items-center justify-between gap-3 border-b border-slate-200 bg-white/95 px-4 pl-18 shadow-sm backdrop-blur sm:px-6 sm:pl-18 lg:px-6 lg:pl-6 2xl:min-h-20 2xl:px-8">
          <div className="min-w-0">
            <p className="min-w-0 truncate font-semibold text-slate-900">
              <span className="text-lg sm:hidden">
                Help <span className="text-blue-600">Desk</span>
              </span>

              <span className="hidden text-sm sm:inline 2xl:text-base">
                Help Desk Management System
              </span>
            </p>

            <p className="mt-0.5 hidden text-xs text-slate-500 sm:block 2xl:text-sm">
              Support request and ticket management
            </p>
          </div>

          <div className="flex shrink-0 items-center gap-2 sm:gap-4 2xl:gap-5">
            <div className="hidden text-right sm:block">
              <p className="max-w-36 truncate text-sm font-medium text-slate-900 2xl:max-w-48 2xl:text-base">
                {user.name}
              </p>

              <div className="mt-1 flex items-center justify-end gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />

                <p className="text-xs text-slate-500 capitalize 2xl:text-sm">{roleLabel}</p>
              </div>
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
                className="rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-sm font-medium text-blue-700 transition hover:border-blue-300 hover:bg-blue-100 hover:text-blue-800 2xl:px-4 2xl:py-2.5 2xl:text-base"
              >
                Sign Out
              </button>
            </form>
          </div>
        </header>

        <main className="min-w-0 flex-1 bg-slate-50 p-4 pb-24 sm:p-6 sm:pb-24 lg:p-8 lg:pb-24 2xl:p-10 2xl:pb-24">
          {children}
        </main>
      </div>

      <HelpDeskAssistant />
    </div>
  );
}
