type DashboardStatCardProps = {
    label: string;
    value: number;
    description: string;
};

export function DashboardStatCard({
    label,
    value,
    description,
}: DashboardStatCardProps) {
    return (
        <article className="rounded-xl border bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-gray-500">
                {label}
            </p>

            <p className="mt-3 text-3xl font-bold text-gray-900">
                {value}
            </p>

            <p className="mt-2 text-sm leading-5 text-gray-500">
                {description}
            </p>
        </article>
    );
}