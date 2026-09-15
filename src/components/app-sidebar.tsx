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
    href: "/knowledge-base",
    label: "Knowledge Base",
    allowedRoles: allRoles,
  },
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
    href: "/admin/knowledge-base",
    label: "Manage Knowledge Base",
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

  /*
   * Close the mobile sidebar whenever the route changes.
   */

  useEffect(() => {
    setIsSidebarOpen(false);
  }, [pathname]);

  /*
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
        className="fixed top-8 left-4 z-40 inline-flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-lg border border-gray-200 bg-white text-slate-900 shadow-sm transition hover:bg-gray-50 lg:hidden"
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
          className="fixed inset-0 z-40 bg-slate-950/40 backdrop-blur-[1px] lg:hidden"
        />
      )}

      <aside
        id="app-sidebar"
        className={`fixed inset-y-0 left-0 z-50 flex h-screen w-72 shrink-0 flex-col border-r border-gray-200 bg-white shadow-xl transition-transform duration-300 ease-in-out lg:sticky lg:top-0 lg:bottom-auto lg:z-auto lg:h-screen lg:w-64 lg:translate-x-0 lg:self-start lg:shadow-none 2xl:w-72 ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        } `}
      >
        <div className="flex items-start justify-between border-b border-gray-200 p-6 2xl:p-7">
          <div>
            <Link href="/dashboard" className="text-xl font-bold text-slate-950 2xl:text-2xl">
              HelpDesk
            </Link>

            <p className="mt-1 text-sm text-gray-500 2xl:text-base">Support Management</p>
          </div>

          {/* Close button inside mobile/tablet sidebar */}
          <button
            type="button"
            onClick={() => setIsSidebarOpen(false)}
            aria-label="Close navigation menu"
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-gray-500 transition hover:bg-gray-100 hover:text-gray-900 lg:hidden"
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

        <nav className="flex-1 space-y-1 overflow-y-auto p-4 2xl:space-y-2 2xl:p-5">
          {visibleNavigation.map((item) => {
            const isActive = isRouteActive(pathname, item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isActive ? "page" : undefined}
                className={`block rounded-lg px-4 py-3 text-sm font-medium transition 2xl:px-5 2xl:py-3.5 2xl:text-base ${
                  isActive
                    ? "bg-slate-900 text-white shadow-sm"
                    : "text-gray-700 hover:bg-gray-100 hover:text-gray-950"
                } `}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
