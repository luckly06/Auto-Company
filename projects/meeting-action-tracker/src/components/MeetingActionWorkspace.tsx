'use client';

import { useState } from 'react';

import { ActionList } from '@/components/ActionList';
import { MeetingInput } from '@/components/MeetingInput';
import type { ExtractionResult } from '@/lib/action-items';

const SAMPLE_NOTES = `Weekly product sync

- Alice will send the customer rollout recap by Friday.
- Ben needs to confirm the analytics tracking gaps before next Tuesday.
- The team agreed to postpone the beta signup page redesign until after launch.
- Morgan will update the launch checklist and share owners by tomorrow.
`;

export function MeetingActionWorkspace() {
  const [result, setResult] = useState<ExtractionResult | null>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(minutes: string) {
    setIsLoading(true);
    setErrorMessage('');

    try {
      const response = await fetch('/api/extract-actions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ minutes }),
      });

      const payload = (await response.json()) as ExtractionResult & { error?: string };

      if (!response.ok) {
        throw new Error(payload.error || 'Unable to extract action items right now.');
      }

      setResult({
        summary: payload.summary,
        actionItems: payload.actionItems,
      });
    } catch (error) {
      setResult(null);
      setErrorMessage(error instanceof Error ? error.message : 'Something went wrong.');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr]">
      <div className="space-y-4">
        <MeetingInput defaultValue={SAMPLE_NOTES} isLoading={isLoading} onSubmit={handleSubmit} />
        {errorMessage ? (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{errorMessage}</div>
        ) : null}
      </div>

      <ActionList actionItems={result?.actionItems ?? []} summary={result?.summary ?? ''} />
    </div>
  );
}
