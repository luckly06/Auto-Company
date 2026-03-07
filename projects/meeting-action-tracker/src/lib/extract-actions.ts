import OpenAI from 'openai';

import { ExtractionResult, parseExtractionPayload } from '@/lib/action-items';

const extractionSchema = {
  name: 'meeting_action_items',
  strict: true,
  schema: {
    type: 'object',
    additionalProperties: false,
    required: ['summary', 'actionItems'],
    properties: {
      summary: {
        type: 'string',
        description: 'A concise summary of the meeting outcomes in one or two sentences.',
      },
      actionItems: {
        type: 'array',
        items: {
          type: 'object',
          additionalProperties: false,
          required: ['title', 'owner', 'dueDate', 'priority', 'status', 'context'],
          properties: {
            title: { type: 'string' },
            owner: { type: 'string' },
            dueDate: { type: 'string' },
            priority: { type: 'string', enum: ['high', 'medium', 'low'] },
            status: { type: 'string', enum: ['todo', 'in_progress', 'blocked', 'done'] },
            context: { type: 'string' },
          },
        },
      },
    },
  },
} as const;

function getClient(): OpenAI {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    throw new Error('Missing OPENAI_API_KEY. Add it to your local environment before extracting action items.');
  }

  return new OpenAI({ apiKey });
}

export async function extractActionItems(meetingMinutes: string): Promise<ExtractionResult> {
  const client = getClient();
  const model = process.env.OPENAI_MODEL || 'gpt-4o-mini';

  const completion = await client.chat.completions.create({
    model,
    temperature: 0.2,
    response_format: {
      type: 'json_schema',
      json_schema: extractionSchema,
    },
    messages: [
      {
        role: 'system',
        content:
          'You extract action items from meeting notes. Return JSON only. Be conservative: if a field is missing, infer the safest reasonable fallback rather than inventing unsupported details.',
      },
      {
        role: 'user',
        content: `Turn these meeting notes into structured action items:\n\n${meetingMinutes}`,
      },
    ],
  });

  const content = completion.choices[0]?.message?.content;

  if (!content) {
    throw new Error('OpenAI returned an empty response.');
  }

  return parseExtractionPayload(content);
}
