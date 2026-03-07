import { NextResponse } from 'next/server';

import { extractActionItems } from '@/lib/extract-actions';

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { minutes?: unknown };
    const minutes = typeof body.minutes === 'string' ? body.minutes.trim() : '';

    if (!minutes) {
      return NextResponse.json({ error: 'Meeting notes are required.' }, { status: 400 });
    }

    const result = await extractActionItems(minutes);

    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unexpected server error.';

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
