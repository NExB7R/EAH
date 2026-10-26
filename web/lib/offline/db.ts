// ═══════════════════════════════════════════════════════════
// EAH — Offline DB (IndexedDB wrapper)
// صفر مكتبات خارجية — IndexedDB APIs أصلية
// ═══════════════════════════════════════════════════════════

const DB_NAME = 'eah-offline'
const DB_VERSION = 2

export const STORES = {
  businesses: 'businesses',
  pending: 'pending',
  meta: 'meta',
} as const

let dbPromise: Promise<IDBDatabase> | null = null

export function openDB(): Promise<IDBDatabase> {
  if (typeof indexedDB === 'undefined') {
    return Promise.reject(new Error('IndexedDB not available'))
  }
  if (dbPromise) return dbPromise

  dbPromise = new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION)

    req.onupgradeneeded = (event) => {
      const db = req.result

      if (!db.objectStoreNames.contains(STORES.businesses)) {
        db.createObjectStore(STORES.businesses, { keyPath: 'slug' })
      } else if (event.oldVersion < 2) {
        // Purge old business details that cached branch phone/WhatsApp values before
        // the contact-reveal change. Keep pending offline actions and metadata intact.
        req.transaction?.objectStore(STORES.businesses).clear()
      }
      if (!db.objectStoreNames.contains(STORES.pending)) {
        const store = db.createObjectStore(STORES.pending, {
          keyPath: 'id',
          autoIncrement: true,
        })
        store.createIndex('createdAt', 'createdAt')
      }
      if (!db.objectStoreNames.contains(STORES.meta)) {
        db.createObjectStore(STORES.meta, { keyPath: 'key' })
      }
    }

    req.onsuccess = () => {
      const db = req.result
      db.onversionchange = () => {
        db.close()
        dbPromise = null
      }
      resolve(db)
    }
    req.onerror = () => reject(req.error)
  })

  return dbPromise
}

export async function idbGet<T>(store: string, key: string): Promise<T | null> {
  try {
    const db = await openDB()
    return await new Promise((resolve, reject) => {
      const tx = db.transaction(store, 'readonly')
      const req = tx.objectStore(store).get(key)
      req.onsuccess = () => resolve((req.result as T) ?? null)
      req.onerror = () => reject(req.error)
    })
  } catch {
    return null
  }
}

export async function idbSet<T>(store: string, value: T): Promise<void> {
  try {
    const db = await openDB()
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(store, 'readwrite')
      tx.objectStore(store).put(value)
      tx.oncomplete = () => resolve()
      tx.onerror = () => reject(tx.error)
    })
  } catch {
    /* ignore */
  }
}

export async function idbDelete(store: string, key: string | number): Promise<void> {
  try {
    const db = await openDB()
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(store, 'readwrite')
      tx.objectStore(store).delete(key)
      tx.oncomplete = () => resolve()
      tx.onerror = () => reject(tx.error)
    })
  } catch {
    /* ignore */
  }
}

export async function idbGetAll<T>(store: string): Promise<T[]> {
  try {
    const db = await openDB()
    return await new Promise((resolve, reject) => {
      const tx = db.transaction(store, 'readonly')
      const req = tx.objectStore(store).getAll()
      req.onsuccess = () => resolve((req.result as T[]) ?? [])
      req.onerror = () => reject(req.error)
    })
  } catch {
    return []
  }
}

export async function idbClear(store: string): Promise<void> {
  try {
    const db = await openDB()
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(store, 'readwrite')
      tx.objectStore(store).clear()
      tx.oncomplete = () => resolve()
      tx.onerror = () => reject(tx.error)
    })
  } catch {
    /* ignore */
  }
}
