import Link from "next/link";
import { notFound } from "next/navigation";

import { TicketManagementForm } from "@/components/tickets/ticket-management-form";
import { UserRole, TicketStatus } from "@/generated/prisma/enums";
import { formatDateTime, formatEnumLabel } from "@/lib/formatters";
import { requireUser } from "@/lib/auth-guards";
import { prisma } from "@/lib/prisma";
import { TicketCommentForm } from "@/components/tickets/ticket-comment-form";

type TicketDetailsPageProps = {
    params: Promise<{
        ticketId: string;
    }>;
};

export default async function TicketDetailsPage({ params }: TicketDetailsPageProps) {
    const user = await requireUser();
    const { ticketId } = await params;

    const ticket = await prisma.ticket.findUnique({
        where: {
            id: ticketId,
        },
        include: {
            requester: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                },
            },
            assignedAgent: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                },
            },
            category: {
                select: {
                    id: true,
                    name: true,
                },
            },
            comments: {
                where: 
                    user.role === UserRole.REQUESTER 
                        ? { 
                            isInternal : false 
                          } 
                        : undefined,

                orderBy: {
                    createdAt: "asc",
                },

                select: {
                    id: true,
                    content: true,
                    isInternal: true,
                    createdAt: true,

                    author: {
                        select: {
                            id: true,
                            name: true,
                            role: true,
                        },
                    },
                },
            },
            activities: {
                where:
                    user.role === UserRole.REQUESTER
                        ? {
                            isInternal: false,
                          }
                        : undefined,

                orderBy: {
                    createdAt: "desc",
                },

                select: {
                    id: true,
                    type: true,
                    description: true,
                    oldValue: true,
                    newValue: true,
                    isInternal: true,
                    createdAt: true,

                    performedBy: {
                        select: {
                            id: true,
                            name: true,
                            role: true,
                        },
                    },
                },
            },
        },
    });

    if (!ticket) {
        notFound();
    }

    // This condition checks whether the logged-in requester owns the ticket
    const isRequesterOwner = 
        user.role === UserRole.REQUESTER && 
        ticket.requesterId === user.id;

    // This condition checks whether the user is allowed to view every ticket    
    const canViewAllTickets = 
        user.role === UserRole.AGENT ||
        user.role === UserRole.ADMIN;

    // Show the ticket only when the user owns it, or is an Agent/Admin.
    if (!isRequesterOwner && !canViewAllTickets) {
        notFound();
    }

    const canManageTicket = 
        user.role === UserRole.AGENT ||
        user.role === UserRole.ADMIN;

    const agents = canManageTicket
        ? await prisma.user.findMany({
            where: {
                role: UserRole.AGENT,
                isActive: true,
            },
            orderBy: {
                name: "asc",
            },
            select: {
                id: true,
                name: true,
                email: true,
            },
        })
    : [];

    return (
        <div className="mx-auto max-w-5xl">
            <Link
                href="/tickets"
                className="text-sm font-medium text-gray-600 transition hover:text-gray-900"
            >
                ← Back to Tickets
            </Link>

            <div className="mt-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                <div>
                    <p className="text-sm font-medium text-gray-500">
                        {ticket.ticketNumber}
                    </p>

                    <h1 className="mt-1 text-2xl font-bold text-gray-900">
                        {ticket.subject}
                    </h1>

                    <p className="mt-2 text-sm text-gray-500">
                        Created {formatDateTime(ticket.createdAt)}
                    </p>
                </div>

                <div className="flex flex-wrap gap-2">
                    <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700">
                        {formatEnumLabel(ticket.priority)}
                    </span>

                    <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700">
                        {formatEnumLabel(ticket.status)}
                    </span>
                </div>
            </div>

            <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
                <div className="space-y-6">
                    <section className="rounded-xl border bg-white p-6 shadow-sm">
                        <h2 className="text-lg font-semibold text-gray-900">
                            Description
                        </h2>

                        <p className="mt-4 whitespace-pre-wrap text-sm leading-7 text-gray-700">
                            {ticket.description}
                        </p>
                    </section> 

                    <section className="rounded-xl border bg-white p-6 shadow-sm">
                        <h2 className="text-lg font-semibold text-gray-900">
                            Conversation
                        </h2>

                        {ticket.comments.length === 0 ? (
                            <p className="mt-4 text-sm text-gray-500">
                            No replies have been added yet.
                            </p>
                        ) : (
                            <div className="mt-5 space-y-4">
                                {ticket.comments.map((comment) => (
                                    <article
                                        key={comment.id}
                                        className={`rounded-xl border p-4 ${
                                            comment.isInternal
                                            ? "border-amber-200 bg-amber-50"
                                            : "bg-gray-50"
                                        }`}
                                    >
                                        <div className="flex flex-wrap items-start justify-between gap-3">
                                            <div>
                                                <p className="text-sm font-semibold text-gray-900">
                                                    {comment.author.name}
                                                </p>

                                                <p className="mt-1 text-xs text-gray-500">
                                                    {formatEnumLabel(comment.author.role)}
                                                    {" · "}
                                                    {formatDateTime(comment.createdAt)}
                                                </p>
                                            </div>

                                            {comment.isInternal && (
                                            <span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-medium text-amber-800">
                                                Internal Note
                                            </span>
                                            )}
                                        </div>

                                        <p className="mt-4 whitespace-pre-wrap text-sm leading-6 text-gray-700">
                                            {comment.content}
                                        </p>
                                    </article>
                                ))}
                            </div>
                        )}
                    </section>

                   {/* Reply form or closed-ticket notice */}
                   {ticket.status === TicketStatus.CLOSED ? (
                        <div className="rounded-xl border bg-gray-50 p-6">
                            <p className="text-sm text-gray-600">
                                This ticket is closed. An agent must reopen it before another reply can be added.
                            </p>
                        </div>
                   ) : (
                    <TicketCommentForm 
                        ticketId={ticket.id}
                        canCreateInternalNote={canManageTicket}
                    />
                   )} 
                </div>

                <aside className="space-y-6">
                    <section className="rounded-xl border bg-white p-6 shadow-sm">
                        <h2 className="font-semibold text-gray-900">
                            Ticket Information
                        </h2>

                        <dl className="mt-5 space-y-4 text-sm">
                            <div>
                                <dt className="text-gray-500">Category</dt>
                                <dd className="mt-1 font-medium text-gray-900">
                                    {ticket.category.name}
                                </dd>
                            </div>

                            <div>
                                <dt className="text-gray-500">Requester</dt>
                                <dd className="mt-1 font-medium text-gray-900">
                                    {ticket.requester.name}
                                </dd>
                                <dd className="mt-1 text-xs text-gray-500">
                                    {ticket.requester.email}
                                </dd>
                            </div>

                            <div>
                                <dt className="text-gray-500">
                                    Assigned Agent
                                </dt>
                                <dd className="mt-1 font-medium text-gray-900">
                                    {ticket.assignedAgent?.name ?? "Unassigned"}
                                </dd>

                                {ticket.assignedAgent?.email && (
                                <dd className="mt-1 text-xs text-gray-500">
                                    {ticket.assignedAgent.email}
                                </dd>
                                )}
                            </div>

                            <div>
                                <dt className="text-gray-500">
                                    Last Updated
                                </dt>

                                <dd className="mt-1 font-medium text-gray-900">
                                    {formatDateTime(ticket.updatedAt)}
                                </dd>
                            </div>

                            {ticket.resolvedAt && (
                                <div>
                                    <dt className="text-gray-500">
                                        Resolved
                                    </dt>

                                    <dd className="mt-1 font-medium text-gray-900">
                                        {formatDateTime(ticket.resolvedAt)}
                                    </dd>
                                </div>
                            )}

                            {ticket.closedAt && (
                                <div>
                                    <dt className="text-gray-500">
                                        Closed
                                    </dt>

                                    <dd className="mt-1 font-medium text-gray-900">
                                        {formatDateTime(ticket.closedAt)}
                                    </dd>
                                </div>
                            )}
                        </dl>
                    </section>

                    <section className="rounded-xl border bg-white p-6 shadow-sm">
                        <h2 className="font-semibold text-gray-900">
                            Activity History
                        </h2>

                        {ticket.activities.length === 0 ? (
                            <p className="mt-4 text-sm text-gray-500">
                                No activity has been recorded yet.
                            </p>
                        ) : (
                            <ol className="mt-5 space-y-5">
                                {ticket.activities.map((activity) => (
                                    <li
                                        key={activity.id}
                                        className="relative border-l border-gray-200 pl-5"
                                    >
                                        <span className="absolute -left-1.5 top-1 size-3 rounded-full border-2 border-white bg-slate-400" />

                                        <p className="text-sm leading-6 text-gray-700">
                                            {activity.description}
                                        </p>

                                        <p className="mt-1 text-xs text-gray-500">
                                            {formatDateTime(activity.createdAt)}
                                        </p>
                                    </li>
                                ))}
                            </ol>
                        )}
                    </section>

                    {canManageTicket && (
                        <TicketManagementForm
                        ticket={{
                            id: ticket.id,
                            status: ticket.status,
                            priority: ticket.priority,
                            assignedAgentId:
                            ticket.assignedAgentId,
                        }}
                        agents={agents}
                        />
                    )}
                </aside> 
            </div>
        </div>
    )
}