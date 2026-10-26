import { expect, mock, test } from 'claude-code/testing'

const PANE_PROPS = {
  title: 'Inbox',
  isFocused: true,
  bodyColumns: 80,
  placement: 'dock',
  scroll: { offset: 0, bodyRows: 40 },
  view: {},
} as const

test('an answered decision reaches the session and leaves the inbox', async ($, on) => {
  const submitted: string[] = []
  mock.store(on)
  mock.clock(on)
  on('session.start', () => ({ cwd: '/' }))
  on('command.register', (_, e) => ({ value: { command: e.name } }))
  on('tool.register', (_, e) => ({ value: { tool: e.name } }))
  on('session.id', () => ({ value: 'session-1' }))
  on('ui.open', () => ({ value: { isPlaced: true } }))
  on('ui.toast', () => ({ value: undefined }))
  on('prompt.submit', (_, e) => {
    submitted.push(e.text)
    return { text: e.text }
  })

  await $.session.start({ cwd: '/', surface: 'terminal', isInteractive: true })
  await $.tool.call({
    tool: 'mcp__inbox__add_item',
    tool_use_id: 'call-1',
    kind: 'decision',
    task: 'Billing fix',
    title: 'Merge the PR?',
    body: 'CI is green.',
    options: ['Merge', 'Wait'],
  })

  const pane = await $.ui.mount({
    plugin: 'inbox',
    surface: 'terminal',
    component: 'Pane',
    requestId: 'inbox',
    props: PANE_PROPS,
  })
  expect(await pane.find({ type: 'Text', text: /Merge the PR\?/ })).toBeDefined()

  const mergeButton = await pane.find({ type: 'Button', text: 'Merge' })
  await pane.press({ key: mergeButton?.key ?? 'missing' })

  expect(submitted).toEqual(['📥 Answer to "Merge the PR?" (Billing fix): Merge'])
  expect(await pane.find({ text: /Nothing needs you/ })).toBeDefined()
})
