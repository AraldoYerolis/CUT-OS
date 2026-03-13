/**
 * Async-first storage contract.
 * All implementations must be async — this prevents painful
 * refactors when migrating from IDB to a backend cache layer.
 */
export interface StorageRepository {
  getItem(key: string): Promise<string | null>
  setItem(key: string, value: string): Promise<void>
  removeItem(key: string): Promise<void>
  clear(): Promise<void>
}
