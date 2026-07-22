import Link from "next/link";

const routes = [
  { label: "Login", href: "/login" },
  { label: "Dashboard", href: "/dashboard" },
  { label: "Tickets", href: "/tickets" },
  { label: "Create Ticket", href: "/tickets/new" },
  { label: "Manage Users", href: "/admin/users" },
  { label: "Manage Categories", href: "/admin/categories" },
];

export default function HomePage() {
  return (
    <main className="min-h-screen p-8">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-3xl font-bold">
          Help Desk Management System
        </h1>

        <p className="mt-2 text-gray-600">
          Initial project routes
        </p>

        <nav className="mt-8 grid gap-4 sm:grid-cols-2">
          {routes.map((route) => (
            <Link
              key={route.href}
              href={route.href}
              className="rounded-lg border p-4 transition hover:bg-gray-50"
            >
              {route.label}
            </Link>
          ))}
        </nav>
      </div>
    </main>
  );
}