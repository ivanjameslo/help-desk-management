type DashboardStatCardProps = {
  label: string;
  value: number;
  description: string;
};

export function DashboardStatCard({ label, value, description }: DashboardStatCardProps) {
  return (
    <article className="min-w-0 rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:p-5 2xl:p-6">
      <p className="text-xs font-medium text-gray-500 sm:text-sm 2xl:text-base">{label}</p>

      <p className="mt-3 text-2xl font-bold text-slate-950 sm:mt-4 sm:text-3xl 2xl:text-4xl">
        {value}
      </p>

      <p className="mt-3 text-xs leading-5 text-gray-500 sm:mt-4 sm:text-sm sm:leading-6 2xl:text-base">
        {description}
      </p>
    </article>
  );
}
