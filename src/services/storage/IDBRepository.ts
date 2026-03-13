import { openDB, type IDBPDatabase } from 'idb'
import type { StorageRepository } from './StorageRepository'

const DB_NAME = 'cutos-db'
const DB_VERSION = 1
const STORE_NAME = 'cutos-store'

/**
 * IndexedDB-backed storage repository.
 * Stores string values (JSON-serialized) keyed by string.
 * Single object store — simple key/value shape.
 * Upgrade schema by bumping DB_VERSION and adding migration logic.
 */
export class IDBRepository implements StorageRepository {
  private dbPromise: Promise<IDBPDatabase>

  constructor() {
    this.dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME)
        }
      },
    })
  }

  async getItem(key: string): Promise<string | null> {
    const db = await this.dbPromise
    const value = await db.get(STORE_NAME, key)
    return typeof value === 'string' ? value : null
  }

  async setItem(key: string, value: string): Promise<void> {
    const db = await this.dbPromise
    await db.put(STORE_NAME, value, key)
  }

  async removeItem(key: string): Promise<void> {
    const db = await this.dbPromise
    await db.delete(STORE_NAME, key)
  }

  async clear(): Promise<void> {
    const db = await this.dbPromise
    await db.clear(STORE_NAME)
  }
}
