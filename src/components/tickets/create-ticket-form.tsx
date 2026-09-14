"use client";

import { useActionState, useState } from "react";

import { createTicket } from "@/app/(app)/tickets/new/actions";
import type { CreateTicketState } from "@/lib/validations/ticket";

type CategoryOption = {
  id: string;
  name: string;
};

type CreateTicketFormProps = {
  categories: CategoryOption[];
};

type AiDraft = {
  subject: string;
  categoryId: string;
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  description: string;
  suggestionNote: string;
};

const initialState: CreateTicketState = {};

const selectClassName =
  "w-full appearance-none rounded-lg border border-gray-300 bg-white py-2.5 pl-3 pr-12 text-xs text-black outline-none transition focus:border-slate-600 sm:text-sm";

function SelectChevron() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className="pointer-events-none absolute top-1/2 right-4 h-4 w-4 -translate-y-1/2 text-gray-700"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="m6 9 6 6 6-6" />
    </svg>
  );
}

export function CreateTicketForm({ categories }: CreateTicketFormProps) {
  const [state, formAction, pending] = useActionState(createTicket, initialState);

  const [subject, setSubject] = useState("");

  const [categoryId, setCategoryId] = useState("");

  const [priority, setPriority] = useState("MEDIUM");

  const [description, setDescription] = useState("");

  const [aiIssue, setAiIssue] = useState("");

  const [aiNote, setAiNote] = useState("");

  const [aiError, setAiError] = useState("");

  const [aiPending, setAiPending] = useState(false);

  const [aiDraftGenerated, setAiDraftGenerated] = useState(false);

  async function generateTicketDraft() {
    const trimmedIssue = aiIssue.trim();

    setAiError("");
    setAiNote("");
    setAiDraftGenerated(false);

    if (trimmedIssue.length < 10) {
      setAiError("Please describe your issue in a little more detail.");

      return;
    }

    setAiPending(true);

    try {
      const response = await fetch("/api/ai/ticket-assistant", {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          issue: trimmedIssue,
        }),
      });

      const data = (await response.json()) as {
        draft?: AiDraft;
        error?: string;
      };

      if (!response.ok || !data.draft) {
        throw new Error(data.error ?? "Unable to generate a ticket draft.");
      }

      setSubject(data.draft.subject);

      setCategoryId(data.draft.categoryId);

      setPriority(data.draft.priority);

      setDescription(data.draft.description);

      setAiNote(data.draft.suggestionNote);

      setAiDraftGenerated(true);
    } catch (error) {
      setAiError(error instanceof Error ? error.message : "Unable to generate a ticket draft.");
    } finally {
      setAiPending(false);
    }
  }

  return (
    <form
      action={formAction}
      className="grid min-w-0 gap-4 rounded-xl border bg-white p-4 shadow-sm sm:gap-5 sm:p-6 md:grid-cols-2"
    >
      {/* AI Ticket Assistant */}
      <section className="min-w-0 rounded-xl border border-violet-200 bg-violet-50 p-4 sm:p-5 md:col-span-2">
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="text-sm font-semibold text-violet-950 sm:text-base">
            AI Ticket Assistant
          </h2>

          <span className="rounded-full bg-violet-100 px-2.5 py-1 text-[10px] font-medium text-violet-700 sm:text-xs">
            AI
          </span>
        </div>

        <p className="mt-2 text-xs leading-5 text-violet-700 sm:text-sm sm:leading-6">
          Describe your problem naturally. The assistant will prepare the ticket fields below for
          you to review and edit before submitting.
        </p>

        <div className="mt-4">
          <label
            htmlFor="ai-issue"
            className="block text-xs font-medium text-violet-950 sm:text-sm"
          >
            What can we help you with?
          </label>

          <textarea
            id="ai-issue"
            value={aiIssue}
            onChange={(event) => setAiIssue(event.target.value)}
            rows={4}
            maxLength={3000}
            placeholder="Example: My laptop keeps disconnecting from the office Wi-Fi every few minutes. I already restarted it but the problem continues."
            className="mt-2 min-h-28 w-full min-w-0 resize-y rounded-lg border border-violet-200 bg-white px-3 py-2.5 text-xs text-black transition outline-none placeholder:text-gray-400 focus:border-violet-500 sm:text-sm"
          />

          <div className="mt-1 flex justify-end">
            <p className="text-[10px] text-violet-600 sm:text-xs">{aiIssue.length}/3000</p>
          </div>
        </div>

        {aiError && (
          <p
            aria-live="polite"
            className="mt-3 rounded-lg bg-red-50 px-3 py-2.5 text-xs wrap-break-word text-red-700 sm:text-sm"
          >
            {aiError}
          </p>
        )}

        {aiDraftGenerated && aiNote && (
          <div className="mt-3 rounded-lg border border-violet-200 bg-white px-3 py-3 sm:px-4">
            <div className="flex items-center gap-2">
              <p className="text-xs font-semibold text-violet-900 sm:text-sm">AI Suggestion</p>

              <span className="rounded-full bg-green-50 px-2 py-0.5 text-[10px] font-medium text-green-700 sm:text-xs">
                Draft ready
              </span>
            </div>

            <p className="mt-2 text-xs leading-5 wrap-break-word text-gray-600 sm:text-sm sm:leading-6">
              {aiNote}
            </p>

            <p className="mt-2 text-[11px] leading-5 text-gray-500 sm:text-xs">
              Review and edit the generated ticket fields below before submitting.
            </p>
          </div>
        )}

        <div className="mt-4 flex justify-end">
          <button
            type="button"
            disabled={aiPending || aiIssue.trim().length < 10}
            onClick={generateTicketDraft}
            className="w-full rounded-lg bg-violet-700 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-violet-600 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
          >
            {aiPending
              ? "Preparing draft..."
              : aiDraftGenerated
                ? "Regenerate Draft"
                : "Generate Ticket Draft"}
          </button>
        </div>
      </section>

      {/* Subject */}
      <div className="min-w-0 md:col-span-2">
        <label htmlFor="subject" className="block text-xs font-medium text-gray-900 sm:text-sm">
          Subject
        </label>

        <input
          id="subject"
          name="subject"
          type="text"
          required
          minLength={5}
          maxLength={120}
          value={subject}
          onChange={(event) => setSubject(event.target.value)}
          placeholder="Briefly describe your concern"
          aria-describedby="subject-error"
          className="mt-2 w-full min-w-0 rounded-lg border border-gray-300 px-3 py-2.5 text-xs text-black transition outline-none placeholder:text-gray-400 focus:border-slate-600 sm:text-sm"
        />

        <div id="subject-error" aria-live="polite" className="mt-1">
          {state.errors?.subject?.map((error) => (
            <p key={error} className="text-xs wrap-break-word text-red-600 sm:text-sm">
              {error}
            </p>
          ))}
        </div>
      </div>

      {/* Category */}
      <div className="min-w-0">
        <label htmlFor="categoryId" className="block text-xs font-medium text-gray-900 sm:text-sm">
          Category
        </label>

        <div className="relative mt-2">
          <select
            id="categoryId"
            name="categoryId"
            required
            value={categoryId}
            onChange={(event) => setCategoryId(event.target.value)}
            aria-describedby="category-error"
            className={selectClassName}
          >
            <option value="" disabled>
              Select a category
            </option>

            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>

          <SelectChevron />
        </div>

        <div id="category-error" aria-live="polite" className="mt-1">
          {state.errors?.categoryId?.map((error) => (
            <p key={error} className="text-xs wrap-break-word text-red-600 sm:text-sm">
              {error}
            </p>
          ))}
        </div>
      </div>

      {/* Priority */}
      <div className="min-w-0">
        <label htmlFor="priority" className="block text-xs font-medium text-gray-900 sm:text-sm">
          Priority
        </label>

        <div className="relative mt-2">
          <select
            id="priority"
            name="priority"
            required
            value={priority}
            onChange={(event) => setPriority(event.target.value)}
            aria-describedby="priority-error"
            className={selectClassName}
          >
            <option value="LOW">Low</option>

            <option value="MEDIUM">Medium</option>

            <option value="HIGH">High</option>

            <option value="URGENT">Urgent</option>
          </select>

          <SelectChevron />
        </div>

        <div id="priority-error" aria-live="polite" className="mt-1">
          {state.errors?.priority?.map((error) => (
            <p key={error} className="text-xs wrap-break-word text-red-600 sm:text-sm">
              {error}
            </p>
          ))}
        </div>
      </div>

      {/* Description */}
      <div className="min-w-0 md:col-span-2">
        <label htmlFor="description" className="block text-xs font-medium text-gray-900 sm:text-sm">
          Description
        </label>

        <textarea
          id="description"
          name="description"
          required
          minLength={10}
          maxLength={5000}
          rows={7}
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          placeholder="Provide the relevant details, steps, and error messages."
          aria-describedby="description-error"
          className="mt-2 min-h-40 w-full min-w-0 resize-y rounded-lg border border-gray-300 px-3 py-2.5 text-xs text-black transition outline-none placeholder:text-gray-400 focus:border-slate-600 sm:min-h-44 sm:text-sm"
        />

        <div id="description-error" aria-live="polite" className="mt-1">
          {state.errors?.description?.map((error) => (
            <p key={error} className="text-xs wrap-break-word text-red-600 sm:text-sm">
              {error}
            </p>
          ))}
        </div>
      </div>

      {state.message && (
        <p
          aria-live="polite"
          className="rounded-lg bg-red-50 px-3 py-2.5 text-xs wrap-break-word text-red-700 sm:px-4 sm:py-3 sm:text-sm md:col-span-2"
        >
          {state.message}
        </p>
      )}

      <div className="md:col-span-2 md:flex md:justify-end">
        <button
          type="submit"
          disabled={pending || categories.length === 0}
          className="w-full rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60 md:w-auto 2xl:px-6 2xl:py-3 2xl:text-base"
        >
          {pending ? "Creating ticket..." : "Create Ticket"}
        </button>
      </div>
    </form>
  );
}
