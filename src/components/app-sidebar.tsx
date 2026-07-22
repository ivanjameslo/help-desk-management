"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navigation = [
  {
    label: "Dashboard",
    href: "/dashboard",
  },
  {
    label: "Tickets",
    href: "/tickets",
  },
  {
    label: "Create Ticket",
    href: "/tickets/new",
  },
  {
    label: "Manage Users",
    href: "/admin/users",
  },
  {
    label: "Categories",
    href: "/admin/categories",
  },
];

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <aside className="min-h-screen w-64 shrink-0 border-r bg-white">
      <div className="border-b p-6">
        <Link href="/dashboard" className="text-xl font-bold text-black">
          HelpDesk
        </Link>

        <p className="mt-1 text-sm text-gray-500">
          Support Management
        </p>
      </div>

      <nav className="space-y-1 p-4">
        {navigation.map((item) => {
          const isActive =
            item.href === "/dashboard"
              ? pathname === item.href
              : pathname.startsWith(item.href);

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