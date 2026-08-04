"use client";

import { useActionState } from "react";

import { createTicket } from "@/app/(app)/tickets/new/actions";
import { CreateTicketState } from "@/lib/validations/ticket";

type CategoryOption = {
    id: string;
    name: string;
};

type CreateTicketFormProps = {
    categories: CategoryOption[];
}

const initialState: CreateTicketState = {};

const selectClassName = "w-full appearance-none rounded-lg border border-gray-300 bg-white py-2.5 pl-3 pr-12 text-xs text-black outline-none transition focus:border-slate-600 sm:text-sm";

function SelectChevron() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-700"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="m6 9 6 6 6-6"
      />
    </svg>
  );
}

export function CreateTicketForm({
    categories,
}: CreateTicketFormProps) {
    const [state, formAction, pending] = useActionState(
        createTicket,
        initialState,
    );

    return (
        <form
            action={formAction}
            className="grid min-w-0 gap-4 rounded-xl border bg-white p-4 shadow-sm sm:gap-5 sm:p-6 md:grid-cols-2"
        >
            <div className="min-w-0 md:col-span-2">
                <label
                    htmlFor="subject"
                    className="block text-xs font-medium text-gray-900 sm:text-sm"
                >
                    Subject
                </label>

                <input
                    id="subject"
                    name="subject"
                    type="text"
                    required
                    minLength={5}
                    maxLength={120}
                    placeholder="Briefly describe your concern"
                    aria-describedby="subject-error"
                    className="mt-2 w-full min-w-0 rounded-lg border border-gray-300 px-3 py-2.5 text-xs text-black outline-none transition placeholder:text-gray-400 focus:border-slate-600 sm:text-sm"
                />

                <div
                    id="subject-error"
                    aria-live="polite"
                    className="mt-1"
                >
                    {state.errors?.subject?.map((error) => (
                        <p
                            key={error}
                            className="wrap-break-word text-xs text-red-600 sm:text-sm"
                        >
                            {error}
                        </p>
                    ))}
                </div>
            </div>

            <div className="min-w-0">
                <label
                    htmlFor="categoryId"
                    className="block text-xs font-medium text-gray-900 sm:text-sm"
                >
                    Category
                </label>

                <div className="relative mt-2">
                    <select
                        id="categoryId"
                        name="categoryId"
                        required
                        defaultValue=""
                        aria-describedby="category-error"
                        className={selectClassName}
                    >
                        <option value="" disabled>
                        Select a category
                        </option>

                        {categories.map((category) => (
                        <option
                            key={category.id}
                            value={category.id}
                        >
                            {category.name}
                        </option>
                        ))}
                    </select>

                    <SelectChevron />
                </div>

                <div
                    id="category-error"
                    aria-live="polite"
                    className="mt-1"
                >
                    {state.errors?.categoryId?.map((error) => (
                        <p
                            key={error}
                            className="wrap-break-word text-xs text-red-600 sm:text-sm"
                        >
                            {error}
                        </p>
                    ))}
                </div>
            </div>

            <div className="min-w-0">
                <label
                    htmlFor="priority"
                    className="block text-xs font-medium text-gray-900 sm:text-sm"
                >
                    Priority
                </label>

                <div className="relative mt-2">
                    <select
                        id="priority"
                        name="priority"
                        required
                        defaultValue="MEDIUM"
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

                <div
                    id="priority-error"
                    aria-live="polite"
                    className="mt-1"
                >
                    {state.errors?.priority?.map((error) => (
                        <p
                            key={error}
                            className="wrap-break-word text-xs text-red-600 sm:text-sm"
                        >
                            {error}
                        </p>
                    ))}
                </div>
            </div>

            <div className="min-w-0 md:col-span-2">
                <label
                    htmlFor="description"
                    className="block text-xs font-medium text-gray-900 sm:text-sm"
                >
                    Description
                </label>

                <textarea
                    id="description"
                    name="description"
                    required
                    minLength={10}
                    maxLength={5000}
                    rows={7}
                    placeholder="Provide the relevant details, steps, and error messages."
                    aria-describedby="description-error"
                    className="mt-2 min-h-40 w-full min-w-0 resize-y rounded-lg border border-gray-300 px-3 py-2.5 text-xs text-black outline-none transition placeholder:text-gray-400 focus:border-slate-600 sm:min-h-44 sm:text-sm"
                />

                <div
                    id="description-error"
                    aria-live="polite"
                    className="mt-1"
                >
                    {state.errors?.description?.map((error) => (
                        <p
                            key={error}
                            className="wrap-break-word text-xs text-red-600 sm:text-sm"
                        >
                            {error}
                        </p>
                    ))}
                </div>
            </div>

            {state.message && (
                <p
                    aria-live="polite"
                    className="wrap-break-word rounded-lg bg-red-50 px-3 py-2.5 text-xs text-red-700 sm:px-4 sm:py-3 sm:text-sm md:col-span-2"
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
    )
}