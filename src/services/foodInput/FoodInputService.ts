import type { ComponentType } from 'react'
import type { FoodInputMode, FoodItem, MealSlot } from '../../domain/types'

// ─── Interfaces ───────────────────────────────────────────────────────────

export interface FoodInputContext {
  onConfirm: (food: FoodItem, quantity: number, slot: MealSlot) => void
  onCancel: () => void
}

export interface FoodInputHandler {
  mode: FoodInputMode
  label: string
  /**
   * true = shown in the UI tab bar.
   * false = architecture registered, invisible to user until ready.
   */
  isReady: boolean
  Panel: ComponentType<FoodInputContext>
}

// ─── Registry ─────────────────────────────────────────────────────────────

const handlers = new Map<FoodInputMode, FoodInputHandler>()

export function registerFoodInputHandler(handler: FoodInputHandler): void {
  handlers.set(handler.mode, handler)
}

export function requestInput(mode: FoodInputMode): FoodInputHandler | null {
  return handlers.get(mode) ?? null
}

/** Modes visible to the user — isReady: true only */
export function getReadyModes(): FoodInputHandler[] {
  return [...handlers.values()].filter((h) => h.isReady)
}

/** All registered modes — for internal/debugging use */
export function getAllModes(): FoodInputHandler[] {
  return [...handlers.values()]
}
