import { atom, read } from 'claude-code'
import type { EngineInterface } from 'claude-code'

import type { InboxItem } from '../types'
import type { PaneInput } from './types'
import { removeItem } from './items'

const items = atom({ plugin: 'inbox', key: 'items' } as const, [])

export async function renderInbox($: EngineInterface, e: PaneInput) {
  const { Box, Text } = $.ui.resolve(e)
  const list = await read($, items)
  const decisions = list.filter(item => item.kind === 'decision')
  const reports = list.filter(item => item.kind === 'report')

  if (list.length === 0) {
    return <Text dimColor>Nothing needs you now.</Text>
  }

  return (
    <Box flexDirection="column" gap={1}>
      {decisions.length > 0 && <Text bold>Decisions ({decisions.length})</Text>}
      {decisions.map(item => renderDecision($, e, item))}
      {reports.length > 0 && <Text bold>Reports ({reports.length})</Text>}
      {reports.map(item => renderReport($, e, item))}
    </Box>
  )
}

function renderDecision($: EngineInterface, e: PaneInput, item: InboxItem) {
  const { Box, Button, Input, Markdown, Text } = $.ui.resolve(e)
  const answer = (text: string) => sendAnswer($, item, text)

  return (
    <Box key={item.id} flexDirection="column">
      <Text bold color="yellow">{item.task} · {item.title}</Text>
      <Markdown text={item.body} />
      <Box flexWrap="wrap" gap={1}>
        {item.options.map(option => (
          <Button key={`${item.id}:${option}`} label={option} onPress={() => answer(option)} />
        ))}
      </Box>
      <Input
        key={`${item.id}:answer`}
        placeholder="Type an answer"
        submitLabel="send"
        onSubmit={(text: string) => answer(text)}
      />
    </Box>
  )
}

function renderReport($: EngineInterface, e: PaneInput, item: InboxItem) {
  const { Box, Button, Markdown, Text } = $.ui.resolve(e)

  return (
    <Box key={item.id} flexDirection="column">
      <Text bold color="cyan">{item.task} · {item.title}</Text>
      <Markdown text={item.body} />
      <Button key={`${item.id}:read`} label="Read" onPress={() => removeItem($, item.id)} />
    </Box>
  )
}

async function sendAnswer($: EngineInterface, item: InboxItem, text: string) {
  const answer = text.trim()

  if (answer === '') {
    return
  }

  await removeItem($, item.id)
  await $.prompt.submit({ text: `📥 Answer to "${item.title}" (${item.task}): ${answer}` })
}
