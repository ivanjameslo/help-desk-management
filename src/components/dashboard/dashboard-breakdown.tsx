type DashboardBreakdownProps = {
    title: string;

    items: {
        label: string;
        value: number;
    }[];

    total: number;
};

export function DashboardBreakdown({
    title,
    items,
    total,
}: DashboardBreakdownProps) {
    return (
        <section className="min-w-0 rounded-xl border bg-white p-4 shadow-sm sm:p-6">
            <h2 className="text-base font-semibold text-gray-900 sm:text-lg 2xl:text-xl">
                {title}
            </h2>

            {total === 0 ? (
                <p className="mt-4 text-xs text-gray-500 sm:mt-5 sm:text-sm">
                    No ticket data is available yet.
                </p>
            ) : (
                <div className="mt-5 space-y-4 sm:mt-6 sm:space-y-5">
                    {items.map((item) => {
                        const percentage = Math.round((item.value / total) * 100);
                        return (
                            <div key={item.label}>
                                <div className="flex items-center justify-between gap-3 sm:gap-4">
                                    <p className="min-w-0 wrap-break-word text-xs font-medium text-gray-700 sm:text-sm 2xl:text-base">
                                        {item.label}
                                    </p>

                                    <p className="shrink-0 text-xs text-gray-500 sm:text-sm 2xl:text-base">
                                        {item.value} ({percentage}%)
                                    </p>
                                </div>

                                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-gray-100 sm:h-2">
                                    <div
                                        className="h-full rounded-full bg-slate-700 transition-all"
                                        style={{
                                            width: `${percentage}%`,
                                        }}
                                    />
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </section>
    );
}