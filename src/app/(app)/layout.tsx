import type { ReactNode } from "react";

import { AppSidebar } from "@/components/app-sidebar";

type AppLayoutProps = {
  children: ReactNode;
};

export default function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="flex min-h-screen bg-slate-50">
      <AppSidebar />

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-16 items-center justify-between border-b bg-white px-6">
          <div>
            <p className="text-sm font-medium text-gray-900">
              Help Desk Management System
            </p>
          </div>

          <div className="text-sm text-gray-600">
            Administrator
          </div>
        </header>

        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}