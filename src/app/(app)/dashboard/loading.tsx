export default function DashboardLoading() {
    return (
        <div className="mx-auto max-w-7xl animate-pulse">
            <div className="flex items-start justify-between gap-4">
                <div>
                    <div className="h-8 w-40 rounded bg-gray-200" />
                    <div className="mt-3 h-4 w-56 rounded bg-gray-200" />
                </div>
                
                <div className="h-10 w-32 rounded-lg bg-gray-200" />
            </div>
            <div className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
                {Array.from({ length: 4 }).map(
                    (_, index) => (
                        <div
                            key={index}
                            className="h-36 rounded-xl border bg-white p-6 shadow-sm"
                        >
                            <div className="h-4 w-24 rounded bg-gray-200" />
                            <div className="mt-5 h-9 w-16 rounded bg-gray-200" />
                            <div className="mt-4 h-4 w-full rounded bg-gray-200" />
                        </div>
                    ),
                )}
            </div>

            <div className="mt-6 grid gap-6 lg:grid-cols-2">
                {Array.from({ length: 2 }).map(
                    (_, index) => (
                        <div
                            key={index}
                            className="h-80 rounded-xl border bg-white p-6 shadow-sm"
                        >
                            <div className="h-6 w-40 rounded bg-gray-200" />

                            <div className="mt-8 space-y-7">
                                {Array.from({ length: 4 }).map(
                                    (_, itemIndex) => (
                                        <div key={itemIndex}>
                                            <div className="flex justify-between">
                                                <div className="h-4 w-24 rounded bg-gray-200" />
                                                <div className="h-4 w-16 rounded bg-gray-200" />
                                            </div>

                                            <div className="mt-3 h-2 w-full rounded bg-gray-200" />
                                        </div>
                                    ),
                                )}
                            </div>
                        </div>
                    ),
                )}
            </div>

            <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.8fr)]">
                <div className="h-96 rounded-xl border bg-white shadow-sm" />
                <div className="h-96 rounded-xl border bg-white shadow-sm" />
            </div>
        </div>
    )
}