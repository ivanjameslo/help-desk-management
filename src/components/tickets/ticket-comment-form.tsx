"use client";

import { useActionState, useEffect, useRef } from "react";

import { addTicketComment } from "@/app/(app)/tickets/[ticketId]/comment-actions";
import type { AddTicketCommentState } from "@/lib/validations/ticket-comment";

type TicketCommentFormProps = {
    ticketId: string;
    canCreateInternalNote: boolean;
};

const initialState: AddTicketCommentState = {};

export function TicketCommentForm({
    ticketId,
    canCreateInternalNote
}: TicketCommentFormProps) {
    const formRef = useRef<HTMLFormElement>(null);

    const addCommentWithTicketId = addTicketComment.bind(null, ticketId);

    const [state, formAction, pending] = useActionState(
        addCommentWithTicketId,
        initialState,
    );

    useEffect(() => {
        if (state.success) {
            formRef.current?.reset();
        }
    }, [state]);

    return (
        <form
            ref={formRef}
            action={formAction}
            className="rounded-xl border bg-white p-6 shadow-sm"
        >
            <h2 className="text-lg font-semibold text-gray-900">
                Add a Reply
            </h2>

            <div className="mt-5">
                <label
                    htmlFor="content"
                    className="block text-sm font-medium text-gray-700"
                >
                    Message
                </label>

                <textarea 
                    id="content"
                    name="content"
                    required
                    rows={5}
                    maxLength={5000}
                    placeholder={
                        canCreateInternalNote
                        ? "Write a reply or internal note..."
                        : "Write your reply..."
                    }
                    aria-describedby="comment-error"
                    className="mt-2 w-full resize-y rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none transition focus:border-slate-700"
                />

                <div
                    id="comment-error"
                    aria-live="polite"
                    className="mt-1"
                >
                    {state.errors?.content?.map((error) => (
                        <p
                            key={error}
                            className="text-sm text-red-600"
                        >
                            {error}
                        </p>
                    ))}
                </div>
            </div>

            {canCreateInternalNote && (
                <label className="mt-4 flex items-start gap-3 rounded-lg bg-amber-50 p-4">
                    <input
                        type="checkbox"
                        name="isInternal"
                        className="mt-0.5 size-4 rounded border-gray-300"
                    />
                    
                    <span>
                        <span className="block text-sm font-medium text-amber-900">
                            Internal note
                        </span>

                        <span className="mt-1 block text-xs leading-5 text-amber-700">
                            Only agents and administrators can see internal notes.
                        </span>
                    </span>
                </label>
            )}

            {state.message && (
                <p
                    aria-live="polite"
                    className={`mt-4 rounded-lg px-4 py-3 text-sm ${
                        state.success
                        ? "bg-green-50 text-green-700"
                        : "bg-red-50 text-red-700"
                    }`}
                >
                    {state.message}
                </p>
            )}

            <div className="mt-5 flex justify-end">
                <button
                    type="submit"
                    disabled={pending}
                    className="rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                    {pending ? "Posting..." : "Post Message"}
                </button>
            </div>
        </form>
    )
}