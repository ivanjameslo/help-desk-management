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
            className="space-y-6 rounded-xl border bg-white p-6 shadow-sm"
        >
            <div>
                <label
                    htmlFor="subject"
                    className="block text-sm font-medium text-gray-900"
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
                    placeholder="Briefly describe ypur concern"
                    aria-describedby="subject-error"
                    className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none transition focus:border-slate-600"
                />

                <div
                    id="subject-error"
                    aria-live="polite"
                    className="mt-1"
                >
                    {state.errors?.subject?.map((error) => (
                        <p
                            key={error}
                            className="text-sm text-red-600"
                        >
                            {error}
                        </p>
                    ))}
                </div>
            </div>

            <div>
                <label
                    htmlFor="categoryId"
                    className="block text-sm font-medium text-gray-900"
                >
                    Category
                </label>

                <select
                    id="categoryId"
                    name="categoryId"
                    required
                    defaultValue=""
                    aria-describedby="category-error"
                    className="mt-2 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-slate-600" 
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

                <div
                    id="category-error"
                    aria-live="polite"
                    className="mt-1"
                >
                    {state.errors?.categoryId?.map((error) => (
                        <p
                            key={error}
                            className="text-sm text-red-600"
                        >
                            {error}
                        </p>
                    ))}
                </div>
            </div>

            <div>
                <label
                    htmlFor="priority"
                    className="block text-sm font-medium text-gray-900"
                >
                    Priority
                </label>

                <select
                    id="priority"
                    name="priority"
                    required
                    defaultValue="MEDIUM"
                    aria-describedby="priority-error"
                    className="mt-2 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-slate-600"
                >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                    <option value="URGENT">Urgent</option>
                </select>

                <div
                    id="priority-error"
                    aria-live="polite"
                    className="mt-1"
                >
                    {state.errors?.priority?.map((error) => (
                        <p
                            key={error}
                            className="text-sm text-red-600"
                        >
                            {error}
                        </p>
                    ))}
                </div>
            </div>

            <div>
                <label
                    htmlFor="description"
                    className="block text-sm font-medium text-gray-900"
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
                    className="mt-2 w-full resize-y rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none transition focus:border-slate-600"
                />

                <div
                    id="description-error"
                    aria-live="polite"
                    className="mt-1"
                >
                    {state.errors?.description?.map((error) => (
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
                    className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700"
                >
                    {state.message}
                </p>
            )}

            <div className="flext justify-end">
                <button
                    type="submit"
                    disabled={pending || categories.length === 0}
                    className="rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                    {pending ? "Creating ticket..." : "Create Ticket"}
                </button>
            </div>

        </form>
    )
}