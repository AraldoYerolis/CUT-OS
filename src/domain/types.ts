// ─── Macros ───────────────────────────────────────────────────────────────

export interface MacroTargets {
  calories: number
  protein: number
  carbs: number
  fat: number
}

export interface MacroSnapshot {
  calories: number
  protein: number
  carbs: number
  fat: number
}

export interface MacrosPer100g {
  calories: number
  protein: number
  carbs: number
  fat: number
  fiber?: number
  sugar?: number
  sodium?: number
}

// ─── User ─────────────────────────────────────────────────────────────────

export interface UserProfile {
  id: string
  name: string
  targets: MacroTargets
  bodyweightKg?: number
  goalContext?: 'cut' | 'maintain' | 'bulk'
  units: 'metric' | 'imperial'
  createdAt: string
}

// ─── Food ─────────────────────────────────────────────────────────────────

export type FoodSource = 'manual' | 'barcode' | 'search' | 'quickadd'

export interface FoodItem {
  id: string
  name: string
  brand?: string
  barcode?: string
  macros: MacrosPer100g
  servingSizeG: number
  servingLabel?: string
  source: FoodSource
  createdAt: string
}

// ─── Log ──────────────────────────────────────────────────────────────────

export type MealSlot = 'breakfast' | 'lunch' | 'dinner' | 'snack' | 'untagged'

export interface LoggedFood {
  id: string
  date: string
  foodItem: FoodItem
  quantityG: number
  macros: MacroSnapshot
  mealSlot: MealSlot
  loggedAt: string
  fromTemplate?: string
}

// ─── Templates ────────────────────────────────────────────────────────────

export interface TemplateItem {
  foodItem: FoodItem
  quantityG: number
  mealSlot: MealSlot
}

export interface MealTemplate {
  id: string
  name: string
  items: TemplateItem[]
  createdAt: string
  lastUsedAt?: string
}

// ─── Settings ─────────────────────────────────────────────────────────────

export interface AppSettings {
  theme: 'dark'
  units: 'metric' | 'imperial'
  defaultMealSlot: MealSlot
  showMacroRings: boolean
}

// ─── Food Input ───────────────────────────────────────────────────────────

export type FoodInputMode =
  | 'recent'
  | 'favorites'
  | 'manual'
  | 'quickAdd'
  | 'mealTemplate'
  | 'scan'
  | 'search'
