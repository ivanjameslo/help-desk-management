type DashboardStatCardProps = {
  label: string;
  value: number;
  description: string;
};

function getCardStyles(label: string) {
  switch (label) {
    case "Urgent":
      return {
        border: "border-red-100",
        background: "bg-red-50/50",
        label: "text-red-600",
        value: "text-red-700",
      };

    case "Unassigned":
    case "Waiting for You":
      return {
        border: "border-amber-100",
        background: "bg-amber-50/50",
        label: "text-amber-600",
        value: "text-amber-700",
      };

    case "Completed":
      return {
        border: "border-emerald-100",
        background: "bg-emerald-50/50",
        label: "text-emerald-600",
        value: "text-emerald-700",
      };

    case "Active Tickets":
      return {
        border: "border-blue-100",
        background: "bg-blue-50/50",
        label: "text-blue-600",
        value: "text-blue-700",
      };

    default:
      return {
        border: "border-slate-200",
        background: "bg-white",
        label: "text-slate-500",
        value: "text-slate-950",
      };
  }
}

export function DashboardStatCard({ label, value, description }: DashboardStatCardProps) {
  const styles = getCardStyles(label);

  return (
    <article
      className={`min-w-0 rounded-xl border p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md sm:p-5 2xl:p-6 ${styles.border} ${styles.background}`}
    >
      <p className={`text-xs font-medium sm:text-sm 2xl:text-base ${styles.label}`}>{label}</p>
      <p className={`mt-3 text-2xl font-bold sm:mt-4 sm:text-3xl 2xl:text-4xl ${styles.value}`}>
        {value}
      </p>
      <p className="mt-3 text-xs leading-5 text-slate-500 sm:mt-4 sm:text-sm sm:leading-6 2xl:text-base">
        {description}
      </p>
    </article>
  );
}
