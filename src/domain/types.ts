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

export interface FoodPreferences {
  selectedFoods: string[]   // preset food IDs chosen during onboarding
  excludedFoods: string[]   // exclusion labels e.g. 'Dairy'
}

export interface UserProfile {
  id: string
  name: string
  targets: MacroTargets
  bodyweightKg?: number
  goalContext?: 'cut' | 'maintain' | 'bulk'
  units: 'metric' | 'imperial'
  createdAt: string
  foodPreferences?: FoodPreferences  // optional — absent for existing users
}

// ─── My Foods (Phase 13) ───────────────────────────────────────────────────
// Saved reusable foods for fast repeat logging.
// Macros are serving-level totals (same convention as Quick Add / Manual Add).

export interface SavedFood {
  id: string
  name: string
  brand?: string
  barcode?: string
  calories: number   // serving total
  protein: number
  carbs: number
  fat: number
  source: FoodSource
  savedAt: string
  useCount: number
  lastUsedAt?: string
}

// ─── My Meals (Phase 14) ──────────────────────────────────────────────────
// Saved multi-food meals for one-tap logging.
// Each MealItem stores serving-level macro totals (not per-100g).

export interface MealItem {
  id: string
  name: string
  calories: number
  protein: number
  carbs: number
  fat: number
  // Optional — present when the item was added via search or My Foods.
  // amount is the user-entered serving quantity; unit is the matching unit
  // (e.g. 200 g, 1 serving). Absent for items saved before Phase 14.2.
  amount?: number
  unit?: string
}

export interface MyMeal {
  id: string
  name: string
  items: MealItem[]
  createdAt: string
  useCount: number
  lastUsedAt?: string
}

// ─── Food ─────────────────────────────────────────────────────────────────

export type FoodSource = 'manual' | 'barcode' | 'search' | 'quickadd' | 'labelscan'

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
  // Links back to the SEARCHABLE_FOODS entry this item was created from.
  // Used to resolve fresh per-100g macros when displaying templates/meals.
  searchFoodId?: string
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
  | 'myFoods'
  | 'myMeals'
  | 'manual'
  | 'quickAdd'
  | 'mealTemplate'
  | 'scan'
  | 'search'
