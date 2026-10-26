export type InboxItemKind = 'decision' | 'report'

export type InboxItem = {
  id: string
  kind: InboxItemKind
  task: string
  title: string
  body: string
  options: string[]
}

declare module 'claude-code' {
  interface PluginState {
    inbox: { items: InboxItem[] }
  }
}
