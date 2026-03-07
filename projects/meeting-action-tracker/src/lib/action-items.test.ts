import { buildFallbackExtraction, normalizeActionItems, parseExtractionPayload } from '@/lib/action-items';

describe('normalizeActionItems', () => {
  it('trims values and applies safe fallbacks', () => {
    expect(
      normalizeActionItems([
        {
          title: ' Send follow-up email ',
          owner: ' Alice ',
          dueDate: '',
          priority: 'urgent',
          status: 'doing',
          context: ' recap key decisions ',
        },
      ]),
    ).toEqual([
      {
        id: 'action-1',
        title: 'Send follow-up email',
        owner: 'Alice',
        dueDate: 'Not specified',
        priority: 'medium',
        status: 'todo',
        context: 'recap key decisions',
      },
    ]);
  });

  it('drops records without a usable title', () => {
    expect(
      normalizeActionItems([
        { title: '   ', owner: 'Alice' },
        { title: 'Book stakeholder review', owner: '' },
      ]),
    ).toEqual([
      {
        id: 'action-2',
        title: 'Book stakeholder review',
        owner: 'Unassigned',
        dueDate: 'Not specified',
        priority: 'medium',
        status: 'todo',
        context: 'No extra context provided.',
      },
    ]);
  });
});

describe('parseExtractionPayload', () => {
  it('parses fenced JSON and normalizes action items', () => {
    const result = parseExtractionPayload(`\`\`\`json
{
  "summary": "Team aligned on launch prep.",
  "actionItems": [
    {
      "title": "Finalize launch email",
      "owner": "Dana",
      "dueDate": "Friday",
      "priority": "high",
      "status": "todo",
      "context": "Needed before launch review"
    }
  ]
}
\`\`\``);

    expect(result).toEqual({
      summary: 'Team aligned on launch prep.',
      actionItems: [
        {
          id: 'action-1',
          title: 'Finalize launch email',
          owner: 'Dana',
          dueDate: 'Friday',
          priority: 'high',
          status: 'todo',
          context: 'Needed before launch review',
        },
      ],
    });
  });
});

describe('buildFallbackExtraction', () => {
  it('ignores heading lines and keeps Chinese owners clean', () => {
    const result = buildFallbackExtraction(`Customer follow-up review — 2026-03-07

1. Ravi to send the revised onboarding email draft by Tuesday.
2. 王敏负责确认 pricing section 的 FAQ 是否需要单独导出成 follow-up block，本周内回复。
3. 陈晨需要补充一条关于 owner 缺失时默认值的说明，下周一前完成。`);

    expect(result.actionItems).toHaveLength(3);
    expect(result.actionItems.map((item) => item.owner)).toEqual(['Ravi', '王敏', '陈晨']);
  });
});
