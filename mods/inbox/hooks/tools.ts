import type { EngineInterface } from 'claude-code'

import type { InboxItem } from '../types'
import { ADD_TOOL, WITHDRAW_TOOL } from './constants'

export async function registerTools($: EngineInterface) {
  await $.tool.register({
    name: ADD_TOOL,
    description:
      'Put an item in the user\'s inbox: a pane that stays on screen while the chat scrolls. ' +
      'Use kind "decision" when you need the user to choose or answer; their answer comes back as a message. ' +
      'Use kind "report" for something the user should know; they only mark it read. ' +
      'Returns the item id.',
    inputSchema: {
      type: 'object',
      properties: {
        kind: { type: 'string', enum: ['decision', 'report'] },
        task: { type: 'string', description: 'Short name of the task this is about' },
        title: { type: 'string', description: 'One line' },
        body: { type: 'string', description: 'Markdown with the context the user needs' },
        options: {
          type: 'array',
          items: { type: 'string' },
          description: 'Answers to offer as buttons, for a decision. The user can always type a free answer.',
        },
      },
      required: ['kind', 'task', 'title', 'body'],
    },
    isDeferred: false,
  })

  await $.tool.register({
    name: WITHDRAW_TOOL,
    description: 'Remove an item from the user\'s inbox when it no longer needs them.',
    inputSchema: {
      type: 'object',
      properties: { id: { type: 'string' } },
      required: ['id'],
    },
    isDeferred: false,
  })
}

export function parseAddInput(input: Record<string, unknown>): Omit<InboxItem, 'id'> | string {
  const { kind, task, title, body, options = [] } = input
  const isKnownKind = kind === 'decision' || kind === 'report'
  const hasTexts = typeof task === 'string' && typeof title === 'string' && typeof body === 'string'
  const hasTextOptions = Array.isArray(options) && options.every(option => typeof option === 'string')

  if (!isKnownKind || !hasTexts || !hasTextOptions) {
    return 'kind must be "decision" or "report"; task, title and body must be strings; options must be strings'
  }

  return { kind, task, title, body, options }
}
