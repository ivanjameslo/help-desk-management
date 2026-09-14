"use client";

import { useActionState, useEffect, useRef } from "react";

import { uploadTicketAttachment } from "@/app/(app)/tickets/[ticketId]/attachment-actions";
import type { TicketAttachmentState } from "@/lib/validations/ticket-attachment";

type TicketAttachmentFormProps = {
  ticketId: string;
};

const initialState: TicketAttachmentState = {};

export function TicketAttachmentForm({ ticketId }: TicketAttachmentFormProps) {
  const formRef = useRef<HTMLFormElement>(null);

  const uploadWithTicketId = uploadTicketAttachment.bind(null, ticketId);

  const [state, formAction, pending] = useActionState(uploadWithTicketId, initialState);

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
        Add Attachment
      </h2>

      <p className="mt-1 text-xs leading-5 text-gray-500 sm:text-sm">
        Upload a screenshot or supporting document.
      </p>

      <div className="mt-4 sm:mt-5">
        <label
          htmlFor="ticket-attachment"
          className="block text-xs font-medium text-gray-700 sm:text-sm"
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
          className="mt-2 block w-full min-w-0 rounded-lg border border-gray-300 bg-white px-2 py-2 text-xs text-gray-700 file:mr-3 file:rounded-md file:border-0 file:bg-slate-100 file:px-3 file:py-2 file:text-xs file:font-medium file:text-slate-700 hover:file:bg-slate-200 sm:px-3 sm:text-sm sm:file:mr-4 sm:file:text-sm"
        />

        <p
          id="attachment-help"
          className="mt-2 text-[11px] leading-5 wrap-break-word text-gray-500 sm:text-xs"
        >
          JPEG, PNG, WebP, or PDF. Maximum size: 4 MB.
        </p>

        <div id="attachment-error" aria-live="polite" className="mt-1">
          {state.errors?.file?.map((error) => (
            <p key={error} className="text-xs wrap-break-word text-red-600 sm:text-sm">
              {error}
            </p>
          ))}
        </div>
      </div>

      {state.message && (
        <p
          aria-live="polite"
          className={`mt-4 rounded-lg px-3 py-2.5 text-xs wrap-break-word sm:px-4 sm:py-3 sm:text-sm ${
            state.success ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
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
          {pending ? "Uploading..." : "Upload File"}
        </button>
      </div>
    </form>
  );
}
