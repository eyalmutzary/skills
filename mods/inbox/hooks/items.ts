import { atom, read, update } from 'claude-code'
import type { EngineInterface } from 'claude-code'

import type { InboxItem } from '../types'
import { PANE_ID, STORE_KEY_PREFIX } from './constants'

const items = atom({ plugin: 'inbox', key: 'items' } as const, [])

export async function loadItems($: EngineInterface) {
  const saved = await $.store.get(await storeKey($))
  const savedItems = Array.isArray(saved) ? (saved as InboxItem[]) : []

  await update($, items, () => savedItems)

  if (savedItems.length > 0) {
    await showPane($, savedItems)
  }
}

export async function addItem($: EngineInterface, item: Omit<InboxItem, 'id'>) {
  const id = (await $.clock.now()).toString(36)
  const list = await update($, items, current => [...current, { ...item, id }])

  await save($, list)
  await showPane($, list)
  $.ui.toast(`📥 Inbox: ${item.title}`)

  return id
}

export async function removeItem($: EngineInterface, id: string) {
  const list = await update($, items, current => current.filter(item => item.id !== id))

  await save($, list)
  await showPane($, list)
}

export async function openInbox($: EngineInterface) {
  await showPane($, await read($, items))
}

async function showPane($: EngineInterface, list: InboxItem[]) {
  const title = list.length === 0 ? 'Inbox' : `Inbox (${list.length})`

  await $.ui.open({ id: PANE_ID, title })
}

async function save($: EngineInterface, list: InboxItem[]) {
  const key = await storeKey($)

  if (list.length === 0) {
    await $.store.delete(key)
    return
  }

  await $.store.set(key, list)
}

async function storeKey($: EngineInterface) {
  return `${STORE_KEY_PREFIX}${await $.session.id()}`
}
