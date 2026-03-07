import { MeetingActionWorkspace } from '@/components/MeetingActionWorkspace';

const highlights = [
  'Paste notes from Zoom, Meet, or internal docs.',
  'Get a concise summary plus structured action items.',
  'Keep the MVP lightweight: no setup, no integrations, no clutter.',
];

export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-7xl flex-col gap-16 px-6 py-10 lg:px-8 lg:py-14">
      <section className="grid gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
        <div className="space-y-6">
          <div className="inline-flex rounded-full border border-indigo-200 bg-white/80 px-4 py-2 text-sm font-medium text-indigo-700 backdrop-blur">
            Auto Company MVP · Meeting notes → action plan
          </div>
          <div className="space-y-4">
            <h1 className="max-w-2xl text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">
              Extract accountable action items from any meeting recap.
            </h1>
            <p className="max-w-2xl text-lg leading-8 text-slate-600">
              Meeting Action Tracker turns raw notes into a clean follow-up brief: who owns what, when it is due, and why it matters.
            </p>
          </div>

          <ul className="space-y-3">
            {highlights.map((highlight) => (
              <li className="flex items-start gap-3 text-sm text-slate-700" key={highlight}>
                <span className="mt-1 inline-flex h-5 w-5 flex-none items-center justify-center rounded-full bg-indigo-600 text-xs font-bold text-white">
                  ✓
                </span>
                <span>{highlight}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-[32px] border border-white/70 bg-white/70 p-4 shadow-soft backdrop-blur">
          <MeetingActionWorkspace />
        </div>
      </section>

      <section className="grid gap-4 rounded-[32px] border border-slate-200 bg-white px-6 py-8 shadow-soft md:grid-cols-3">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-indigo-600">Fast setup</p>
          <p className="mt-3 text-sm leading-7 text-slate-600">Drop in one API key and the app is ready to run locally or on Vercel.</p>
        </div>
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-indigo-600">Clear outputs</p>
          <p className="mt-3 text-sm leading-7 text-slate-600">Each action item is normalized into owner, deadline, priority, status, and context.</p>
        </div>
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-indigo-600">Built to ship</p>
          <p className="mt-3 text-sm leading-7 text-slate-600">The architecture stays intentionally small so the product can evolve from user feedback, not speculation.</p>
        </div>
      </section>
    </main>
  );
}
