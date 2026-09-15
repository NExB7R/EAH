/**
 * EAH Offline Queue
 * يحفظ الأكشنات offline ويبعتها لما النت يرجع.
 *
 * Supported actions:
 *   - review       (تقييم)
 *   - favorite     (مفضلة)
 *   - reveal       (كشف تواصل)
 */

const DB_NAME = 'eah-offline'
const DB_VERSION = 1
const STORE = 'actions'

export type QueuedAction = {
  id: string
  type: 'review' | 'favorite' | 'reveal'
  payload: Record<string, unknown>
  endpoint: string
  method: 'POST' | 'DELETE'
  createdAt: number
  attempts: number
}

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') {
      reject(new Error('IndexedDB not available'))
      return
    }
    const req = indexedDB.open(DB_NAME, DB_VERSION)
    req.onupgradeneeded = () => {
      const db = req.result
      if (!db.objectStoreNames.contains(STORE)) {
        const store = db.createObjectStore(STORE, { keyPath: 'id' })
        store.createIndex('createdAt', 'createdAt')
      }
    }
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })
}

export async function enqueue(action: Omit<QueuedAction, 'id' | 'createdAt' | 'attempts'>): Promise<string> {
  const db = await openDB()
  const id = 'q_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8)
  const item: QueuedAction = {
    ...action,
    id,
    createdAt: Date.now(),
    attempts: 0,
  }
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite')
    tx.objectStore(STORE).put(item)
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
  })
  return id
}

export async function list(): Promise<QueuedAction[]> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readonly')
    const req = tx.objectStore(STORE).getAll()
    req.onsuccess = () => resolve((req.result as QueuedAction[]).sort((a, b) => a.createdAt - b.createdAt))
    req.onerror = () => reject(req.error)
  })
}

export async function remove(id: string): Promise<void> {
  const db = await openDB()
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite')
    tx.objectStore(STORE).delete(id)
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
  })
}

export async function count(): Promise<number> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readonly')
    const req = tx.objectStore(STORE).count()
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })
}

export async function clearAll(): Promise<void> {
  const db = await openDB()
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite')
    tx.objectStore(STORE).clear()
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
  })
}

/**
 * Flush queue — try to send each pending action.
 * Returns { success, failed }.
 */
export async function flush(): Promise<{ success: number; failed: number }> {
  const items = await list()
  let success = 0
  let failed = 0

  for (const item of items) {
    try {
      const res = await fetch(item.endpoint, {
        method: item.method,
        headers: { 'Content-Type': 'application/json' },
        body: item.method === 'DELETE' ? undefined : JSON.stringify(item.payload),
      })
      if (res.ok) {
        await remove(item.id)
        success++
      } else {
        failed++
      }
    } catch {
      failed++
    }
  }
  return { success, failed }
}
