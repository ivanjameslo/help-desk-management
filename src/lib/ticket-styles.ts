import { TicketPriority, TicketStatus } from "@/generated/prisma/enums";

export function getTicketStatusClassName(status: TicketStatus) {
  switch (status) {
    case TicketStatus.OPEN:
      return "bg-blue-100 text-blue-700";

    case TicketStatus.ASSIGNED:
      return "bg-indigo-100 text-indigo-700";

    case TicketStatus.IN_PROGRESS:
      return "bg-amber-100 text-amber-700";

    case TicketStatus.WAITING_FOR_USER:
      return "bg-orange-100 text-orange-700";

    case TicketStatus.RESOLVED:
      return "bg-emerald-100 text-emerald-700";

    case TicketStatus.CLOSED:
      return "bg-slate-200 text-slate-700";

    default:
      return "bg-slate-100 text-slate-700";
  }
}

export function getTicketPriorityClassName(priority: TicketPriority) {
  switch (priority) {
    case TicketPriority.LOW:
      return "bg-slate-100 text-slate-600";

    case TicketPriority.MEDIUM:
      return "bg-amber-50 text-amber-700";

    case TicketPriority.HIGH:
      return "bg-orange-50 text-orange-700";

    case TicketPriority.URGENT:
      return "bg-red-50 text-red-700";

    default:
      return "bg-slate-100 text-slate-600";
  }
}

export function getTicketPriorityDotClassName(priority: TicketPriority) {
  switch (priority) {
    case TicketPriority.LOW:
      return "bg-slate-400";

    case TicketPriority.MEDIUM:
      return "bg-amber-500";

    case TicketPriority.HIGH:
      return "bg-orange-500";

    case TicketPriority.URGENT:
      return "bg-red-500";

    default:
      return "bg-slate-400";
  }
}
