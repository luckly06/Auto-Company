import type { ActionItem } from '@/lib/action-items';

interface ActionListProps {
  actionItems: ActionItem[];
  summary: string;
  onAddItem?: () => void;
  onRemoveItem?: (id: string) => void;
  onUpdateItem?: <K extends EditableField>(id: string, field: K, value: ActionItem[K]) => void;
}

type EditableField = 'title' | 'owner' | 'dueDate' | 'priority' | 'status' | 'context';

const priorityClasses: Record<ActionItem['priority'], string> = {
  high: 'bg-rose-100 text-rose-700',
  medium: 'bg-amber-100 text-amber-700',
  low: 'bg-emerald-100 text-emerald-700',
};

const statusLabels: Record<ActionItem['status'], string> = {
  todo: 'To do',
  in_progress: 'In progress',
  blocked: 'Blocked',
  done: 'Done',
};

export function ActionList({ actionItems, onAddItem, onRemoveItem, onUpdateItem, summary }: ActionListProps) {
  if (actionItems.length === 0) {
    return (
      <section className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-6 text-slate-600">
        <h2 className="text-lg font-semibold text-slate-900">Structured output appears here</h2>
        <p className="mt-2 text-sm">Paste meeting notes to see structured action items, ownership, timing, and context.</p>
      </section>
    );
  }

  return (
    <section className="space-y-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-soft">
      <div className="space-y-2 border-b border-slate-100 pb-4">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-indigo-600">AI Summary</p>
        <p className="text-sm leading-6 text-slate-700">{summary}</p>
      </div>

      <div className="flex justify-end">
        {onAddItem ? (
          <button
            className="rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-cyan-300 hover:text-cyan-700"
            onClick={onAddItem}
            type="button"
          >
            Add item
          </button>
        ) : null}
      </div>

      <div className="space-y-4">
        {actionItems.map((actionItem) => (
          <article className="rounded-2xl border border-slate-200 p-5" key={actionItem.id}>
            {onUpdateItem ? (
              <div className="grid gap-3 md:grid-cols-2">
                <Field label="Task title">
                  <input
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 focus:border-cyan-400 focus:bg-white focus:outline-none"
                    onChange={(event) => onUpdateItem(actionItem.id, 'title', event.target.value)}
                    value={actionItem.title}
                  />
                </Field>
                <Field label="Owner">
                  <input
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 focus:border-cyan-400 focus:bg-white focus:outline-none"
                    onChange={(event) => onUpdateItem(actionItem.id, 'owner', event.target.value)}
                    value={actionItem.owner}
                  />
                </Field>
                <Field label="Due date">
                  <input
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 focus:border-cyan-400 focus:bg-white focus:outline-none"
                    onChange={(event) => onUpdateItem(actionItem.id, 'dueDate', event.target.value)}
                    value={actionItem.dueDate}
                  />
                </Field>
                <Field label="Priority">
                  <select
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 focus:border-cyan-400 focus:bg-white focus:outline-none"
                    onChange={(event) => onUpdateItem(actionItem.id, 'priority', event.target.value as ActionItem['priority'])}
                    value={actionItem.priority}
                  >
                    <option value="high">high</option>
                    <option value="medium">medium</option>
                    <option value="low">low</option>
                  </select>
                </Field>
                <Field label="Status">
                  <select
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 focus:border-cyan-400 focus:bg-white focus:outline-none"
                    onChange={(event) => onUpdateItem(actionItem.id, 'status', event.target.value as ActionItem['status'])}
                    value={actionItem.status}
                  >
                    <option value="todo">todo</option>
                    <option value="in_progress">in progress</option>
                    <option value="blocked">blocked</option>
                    <option value="done">done</option>
                  </select>
                </Field>
                <Field label="Context">
                  <input
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 focus:border-cyan-400 focus:bg-white focus:outline-none"
                    onChange={(event) => onUpdateItem(actionItem.id, 'context', event.target.value)}
                    value={actionItem.context}
                  />
                </Field>
              </div>
            ) : (
              <>
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div>
                    <h3 className="text-base font-semibold text-slate-950">{actionItem.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-slate-600">{actionItem.context}</p>
                  </div>
                  <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${priorityClasses[actionItem.priority]}`}>
                    {actionItem.priority}
                  </span>
                </div>

                <dl className="mt-4 grid gap-3 text-sm text-slate-600 sm:grid-cols-3">
                  <div>
                    <dt className="font-medium text-slate-950">Owner</dt>
                    <dd>{actionItem.owner}</dd>
                  </div>
                  <div>
                    <dt className="font-medium text-slate-950">Due date</dt>
                    <dd>{actionItem.dueDate}</dd>
                  </div>
                  <div>
                    <dt className="font-medium text-slate-950">Status</dt>
                    <dd>{statusLabels[actionItem.status]}</dd>
                  </div>
                </dl>
              </>
            )}

            {onRemoveItem ? (
              <div className="mt-4 flex justify-end">
                <button
                  className="rounded-full border border-rose-200 px-4 py-2 text-sm font-medium text-rose-600 transition hover:border-rose-300 hover:text-rose-700"
                  onClick={() => onRemoveItem(actionItem.id)}
                  type="button"
                >
                  Remove
                </button>
              </div>
            ) : null}
          </article>
        ))}
      </div>
    </section>
  );
}

function Field({ children, label }: { children: React.ReactNode; label: string }) {
  return (
    <label className="space-y-2 text-sm text-slate-700">
      <span className="block text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">{label}</span>
      {children}
    </label>
  );
}
