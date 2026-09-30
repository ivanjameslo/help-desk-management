"use client";

import { useActionState, useEffect, useRef } from "react";

import { resetDemoDataAction, type ResetDemoDataState } from "@/app/(app)/admin/demo-data-actions";

const initialState: ResetDemoDataState = {};

export function ResetDemoDataForm() {
  const formRef = useRef<HTMLFormElement>(null);

  const [state, formAction, pending] = useActionState(resetDemoDataAction, initialState);

  useEffect(() => {
    if (state.success) {
      formRef.current?.reset();
    }
  }, [state.success]);

  return (
    <section className="min-w-0 rounded-xl border border-red-200 bg-red-50/40 p-4 shadow-sm sm:p-6">
      <div className="min-w-0">
        <h2 className="text-base font-semibold text-red-700 sm:text-lg 2xl:text-xl">
          Reset Demo Data
        </h2>

        <p className="mt-2 text-xs leading-5 wrap-break-word text-slate-600 sm:text-sm sm:leading-6">
          Remove all tickets belonging to public demo accounts and restore the four original sample
          tickets.
        </p>

        <p className="mt-2 text-xs leading-5 font-medium text-red-700 sm:text-sm">
          This action cannot be undone.
        </p>
      </div>

      <form ref={formRef} action={formAction} className="mt-4 space-y-4 sm:mt-5">
        <div className="min-w-0">
          <label
            htmlFor="demo-reset-confirmation"
            className="block text-xs font-medium text-slate-700 sm:text-sm"
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
            className="mt-2 w-full min-w-0 rounded-lg border border-red-200 bg-white px-3 py-2.5 text-xs text-slate-900 transition outline-none placeholder:text-slate-400 focus:border-red-500 focus:ring-2 focus:ring-red-500/10 sm:text-sm"
          />
        </div>

        {state.message && (
          <p
            aria-live="polite"
            className={`rounded-lg px-3 py-2.5 text-xs wrap-break-word sm:px-4 sm:py-3 sm:text-sm ${
              state.success ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"
            }`}
          >
            {state.message}
          </p>
        )}

        <button
          type="submit"
          disabled={pending}
          className="w-full rounded-lg bg-red-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60 2xl:py-3 2xl:text-base"
        >
          {pending ? "Resetting demo data..." : "Reset Demo Data"}
        </button>
      </form>
    </section>
  );
}
