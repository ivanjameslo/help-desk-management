import { CreateUserForm } from "@/components/users/create-user-form";
import { UserAccessCard } from "@/components/users/user-access-card";
import { UserRole } from "@/generated/prisma/enums";
import { requireRole } from "@/lib/auth-guards";
import { formatDate } from "@/lib/formatters";
import { prisma } from "@/lib/prisma";
import { ResetDemoDataForm } from "@/components/admin/reset-demo-data-form";

export default async function UsersPage() {
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
    <div className="mx-auto w-full max-w-7xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl 2xl:text-4xl">
          Manage Users
        </h1>

        <p className="mt-1 text-sm text-gray-600 sm:text-base 2xl:text-lg">
          Create accounts and manage system access.
        </p>
      </div>

      <div className="mt-5 grid items-start gap-5 sm:mt-6 sm:gap-6 lg:mt-8 lg:grid-cols-[320px_minmax(0,1fr)] lg:gap-6 xl:grid-cols-[340px_minmax(0,1fr)] xl:gap-8 2xl:grid-cols-[360px_minmax(0,1fr)]">
        <div className="min-w-0 space-y-4 sm:space-y-6 lg:sticky lg:top-24">
          <CreateUserForm />
          <ResetDemoDataForm />
        </div>

        <section className="min-w-0">
          <div className="mb-3 flex items-center justify-between gap-3 sm:mb-4 sm:gap-4">
            <h2 className="text-base font-semibold text-gray-900 sm:text-lg 2xl:text-xl">
              Existing Users
            </h2>

            <p className="shrink-0 text-xs text-gray-500 sm:text-sm">
              {users.length} total
            </p>
          </div>

          {users.length === 0 ? (
            <div className="rounded-xl border bg-white p-6 text-center shadow-sm sm:p-8">
              <p className="text-xs text-gray-500 sm:text-sm">
                No user accounts are available.
              </p>
            </div>
          ) : (
            <div className="space-y-3 sm:space-y-4">
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
                    assignedTicketCount: user._count.assignedTickets,
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