import type { Prisma } from "@/generated/prisma/client";
import { UserRole } from "@/generated/prisma/enums";

export type TicketAccessUser = {
    id: string;
    role: UserRole;
    isDemo: boolean;
};

/**
 * Returns the ticket filter that must be applied
 * for the current authenticated user.
 */

export function getTicketAccessWhere(
    user: TicketAccessUser,
): Prisma.TicketWhereInput {
    /*
    * Requesters can only access tickets that they created.
    */
    if (user.role === UserRole.REQUESTER) {
        return {
            requesterId: user.id,
        };
    }

    /*
    * Demo Agents and any future Demo Administrators
    * can access demo tickets only.
    */
    if (user.isDemo) {
        return {
            isDemo: true,
        };
    }

    /*
    * Private Agents and Administrators can access
    * all tickets.
    */
    return {};
}

/**
 * Returns the activity-history filter for the user.
 *
 * Requesters:
 * - only activities from their own tickets
 * - no internal activities
 *
 * Demo Agents:
 * - activities from demo tickets only
 *
 * Private Agents/Admins:
 * - all ticket activities
 */

export function getTicketActivityAccessWhere(
    user: TicketAccessUser,
): Prisma.TicketActivityWhereInput {
    const ticketWhere = getTicketAccessWhere(user);

    const hasTicketRestriction =
        Object.keys(ticketWhere).length > 0;

    return {
        ...(user.role === UserRole.REQUESTER
            ? {
                isInternal: false,
              }
            : {}),

        ...(hasTicketRestriction
            ? {
                ticket: {
                    is: ticketWhere,
                },
              }
            : {}),
    };
}

/**
 * Use this when a ticket has already been loaded
 * and you need a direct permission check.
 */

export function canAccessTicket(
    user: TicketAccessUser,
    ticket: {
        requesterId: string;
        isDemo: boolean;
    },
) {
    if (user.role === UserRole.REQUESTER) {
        return ticket.requesterId === user.id;
    }

    if (user.isDemo) {
        return ticket.isDemo;
    } 

    return true;
}