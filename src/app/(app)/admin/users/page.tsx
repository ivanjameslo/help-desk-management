import { CreateUserForm } from "@/components/users/create-user-form";
import { UserAccessCard } from "@/components/users/user-access-card";
import { UserRole } from "@/generated/prisma/enums";
import { requireRole } from "@/lib/auth-guards";
import { formatDate } from "@/lib/formatters";
import { prisma } from "@/lib/prisma";

export default async function UserPage() {
  const currentAdmin = await requireRole([UserRole.ADMIN]);

  const users = await prisma.user.findMany({
    orderBy: [
      {
        isActive: "desc",
      },
      {
        name: "asc",
      },
    ],

    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isActive: true,
      isDemo: true,
      createdAt: true,

      _count: {
        select: {
          requestedTickets: true,
          assignedTickets: true,
        },
      },
    },
  });

  return (
    <div className="mx-auto max-w-7xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Manage Users
        </h1>

        <p className="mt-1 text-gray-600">
          Create accounts and manage system access.
        </p>
      </div>

      <div className="mt-8 grid items-start gap-8 lg:grid-cols-[360px_minmax(0,1fr)]">
        <div className="lg:sticky lg:top-6">
          <CreateUserForm />
        </div>

        <section>
          <div className="mb-4 flex items-center justify-between gap-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Existing Users
            </h2>

            <p className="text-sm text-gray-500">
              {users.length} total
            </p>
          </div>

          {users.length === 0 ? (
            <div className="rounded-xl border bg-white p-8 text-center shadow-sm">
              <p className="text-sm text-gray-500">
                No user accounts are available.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {users.map((user) => (
                <UserAccessCard 
                  key={user.id}
                  currentUserId={currentAdmin.id}
                  user={{
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    isActive: user.isActive,
                    isDemo: user.isDemo,
                    createdAtLabel: formatDate(user.createdAt),
                    requestedTicketCount: user._count.requestedTickets,
                    assignedTicketCount: user._count.assignedTickets
                  }}
                />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}