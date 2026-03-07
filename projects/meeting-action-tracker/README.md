# Meeting Action Tracker

Meeting Action Tracker is a lightweight Next.js MVP that turns pasted meeting notes into a structured follow-up list using the OpenAI API.

## Features

- Paste raw meeting notes into a clean input workspace.
- Extract an AI-generated summary and normalized action items.
- Show owner, due date, priority, status, and context for each task.
- Deploy easily to Vercel with a single API key.

## Tech Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- OpenAI Node SDK
- Vitest + Testing Library

## Getting Started

1. Install dependencies:

   ```bash
   npm install
   ```

2. Copy the environment file and add your OpenAI key:

   ```bash
   cp .env.example .env.local
   ```

3. Start the dev server:

   ```bash
   npm run dev
   ```

4. Open `http://localhost:3000`.

## Environment Variables

- `OPENAI_API_KEY`: required for extraction requests.
- `OPENAI_MODEL`: optional, defaults to `gpt-4o-mini`.

## Scripts

- `npm run dev` — local development
- `npm test` — unit/component tests
- `npm run lint` — Next.js linting
- `npm run build` — production build validation

## Project Structure

- `src/app/page.tsx` — landing page and workspace shell
- `src/app/api/extract-actions/route.ts` — server route for OpenAI extraction
- `src/components/MeetingInput.tsx` — input form
- `src/components/ActionList.tsx` — extracted output UI
- `src/lib/action-items.ts` — parsing and normalization helpers
- `src/lib/extract-actions.ts` — OpenAI integration
