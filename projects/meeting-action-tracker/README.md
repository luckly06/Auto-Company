# Meeting Action Tracker

Turn pasted meeting notes into structured action items, review them inline, and copy a follow-up block for Slack, email, or docs.

## MVP scope

- One-page Next.js UI for pasting notes and reviewing results
- `POST /api/extract` route with OpenAI extraction
- Graceful fallback extraction when `OPENAI_API_KEY` is missing or model output fails
- Editable action items with owner, due date, priority, status, and context
- Copy-ready follow-up output and open question list

## Local setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Copy the environment template:

   ```bash
   cp .env.example .env.local
   ```

3. Optional: add `OPENAI_API_KEY` to `.env.local` for real model extraction.

4. Start the app:

   ```bash
   npm run dev
   ```

   In this project, the dev server is hardened for WSL and binds `0.0.0.0` by default so Windows can reach `http://localhost:3000`.

Open `http://localhost:3000` and either paste notes or load the bundled sample.

If Windows still cannot reach the app from WSL, follow `../../docs/devops/2026-03-08-wsl-next-localhost-guardrails.md` or use `/home/dd/.agents/skills/devops/wsl-next-localhost-guardrails/SKILL.md`.

## Scripts

- `npm run dev` — start the local dev server
- `npm run test` — run the Vitest suite
- `npm run lint` — run Next.js lint checks
- `npm run typecheck` — run TypeScript without emitting files
- `npm run build` — create a production build
- `npm run smoke:preview -- https://your-preview-url.vercel.app` — verify homepage, `/api/extract`, and legacy route shutdown on a live deployment

## Preview smoke test

Use the smoke script against any deployed URL or a local production server:

```bash
SMOKE_EXPECT_MODE=fallback npm run smoke:preview -- http://127.0.0.1:3000
```

Optional environment variables:

- `SMOKE_BASE_URL` — provide the target URL without passing a CLI argument
- `SMOKE_EXPECT_MODE` — assert `fallback` or `openai` when you want a stricter check

## API contract

### `POST /api/extract`

Request body:

```json
{
  "notes": "Weekly sync notes..."
}
```

Compatibility note:

- The route also accepts a legacy `minutes` field during the migration away from `/api/extract-actions`.

Response shape:

```json
{
  "summary": "Detected 3 action items from the meeting notes.",
  "actionItems": [
    {
      "id": "action-1",
      "title": "Finalize launch email",
      "owner": "Dana",
      "dueDate": "Friday",
      "priority": "high",
      "status": "todo",
      "context": "Needed before launch review"
    }
  ],
  "openQuestions": ["Who owns analytics?"],
  "mode": "openai"
}
```

## Fallback mode

If `OPENAI_API_KEY` is not set, the API still returns a structured draft using lightweight local heuristics. This keeps the MVP usable in development and provides graceful degradation for demos.

## Key files

- `src/app/page.tsx` — homepage entry
- `src/components/MeetingActionApp.tsx` — main review-first UI flow
- `src/components/MeetingInput.tsx` — input form and sample loader
- `src/components/ActionList.tsx` — editable action item list
- `src/app/api/extract/route.ts` — primary extraction route
- `src/lib/action-items.ts` — parsing, normalization, fallback extraction, follow-up formatting
