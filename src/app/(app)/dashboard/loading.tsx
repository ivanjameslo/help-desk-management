export default function DashboardLoading() {
  return (
    <div
      role="status"
      aria-label="Loading dashboard"
      className="mx-auto w-full max-w-7xl min-w-0 animate-pulse"
    >
      <span className="sr-only">Loading dashboard...</span>

      {/* Page heading */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="h-7 w-36 rounded bg-gray-200 sm:h-8 sm:w-40 2xl:h-9 2xl:w-48" />

          <div className="mt-2 h-4 w-full max-w-56 rounded bg-gray-200 sm:mt-3 sm:w-56 2xl:h-5 2xl:w-64" />
        </div>

        <div className="h-10 w-full rounded-lg bg-gray-200 sm:w-32 2xl:h-12 2xl:w-36" />
      </div>

      {/* Statistic cards */}
      <div className="mt-5 grid grid-cols-2 gap-3 sm:mt-6 sm:gap-4 xl:mt-8 xl:grid-cols-4 xl:gap-5 2xl:gap-6">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="min-w-0 rounded-xl border bg-white p-4 shadow-sm sm:p-5 2xl:p-6"
          >
            <div className="h-3.5 w-16 rounded bg-gray-200 sm:h-4 sm:w-24" />

            <div className="mt-4 h-7 w-12 rounded bg-gray-200 sm:h-9 sm:w-16" />

            <div className="mt-3 h-3.5 w-full rounded bg-gray-200 sm:mt-4 sm:h-4" />

            <div className="mt-2 h-3.5 w-3/4 rounded bg-gray-200 sm:hidden" />
          </div>
        ))}
      </div>

      {/* Dashboard breakdowns */}
      <div className="mt-4 grid gap-4 sm:mt-6 sm:gap-6 lg:grid-cols-2">
        {Array.from({ length: 2 }).map((_, index) => (
          <div key={index} className="min-w-0 rounded-xl border bg-white p-4 shadow-sm sm:p-6">
            <div className="h-5 w-32 rounded bg-gray-200 sm:h-6 sm:w-40" />

            <div className="mt-6 space-y-5 sm:mt-8 sm:space-y-7">
              {Array.from({ length: 4 }).map((_, itemIndex) => (
                <div key={itemIndex}>
                  <div className="flex items-center justify-between gap-4">
                    <div className="h-3.5 w-20 rounded bg-gray-200 sm:h-4 sm:w-24" />

                    <div className="h-3.5 w-14 shrink-0 rounded bg-gray-200 sm:h-4 sm:w-16" />
                  </div>

                  <div className="mt-2 h-1.5 w-full rounded-full bg-gray-200 sm:mt-3 sm:h-2" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Recent tickets and activity */}
      <div className="mt-4 grid gap-4 sm:mt-6 sm:gap-6 xl:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.8fr)]">
        <div className="min-h-80 min-w-0 rounded-xl border bg-white shadow-sm sm:min-h-96">
          <div className="border-b p-4 sm:px-6 sm:py-5">
            <div className="h-5 w-32 rounded bg-gray-200 sm:h-6 sm:w-40" />
          </div>

          <div className="divide-y">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="p-4 sm:px-6 sm:py-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="h-4 w-3/4 rounded bg-gray-200" />

                    <div className="mt-3 h-3.5 w-1/2 rounded bg-gray-200" />
                  </div>

                  <div className="h-6 w-16 shrink-0 rounded-full bg-gray-200" />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="min-h-80 min-w-0 rounded-xl border bg-white shadow-sm sm:min-h-96">
          <div className="border-b p-4 sm:px-6 sm:py-5">
            <div className="h-5 w-32 rounded bg-gray-200 sm:h-6 sm:w-40" />
          </div>

          <div className="divide-y">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="p-4 sm:px-6 sm:py-5">
                <div className="h-4 w-4/5 rounded bg-gray-200" />

                <div className="mt-3 h-3.5 w-1/2 rounded bg-gray-200" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
