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
        <section className="rounded-xl border bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900">
                {title}
            </h2>

            {total === 0 ? (
                <p className="mt-5 text-sm text-gray-500">
                    No ticket data is available yet.
                </p>
            ) : (
                <div className="mt-6 space-y-5">
                    {items.map((item) => {
                        const percentage = Math.round((item.value / total) * 100);
                        return (
                            <div key={item.label}>
                                <div className="flex items-center justify-between gap-4">
                                    <p className="text-sm font-medium text-gray-700">
                                        {item.label}
                                    </p>

                                    <p className="text-sm text-gray-500">
                                        {item.value} ({percentage}%)
                                    </p>
                                </div>

                                <div className="mt-2 h-2 overflow-hidden rounded-full bg-gray-100">
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