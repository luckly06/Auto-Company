export type ActionPriority = 'high' | 'medium' | 'low';
export type ActionStatus = 'todo' | 'in_progress' | 'blocked' | 'done';
export type ExtractionMode = 'openai' | 'fallback';

export interface ActionItem {
  id: string;
  title: string;
  owner: string;
  dueDate: string;
  priority: ActionPriority;
  status: ActionStatus;
  context: string;
}

export interface ExtractionResult {
  summary: string;
  actionItems: ActionItem[];
}

export interface ExtractionResponse extends ExtractionResult {
  openQuestions: string[];
  mode: ExtractionMode;
}

type RawActionItem = Record<string, unknown>;

const PRIORITIES: ActionPriority[] = ['high', 'medium', 'low'];
const STATUSES: ActionStatus[] = ['todo', 'in_progress', 'blocked', 'done'];
const ACTION_HINT = /(行动项|跟进|负责|需要|请|todo|follow up|next step|send|update|prepare|confirm|review|share|sync|deliver|finalize|安排|提交|同步)/i;
const QUESTION_HINT = /(\?|待确认|open question|question|unknown|待定|to decide)/i;
const IMPERATIVE_ACTION_HINT = /^(please|follow up|send|update|prepare|confirm|review|share|sync|deliver|finalize|请|安排|提交|同步)\b/i;

function cleanText(value: unknown, fallback = ''): string {
  if (typeof value !== 'string') {
    return fallback;
  }

  const normalized = value.trim().replace(/\s+/g, ' ');
  return normalized || fallback;
}

function normalizePriority(value: unknown): ActionPriority {
  return PRIORITIES.includes(value as ActionPriority) ? (value as ActionPriority) : 'medium';
}

function normalizeStatus(value: unknown): ActionStatus {
  return STATUSES.includes(value as ActionStatus) ? (value as ActionStatus) : 'todo';
}

function stripCodeFence(payload: string): string {
  const normalized = payload.trim();

  if (!normalized.startsWith('```') && !normalized.startsWith('````')) {
    return normalized;
  }

  return normalized.replace(/^`{3,}(?:json)?\s*/i, '').replace(/\s*`{3,}$/i, '').trim();
}

export function normalizeActionItems(rawItems: RawActionItem[]): ActionItem[] {
  return rawItems.flatMap((rawItem, index) => {
    const title = cleanText(rawItem.title);

    if (!title) {
      return [];
    }

    return [
      {
        id: `action-${index + 1}`,
        title,
        owner: cleanText(rawItem.owner, 'Unassigned'),
        dueDate: cleanText(rawItem.dueDate, 'Not specified'),
        priority: normalizePriority(rawItem.priority),
        status: normalizeStatus(rawItem.status),
        context: cleanText(rawItem.context, 'No extra context provided.'),
      },
    ];
  });
}

export function parseExtractionPayload(payload: string): ExtractionResult {
  const parsed = JSON.parse(stripCodeFence(payload)) as {
    summary?: unknown;
    actionItems?: RawActionItem[];
  };

  const actionItems = normalizeActionItems(Array.isArray(parsed.actionItems) ? parsed.actionItems : []);
  const summary = cleanText(
    parsed.summary,
    actionItems.length > 0
      ? `Identified ${actionItems.length} action item${actionItems.length === 1 ? '' : 's'}.`
      : 'No clear action items were found.',
  );

  return {
    summary,
    actionItems,
  };
}

export function normalizeExtractionResponse(payload: unknown, mode: ExtractionMode): ExtractionResponse {
  const parsed = isRecord(payload) ? payload : {};
  const actionItems = normalizeActionItems(Array.isArray(parsed.actionItems) ? (parsed.actionItems as RawActionItem[]) : []);

  return {
    summary: cleanText(
      parsed.summary,
      actionItems.length > 0
        ? `Identified ${actionItems.length} action item${actionItems.length === 1 ? '' : 's'}.`
        : 'No clear action items were found.',
    ),
    actionItems,
    openQuestions: normalizeStringList(parsed.openQuestions),
    mode,
  };
}

export function buildFallbackExtraction(notes: string): ExtractionResponse {
  const segments = notes
    .split(/\n+/)
    .flatMap((line) => line.split(/(?<=[。！？.!?;；])/))
    .map((line) => line.replace(/^[-*•\d.)\s]+/, '').trim())
    .filter((line) => line.length >= 8);

  const actionItems = normalizeActionItems(
    uniqueStrings(segments.filter((segment) => isActionCandidate(segment))).slice(0, 8).map((segment) => ({
      title: segment,
      owner: inferOwner(segment),
      dueDate: inferDueDate(segment),
      priority: inferPriority(segment),
      status: 'todo',
      context: segment,
    })),
  );

  const openQuestions = uniqueStrings(segments.filter((segment) => QUESTION_HINT.test(segment))).slice(0, 5);

  return {
    summary: actionItems.length
      ? `Detected ${actionItems.length} action items from the meeting notes.`
      : 'No clear action items were detected. Review the notes and add a task manually if needed.',
    actionItems,
    openQuestions,
    mode: 'fallback',
  };
}

export function buildFollowUpMessage(result: Pick<ExtractionResponse, 'summary' | 'actionItems' | 'openQuestions'>): string {
  const lines = ['Meeting follow-up', '', `Summary: ${result.summary}`, '', 'Action items:'];

  if (result.actionItems.length === 0) {
    lines.push('- No clear action items detected.');
  } else {
    result.actionItems.forEach((item, index) => {
      lines.push(
        `${index + 1}. ${item.title} | Owner: ${item.owner} | Due: ${item.dueDate} | Priority: ${item.priority}`,
      );
    });
  }

  if (result.openQuestions.length > 0) {
    lines.push('', 'Open questions:');
    result.openQuestions.forEach((question) => lines.push(`- ${question}`));
  }

  return lines.join('\n');
}

function normalizeStringList(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .filter((entry): entry is string => typeof entry === 'string')
    .map((entry) => entry.trim())
    .filter(Boolean);
}

function inferOwner(segment: string): string {
  const explicitOwner = segment.match(/(?:负责人|owner)[:：]\s*([A-Za-z\u4e00-\u9fa5][A-Za-z\u4e00-\u9fa5\s-]{0,24})/i);
  if (explicitOwner?.[1]) {
    return explicitOwner[1].trim();
  }

  const chineseOwner = segment.match(/^([\u4e00-\u9fa5]{2,4}?)(?=负责|跟进|整理|同步|发送|确认|提交|安排|需要|补充|检查|验证)/);
  if (chineseOwner?.[1]) {
    return chineseOwner[1];
  }

  const englishOwner = segment.match(/\b([A-Z][a-z]+)\b\s+(?:to|will|needs to|should)/);
  if (englishOwner?.[1]) {
    return englishOwner[1];
  }

  return 'Unassigned';
}

function inferDueDate(segment: string): string {
  const patterns = [
    /\b\d{4}-\d{2}-\d{2}\b/,
    /\b\d{1,2}\/\d{1,2}(?:\/\d{2,4})?\b/,
    /(今天|明天|本周五|本周内|下周[一二三四五六日天]|周[一二三四五六日天]|月底|下月底)/,
    /\bby\s+[A-Za-z]+\b/i,
    /before\s+\d{4}-\d{2}-\d{2}/i,
  ];

  for (const pattern of patterns) {
    const match = segment.match(pattern);
    if (match?.[0]) {
      return match[0].trim();
    }
  }

  return 'Not specified';
}

function inferPriority(segment: string): ActionPriority {
  if (/(asap|urgent|blocker|今天|明天|立即|高优先|critical)/i.test(segment)) {
    return 'high';
  }

  if (/(later|optional|下月|有空再|nice to have)/i.test(segment)) {
    return 'low';
  }

  return 'medium';
}

function isActionCandidate(segment: string): boolean {
  const hasOwner = inferOwner(segment) !== 'Unassigned';

  if (hasOwner && ACTION_HINT.test(segment)) {
    return true;
  }

  if (hasOwner && /(负责|需要|will|needs to|请|跟进| to )/i.test(segment)) {
    return segment.length >= 12;
  }

  return IMPERATIVE_ACTION_HINT.test(segment) && segment.length >= 12;
}

function uniqueStrings(values: string[]): string[] {
  return Array.from(new Set(values));
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}
