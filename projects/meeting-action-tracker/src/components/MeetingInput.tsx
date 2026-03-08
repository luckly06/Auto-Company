'use client';

import { FormEvent, useState } from 'react';

interface MeetingInputProps {
  isLoading: boolean;
  onSubmit: (minutes: string) => Promise<void> | void;
  sampleNotes?: string;
}

export function MeetingInput({ isLoading, onSubmit, sampleNotes }: MeetingInputProps) {
  const [minutes, setMinutes] = useState(sampleNotes ?? '');

  const trimmedMinutes = minutes.trim();

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!trimmedMinutes) {
      return;
    }

    await onSubmit(trimmedMinutes);
  }

  return (
    <form className="space-y-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-soft" onSubmit={handleSubmit}>
      <div className="space-y-2">
        <label className="block text-sm font-semibold text-slate-900" htmlFor="meeting-notes">
          Meeting notes
        </label>
        <p className="text-sm text-slate-500">
          Paste raw notes, a transcript snippet, or bullet points. The AI will turn them into a clean action plan.
        </p>
      </div>

      <textarea
        id="meeting-notes"
        className="min-h-[280px] w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-100"
        onChange={(event) => setMinutes(event.target.value)}
        placeholder="Paste your meeting notes here..."
        value={minutes}
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-slate-500">Tip: include owners, deadlines, and decisions if they were mentioned in the meeting.</p>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          {sampleNotes ? (
            <button
              className="inline-flex items-center justify-center rounded-full border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-cyan-300 hover:text-cyan-700"
              onClick={() => setMinutes(sampleNotes)}
              type="button"
            >
              Load sample notes
            </button>
          ) : null}
          <button
        className="inline-flex items-center justify-center gap-2 rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300"
        disabled={isLoading || !trimmedMinutes}
        type="submit"
      >
        {isLoading ? (
          <>
            <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            Extracting…
          </>
        ) : (
          'Extract action items'
        )}
      </button>
        </div>
      </div>
    </form>
  );
}
