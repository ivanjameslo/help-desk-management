"use client";

import { useActionState, useEffect, useRef } from "react";

import { addTicketComment } from "@/app/(app)/tickets/[ticketId]/comment-actions";
import type { AddTicketCommentState } from "@/lib/validations/ticket-comment";

type TicketCommentFormProps = {
  ticketId: string;
  canCreateInternalNote: boolean;
};

const initialState: AddTicketCommentState = {};

export function TicketCommentForm({ ticketId, canCreateInternalNote }: TicketCommentFormProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const internalNoteRef = useRef<HTMLInputElement>(null);

  const addCommentWithTicketId = addTicketComment.bind(null, ticketId);

  const [state, formAction, pending] = useActionState(addCommentWithTicketId, initialState);

  useEffect(() => {
    if (state.success) {
      formRef.current?.reset();
    }
  }, [state.success]);

  useEffect(() => {
    function handleInsertReply(event: Event) {
      const customEvent = event as CustomEvent<{
        content?: string;
      }>;

      const content = customEvent.detail?.content?.trim().slice(0, 5000);

      if (!content || !textareaRef.current) {
        return;
      }

      /*
       * Populate the normal reply box.
       */
      textareaRef.current.value = content;

      /*
       * An AI-generated requester reply
       * must not accidentally be posted
       * as an internal note.
       */
      if (internalNoteRef.current) {
        internalNoteRef.current.checked = false;
      }

      /*
       * Bring the agent directly to
       * the populated reply form.
       */
      textareaRef.current.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });

      textareaRef.current.focus();
    }

    window.addEventListener("helpdesk:insert-reply", handleInsertReply);

    return () => {
      window.removeEventListener("helpdesk:insert-reply", handleInsertReply);
    };
  }, []);

  return (
    <form
      ref={formRef}
      action={formAction}
      className="min-w-0 rounded-xl border bg-white p-4 shadow-sm sm:p-6"
    >
      <h2 className="text-base font-semibold text-gray-900 sm:text-lg 2xl:text-xl">Add a Reply</h2>

      <div className="mt-4 sm:mt-5">
        <label htmlFor="content" className="block text-xs font-medium text-gray-700 sm:text-sm">
          Message
        </label>

        <textarea
          ref={textareaRef}
          id="content"
          name="content"
          required
          rows={5}
          maxLength={5000}
          placeholder={
            canCreateInternalNote ? "Write a reply or internal note..." : "Write your reply..."
          }
          aria-describedby="comment-error"
          className="mt-2 min-h-32 w-full min-w-0 resize-y rounded-lg border border-gray-300 px-3 py-2.5 text-xs text-black transition outline-none placeholder:text-gray-400 focus:border-slate-700 sm:min-h-36 sm:text-sm"
        />

        <div id="comment-error" aria-live="polite" className="mt-1">
          {state.errors?.content?.map((error) => (
            <p key={error} className="text-xs wrap-break-word text-red-600 sm:text-sm">
              {error}
            </p>
          ))}
        </div>
      </div>

      {canCreateInternalNote && (
        <label className="mt-4 flex cursor-pointer items-start gap-3 rounded-lg border border-amber-100 bg-amber-50 p-3 sm:p-4">
          <input
            ref={internalNoteRef}
            type="checkbox"
            name="isInternal"
            className="mt-0.5 size-4 shrink-0 rounded border-gray-300"
          />

          <span className="min-w-0">
            <span className="block text-xs font-medium text-amber-900 sm:text-sm">
              Internal note
            </span>

            <span className="mt-1 block text-[11px] leading-5 wrap-break-word text-amber-700 sm:text-xs">
              Only agents and administrators can see internal notes.
            </span>
          </span>
        </label>
      )}

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
          {pending ? "Posting..." : "Post Message"}
        </button>
      </div>
    </form>
  );
}
