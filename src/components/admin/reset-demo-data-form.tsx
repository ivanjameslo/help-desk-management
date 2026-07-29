"use client";

import {
  useActionState,
  useEffect,
  useRef,
} from "react";

import {
  resetDemoDataAction,
  type ResetDemoDataState,
} from "@/app/(app)/admin/demo-data-actions";

const initialState: ResetDemoDataState = {};

export function ResetDemoDataForm() {
  const formRef = useRef<HTMLFormElement>(null);

  const [state, formAction, pending] = useActionState(
    resetDemoDataAction,
    initialState,
  );

  useEffect(() => {
    if (state.success) {
      formRef.current?.reset();
    }
  }, [state.success]);

  return (
    <section className="rounded-xl border border-red-200 bg-white p-6 shadow-sm">
      <div>
        <h2 className="text-lg font-semibold text-red-700">
          Reset Demo Data
        </h2>

        <p className="mt-2 text-sm leading-6 text-gray-600">
          Remove all tickets belonging to public demo accounts and
          restore the four original sample tickets.
        </p>

        <p className="mt-2 text-sm font-medium text-red-700">
          This action cannot be undone.
        </p>
      </div>

      <form
        ref={formRef}
        action={formAction}
        className="mt-5 space-y-4"
      >
        <div>
          <label
            htmlFor="demo-reset-confirmation"
            className="block text-sm font-medium text-gray-700"
          >
            Type RESET to confirm
          </label>

          <input
            id="demo-reset-confirmation"
            name="confirmation"
            type="text"
            required
            autoComplete="off"
            placeholder="RESET"
            className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-black outline-none transition focus:border-red-600"
          />
        </div>

        {state.message && (
          <p
            aria-live="polite"
            className={`rounded-lg px-4 py-3 text-sm ${
              state.success
                ? "bg-green-50 text-green-700"
                : "bg-red-50 text-red-700"
            }`}
          >
            {state.message}
          </p>
        )}

        <button
          type="submit"
          disabled={pending}
          className="w-full rounded-lg bg-red-700 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {pending ? "Resetting demo data..." : "Reset Demo Data"}
        </button>
      </form>
    </section>
  );
}