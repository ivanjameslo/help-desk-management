"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { UserRole } from "@/generated/prisma/enums";

type AppSidebarProps = {
  role: UserRole;
};

type NavigationItem = {
  label: string;
  href: string;
  allowedRoles: UserRole[];
};

const allRoles: UserRole[] = ["REQUESTER", "AGENT", "ADMIN"];

const navigation: NavigationItem[] = [
  {
    label: "Dashboard",
    href: "/dashboard",
    allowedRoles: allRoles,
  },
  {
    label: "Tickets",
    href: "/tickets",
    allowedRoles: allRoles,
  },
  {
    label: "Create Ticket",
    href: "/tickets/new",
    allowedRoles: ["REQUESTER"],
  },
  {
    label: "Knowledge Base",
    href: "/knowledge-base",
    allowedRoles: allRoles,
  },
];

const adminNavigation: NavigationItem[] = [
  {
    label: "Manage Users",
    href: "/admin/users",
    allowedRoles: ["ADMIN"],
  },
  {
    label: "Categories",
    href: "/admin/categories",
    allowedRoles: ["ADMIN"],
  },
  {
    label: "Manage Knowledge Base",
    href: "/admin/knowledge-base",
    allowedRoles: ["ADMIN"],
  },
];

function isRouteActive(pathname: string, href: string) {
  if (href === "/tickets/new") {
    return pathname === "/tickets/new";
  }

  if (href === "/tickets") {
    return (
      pathname === "/tickets" || (pathname.startsWith("/tickets/") && pathname !== "/tickets/new")
    );
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AppSidebar({ role }: AppSidebarProps) {
  const pathname = usePathname();

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const visibleNavigation = navigation.filter((item) => item.allowedRoles.includes(role));

  const visibleAdminNavigation = adminNavigation.filter((item) => item.allowedRoles.includes(role));

  /**
   * Close the mobile sidebar whenever the route changes.
   */
  useEffect(() => {
    setIsSidebarOpen(false);
  }, [pathname]);

  /**
   * Prevent the page behind the sidebar from scrolling
   * while the mobile menu is open.
   */
  useEffect(() => {
    if (!isSidebarOpen) {
      return;
    }

    document.body.style.overflow = "hidden";

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsSidebarOpen(false);
      }
    };

    window.addEventListener("keydown", handleEscape);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleEscape);
    };
  }, [isSidebarOpen]);

  return (
    <>
      {/* Mobile and tablet menu button */}
      <button
        type="button"
        onClick={() => setIsSidebarOpen(true)}
        aria-label="Open navigation menu"
        aria-expanded={isSidebarOpen}
        aria-controls="app-sidebar"
        className="fixed top-8 left-4 z-40 inline-flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-lg border border-slate-700 bg-slate-900 text-white shadow-sm transition hover:bg-slate-800 lg:hidden"
      >
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className="h-5 w-5"
        >
          <path strokeLinecap="round" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* Dark background behind the mobile sidebar */}
      {isSidebarOpen && (
        <button
          type="button"
          aria-label="Close navigation menu"
          onClick={() => setIsSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-slate-950/50 backdrop-blur-[1px] lg:hidden"
        />
      )}

      <aside
        id="app-sidebar"
        className={`fixed inset-y-0 left-0 z-50 flex h-screen w-72 shrink-0 flex-col border-r border-slate-800 bg-slate-900 shadow-xl transition-transform duration-300 ease-in-out lg:sticky lg:top-0 lg:bottom-auto lg:z-auto lg:h-screen lg:w-64 lg:translate-x-0 lg:self-start lg:shadow-none 2xl:w-72 ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Brand */}
        <div className="flex items-start justify-between border-b border-slate-800 p-6 2xl:p-7">
          <div>
            <Link
              href="/dashboard"
              className="text-xl font-bold tracking-tight text-white 2xl:text-2xl"
            >
              Help
              <span className="text-blue-500">Desk</span>
            </Link>

            <p className="mt-1 text-sm text-slate-400 2xl:text-base">Support Management</p>
          </div>

          {/* Close button inside mobile/tablet sidebar */}
          <button
            type="button"
            onClick={() => setIsSidebarOpen(false)}
            aria-label="Close navigation menu"
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-800 hover:text-white lg:hidden"
          >
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="h-5 w-5"
            >
              <path strokeLinecap="round" d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto p-4 2xl:p-5">
          {/* Main navigation */}
          <div className="space-y-1 2xl:space-y-2">
            {visibleNavigation.map((item) => {
              const isActive = isRouteActive(pathname, item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={isActive ? "page" : undefined}
                  className={`block rounded-lg px-4 py-3 text-sm font-medium transition 2xl:px-5 2xl:py-3.5 2xl:text-base ${
                    isActive
                      ? "bg-blue-600 text-white shadow-sm"
                      : "text-slate-300 hover:bg-slate-800 hover:text-white"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>

          {/* Admin navigation */}
          {visibleAdminNavigation.length > 0 && (
            <div className="mt-7 border-t border-slate-800 pt-6">
              <p className="mb-3 px-4 text-[10px] font-semibold tracking-[0.16em] text-slate-500 uppercase 2xl:px-5 2xl:text-xs">
                Administration
              </p>

              <div className="space-y-1 2xl:space-y-2">
                {visibleAdminNavigation.map((item) => {
                  const isActive = isRouteActive(pathname, item.href);

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      aria-current={isActive ? "page" : undefined}
                      className={`block rounded-lg px-4 py-3 text-sm font-medium transition 2xl:px-5 2xl:py-3.5 2xl:text-base ${
                        isActive
                          ? "bg-blue-600 text-white shadow-sm"
                          : "text-slate-300 hover:bg-slate-800 hover:text-white"
                      }`}
                    >
                      {item.label}
                    </Link>
                  );
                })}
              </div>
            </div>
          )}
        </nav>

        {/* Bottom accent */}
        <div className="border-t border-slate-800 px-6 py-4 2xl:px-7">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-400" />

            <p className="text-xs text-slate-400 2xl:text-sm">Help Desk Online</p>
          </div>
        </div>
      </aside>
    </>
  );
}
