"use client";

import { useActionState, useEffect, useRef } from "react";

import { uploadTicketAttachment } from "@/app/(app)/tickets/[ticketId]/attachment-actions";
import type { TicketAttachmentState } from "@/lib/validations/ticket-attachment";
import { upload } from "@vercel/blob/client";

type TicketAttachmentFormProps = {
    ticketId: string;
};

const initialState: TicketAttachmentState = {};

export function TicketAttachmentForm({ ticketId }: TicketAttachmentFormProps) {
    const formRef = useRef<HTMLFormElement>(null);

    const uploadWithTicketId = uploadTicketAttachment.bind(null, ticketId);

    const [state, formAction, pending] = useActionState(
        uploadWithTicketId,
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
            className="rounded-xl border bg-white p-6 shadow-sm"
        >
            <h2 className="text-lg font-semibold text-gray-900">
                Add Attachment
            </h2>

            <p className="mt-1 text-sm text-gray-500">
                Upload a screenshot or supporting document.
            </p>

            <div className="mt-5">
                <label
                    htmlFor="ticket-attachment"
                    className="block text-sm font-medium text-gray-700"
                >
                    File
                </label>

                <input 
                    id="ticket-attachment"
                    name="file"
                    type="file"
                    required
                    accept=".jpg,.jpeg,.png,.webp,.pdf"
                    aria-describedby="attachment-help attachment-error"
                    className="mt-2 text-black block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm"
                />

                <p
                    id="attachment-help"
                    className="mt-2 text-xs text-gray-500"
                >
                    JPEG, PNG, WebP, or PDF. Maximum size: 4 MB.
                </p>

                <div
                    id="attachment-error"
                    aria-live="polite"
                    className="mt-1"
                >
                    {state.errors?.file?.map((error) => (
                        <p
                            key={error}
                            className="text-sm text-red-600"
                        >
                            {error}
                        </p>
                    ))}
                </div>
            </div>

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
                    {pending ? "Uploading..." : "Upload File"}
                </button>
            </div>
        </form>
    )
}