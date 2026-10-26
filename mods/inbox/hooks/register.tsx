import type { Register } from 'claude-code'

import { ADD_TOOL_ID, COMMAND_NAME, PANE_ID, WITHDRAW_TOOL_ID } from './constants'
import { addItem, loadItems, openInbox, removeItem } from './items'
import { parseAddInput, registerTools } from './tools'
import { renderInbox } from './view'

export const register: Register = on => {
  on('session.start', async ($, e, next) => {
    await $.command.register({ name: COMMAND_NAME, description: 'Open the inbox pane' })
    await registerTools($)
    await loadItems($)

    return next(e)
  })

  on('command.run', { command: COMMAND_NAME }, async $ => {
    await openInbox($)

    return { text: 'Inbox opened.' }
  })

  on('tool.call', { tool: ADD_TOOL_ID }, async ($, e) => {
    const item = parseAddInput(e)

    if (typeof item === 'string') {
      return { deny: item }
    }

    const id = await addItem($, item)

    return { result: `Added to the inbox as ${id}.` }
  })

  on('tool.call', { tool: WITHDRAW_TOOL_ID }, async ($, e) => {
    if (typeof e.id !== 'string') {
      return { deny: 'id must be a string' }
    }

    await removeItem($, e.id)

    return { result: `Removed ${e.id} from the inbox.` }
  })

  // Mobile has no Input, so it gets the engine's own empty pane.
  on('ui.render', { component: 'Pane', requestId: PANE_ID }, ($, e, next) =>
    e.surface === 'mobile' ? next(e) : renderInbox($, e),
  )
}
