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
    }, [state.success]);

    return (
        <form
            ref={formRef}
            action={formAction}
            className="min-w-0 rounded-xl border bg-white p-4 shadow-sm sm:p-6"
        >
            <h2 className="text-base font-semibold text-gray-900 sm:text-lg 2xl:text-xl">
                Add a Reply
            </h2>

            <div className="mt-4 sm:mt-5">
                <label
                    htmlFor="content"
                    className="block text-xs font-medium text-gray-700 sm:text-sm"
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
                    className="mt-2 min-h-32 w-full min-w-0 resize-y rounded-lg border border-gray-300 px-3 py-2.5 text-xs text-black outline-none transition placeholder:text-gray-400 focus:border-slate-700 sm:min-h-36 sm:text-sm"
                />

                <div
                    id="comment-error"
                    aria-live="polite"
                    className="mt-1"
                >
                    {state.errors?.content?.map((error) => (
                        <p
                            key={error}
                            className="wrap-break-word text-xs text-red-600 sm:text-sm"
                        >
                            {error}
                        </p>
                    ))}
                </div>
            </div>

            {canCreateInternalNote && (
                <label className="mt-4 flex cursor-pointer items-start gap-3 rounded-lg border border-amber-100 bg-amber-50 p-3 sm:p-4">
                    <input
                        type="checkbox"
                        name="isInternal"
                        className="mt-0.5 size-4 shrink-0 rounded border-gray-300"
                    />
                    
                    <span className="min-w-0">
                        <span className="block text-xs font-medium text-amber-900 sm:text-sm">
                            Internal note
                        </span>

                        <span className="mt-1 block wrap-break-word text-[11px] leading-5 text-amber-700 sm:text-xs">
                            Only agents and administrators can see internal notes.
                        </span>
                    </span>
                </label>
            )}

            {state.message && (
                <p
                    aria-live="polite"
                    className={`mt-4 wrap-break-word rounded-lg px-3 py-2.5 text-xs sm:px-4 sm:py-3 sm:text-sm ${
                        state.success
                        ? "bg-green-50 text-green-700"
                        : "bg-red-50 text-red-700"
                    }`}
                >
                    {state.message}
                </p>
            )}

            <div className="mt-5 sm:flex sm:justify-end">
                <button
                    type="submit"
                    disabled={pending}
                    className="w-full rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto 2xl:px-6 2xl:py-3 2xl:text-base"
                >
                    {pending ? "Posting..." : "Post Message"}
                </button>
            </div>
        </form>
    )
}