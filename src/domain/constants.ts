import type { MealSlot, AppSettings, MacroTargets } from './types'

export const MEAL_SLOT_LABELS: Record<MealSlot, string> = {
  breakfast: 'Breakfast',
  lunch: 'Lunch',
  dinner: 'Dinner',
  snack: 'Snack',
  untagged: 'Other',
}

// 'snack' is intentionally excluded from the picker — consolidated into 'untagged' (Other).
// It remains in MealSlot and MEAL_SLOT_LABELS so existing logged entries still display.
export const MEAL_SLOTS: MealSlot[] = [
  'breakfast',
  'lunch',
  'dinner',
  'untagged',
]

export const DEFAULT_TARGETS: MacroTargets = {
  calories: 2000,
  protein: 150,
  carbs: 200,
  fat: 65,
}

export const DEFAULT_SETTINGS: AppSettings = {
  theme: 'dark',
  units: 'metric',
  defaultMealSlot: 'untagged',
  showMacroRings: true,
}

export const MAX_RECENTS = 20

export const STORAGE_KEYS = {
  STATE: 'cutos:state',
} as const
