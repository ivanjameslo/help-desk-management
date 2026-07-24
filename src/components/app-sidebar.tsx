"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { UserRole } from "@/generated/prisma/enums";

type AppSidebarProps = {
  role: UserRole;
};

type NavigationItem = {
  label: string,
  href: string,
  allowedRoles: UserRole[],
};

const allRoles: UserRole[] = [
  "REQUESTER",
  "AGENT",
  "ADMIN",
];

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
    allowedRoles: ["REQUESTER"]
  },
  {
    label: "Manage Users",
    href: "/admin/users",
    allowedRoles: ["ADMIN"]
  },
  {
    label: "Categories",
    href: "/admin/categories",
    allowedRoles: ["ADMIN"],
  },
];

function isRouteActive(pathname: string, href: string){
  if (href === "/tickets/new") {
    return pathname === "/tickets/new"
  }

  if (href === "/tickets") {
    return (
      pathname === "/tickets" ||
      (pathname.startsWith("/tickets/") && pathname !== "/tickets/new")
    );
  }

  return (
    pathname === href || pathname.startsWith(`${href}/`)
  );
}

export function AppSidebar({ role, }: AppSidebarProps) {
  const pathname = usePathname();

  const visibleNavigation = navigation.filter((item) => item.allowedRoles.includes(role),); 

  return (
    <aside className="min-h-screen w-64 shrink-0 border-r bg-white">
      <div className="border-b p-6">
        <Link 
          href="/dashboard" 
          className="text-xl font-bold text-black"
        >
          HelpDesk
        </Link>

        <p className="mt-1 text-sm text-gray-500">
          Support Management
        </p>
      </div>

      <nav className="space-y-1 p-4">
        {visibleNavigation.map((item) => {
          const isActive = isRouteActive(
            pathname,
            item.href
          )

          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive ? "page" : undefined}
              className={`block rounded-lg px-4 py-3 text-sm font-medium transition ${
                isActive
                  ? "bg-slate-900 text-white"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}