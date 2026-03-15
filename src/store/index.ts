import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { IDBRepository } from '../services/storage/IDBRepository'
import { DEFAULT_SETTINGS, DEFAULT_TARGETS, MAX_RECENTS } from '../domain/constants'
import { toDateKey } from '../utils/date'
import { computeMacros } from '../domain/calculations'
import { generateId } from '../utils/id'
import type {
  UserProfile,
  LoggedFood,
  FoodItem,
  MealTemplate,
  AppSettings,
  FoodInputMode,
  MacroTargets,
  MealSlot,
  SavedFood,
  MyMeal,
  MealItem,
} from '../domain/types'

// ─── State shape ──────────────────────────────────────────────────────────

interface FoodInputState {
  isOpen: boolean
  mode: FoodInputMode
}

export interface AppState {
  // Hydration flag — false until IDB rehydrates the store
  isHydrated: boolean

  // User
  user: UserProfile | null
  onboardingComplete: boolean

  // Log — keyed by YYYY-MM-DD
  logs: Record<string, LoggedFood[]>
  activeDate: string

  // Library
  favorites: FoodItem[]
  recents: FoodItem[]
  templates: MealTemplate[]
  myFoods: SavedFood[]          // Phase 13 — saved reusable foods
  myMeals: MyMeal[]             // Phase 14 — saved multi-food meals

  // Settings
  settings: AppSettings

  // Food input UI state (not persisted)
  foodInput: FoodInputState
}

// ─── Actions ──────────────────────────────────────────────────────────────

interface AppActions {
  setHydrated(hydrated: boolean): void

  // Onboarding
  completeOnboarding(profile: UserProfile): void

  // Profile / targets
  updateProfile(name: string, targets: MacroTargets): void

  // Log
  addLogEntry(entry: LoggedFood): void
  updateLogEntry(entry: LoggedFood): void
  deleteLogEntry(id: string, date: string): void

  // Recents & Favorites
  addToRecents(food: FoodItem): void
  addToFavorites(food: FoodItem): void
  removeFromFavorites(id: string): void

  // My Foods (Phase 13)
  saveToMyFoods(food: FoodItem): void
  removeFromMyFoods(id: string): void

  // My Meals (Phase 14)
  saveMyMeal(meal: MyMeal): void
  deleteMyMeal(id: string): void
  logMyMeal(mealId: string, date: string, slot: MealSlot): void

  // Templates
  saveTemplate(template: MealTemplate): void
  deleteTemplate(id: string): void
  applyTemplate(templateId: string, date: string): void

  // Food input sheet
  openFoodInput(mode?: FoodInputMode): void
  closeFoodInput(): void
  setFoodInputMode(mode: FoodInputMode): void
}

export type AppStore = AppState & AppActions

// ─── Storage adapter ──────────────────────────────────────────────────────

const repository = new IDBRepository()

const idbStorage = createJSONStorage(() => repository)

// ─── Initial state ────────────────────────────────────────────────────────

const initialFoodInput: FoodInputState = {
  isOpen: false,
  mode: 'manual',
}

// ─── Store ────────────────────────────────────────────────────────────────

export const useStore = create<AppStore>()(
  persist(
    (set) => ({
      // State
      isHydrated: false,
      user: null,
      onboardingComplete: false,
      logs: {},
      activeDate: toDateKey(),
      favorites: [],
      recents: [],
      templates: [],
      myFoods: [],
      myMeals: [],
      settings: { ...DEFAULT_SETTINGS },
      foodInput: { ...initialFoodInput },

      // Actions
      setHydrated: (hydrated) => set({ isHydrated: hydrated }),

      completeOnboarding: (profile) =>
        set({ user: profile, onboardingComplete: true }),

      updateProfile: (name, targets) =>
        set((state) => ({
          user: state.user ? { ...state.user, name, targets } : state.user,
        })),

      addLogEntry: (entry) =>
        set((state) => {
          const existing = state.logs[entry.date] ?? []
          return { logs: { ...state.logs, [entry.date]: [...existing, entry] } }
        }),

      updateLogEntry: (entry) =>
        set((state) => {
          const existing = state.logs[entry.date] ?? []
          return {
            logs: {
              ...state.logs,
              [entry.date]: existing.map((e) => (e.id === entry.id ? entry : e)),
            },
          }
        }),

      deleteLogEntry: (id, date) =>
        set((state) => {
          const existing = state.logs[date] ?? []
          return {
            logs: {
              ...state.logs,
              [date]: existing.filter((e) => e.id !== id),
            },
          }
        }),

      addToRecents: (food) =>
        set((state) => {
          const nameKey = food.name.trim().toLowerCase()
          const filtered = state.recents.filter(
            (f) => f.name.trim().toLowerCase() !== nameKey
          )
          return { recents: [food, ...filtered].slice(0, MAX_RECENTS) }
        }),

      addToFavorites: (food) =>
        set((state) => {
          if (state.favorites.some((f) => f.id === food.id)) return state
          return { favorites: [...state.favorites, food] }
        }),

      removeFromFavorites: (id) =>
        set((state) => ({
          favorites: state.favorites.filter((f) => f.id !== id),
        })),

      // Phase 13 — My Foods
      saveToMyFoods: (food) =>
        set((state) => {
          const nameKey = food.name.trim().toLowerCase()
          const now = new Date().toISOString()
          // If a food with the same name already exists, bump useCount only
          const existing = state.myFoods.find(
            (f) => f.name.trim().toLowerCase() === nameKey
          )
          if (existing) {
            return {
              myFoods: state.myFoods.map((f) =>
                f.id === existing.id
                  ? { ...f, useCount: f.useCount + 1, lastUsedAt: now }
                  : f
              ),
            }
          }
          const saved: SavedFood = {
            id: food.id,
            name: food.name,
            brand: food.brand,
            barcode: food.barcode,
            calories: food.macros.calories,
            protein: food.macros.protein,
            carbs: food.macros.carbs,
            fat: food.macros.fat,
            source: food.source,
            savedAt: now,
            useCount: 1,
            lastUsedAt: now,
          }
          return { myFoods: [saved, ...state.myFoods] }
        }),

      removeFromMyFoods: (id) =>
        set((state) => ({
          myFoods: state.myFoods.filter((f) => f.id !== id),
        })),

      // Phase 14 — My Meals
      saveMyMeal: (meal) =>
        set((state) => ({
          myMeals: [meal, ...state.myMeals],
        })),

      deleteMyMeal: (id) =>
        set((state) => ({
          myMeals: state.myMeals.filter((m) => m.id !== id),
        })),

      logMyMeal: (mealId, date, slot) =>
        set((state) => {
          const meal = state.myMeals.find((m) => m.id === mealId)
          if (!meal) return state
          const now = new Date().toISOString()
          const newEntries: LoggedFood[] = meal.items.map((item: MealItem) => {
            const foodItem: FoodItem = {
              id: generateId(),
              name: item.name,
              macros: {
                calories: item.calories,
                protein: item.protein,
                carbs: item.carbs,
                fat: item.fat,
              },
              servingSizeG: 100,
              source: 'manual',
              createdAt: now,
            }
            return {
              id: generateId(),
              date,
              foodItem,
              quantityG: 100,
              macros: {
                calories: item.calories,
                protein: item.protein,
                carbs: item.carbs,
                fat: item.fat,
              },
              mealSlot: slot,
              loggedAt: now,
            }
          })
          const existing = state.logs[date] ?? []
          return {
            logs: { ...state.logs, [date]: [...existing, ...newEntries] },
            myMeals: state.myMeals.map((m) =>
              m.id === mealId
                ? { ...m, useCount: m.useCount + 1, lastUsedAt: now }
                : m
            ),
          }
        }),

      saveTemplate: (template) =>
        set((state) => ({
          templates: [template, ...state.templates],
        })),

      deleteTemplate: (id) =>
        set((state) => ({
          templates: state.templates.filter((t) => t.id !== id),
        })),

      applyTemplate: (templateId, date) =>
        set((state) => {
          const template = state.templates.find((t) => t.id === templateId)
          if (!template) return state
          const now = new Date().toISOString()
          const newEntries: LoggedFood[] = template.items.map((item) => ({
            id: generateId(),
            date,
            foodItem: item.foodItem,
            quantityG: item.quantityG,
            macros: computeMacros(item.foodItem.macros, item.quantityG),
            mealSlot: item.mealSlot,
            loggedAt: now,
            fromTemplate: templateId,
          }))
          const existing = state.logs[date] ?? []
          return {
            logs: { ...state.logs, [date]: [...existing, ...newEntries] },
            templates: state.templates.map((t) =>
              t.id === templateId ? { ...t, lastUsedAt: now } : t
            ),
          }
        }),

      openFoodInput: (mode = 'manual') =>
        set({ foodInput: { isOpen: true, mode } }),

      closeFoodInput: () =>
        set({ foodInput: { isOpen: false, mode: 'manual' } }),

      setFoodInputMode: (mode) =>
        set((state) => ({ foodInput: { ...state.foodInput, mode } })),
    }),
    {
      name: 'cutos:state',
      storage: idbStorage,
      // Exclude transient UI state and session-only values from persistence
      partialize: (state) => ({
        user: state.user,
        onboardingComplete: state.onboardingComplete,
        logs: state.logs,
        // activeDate intentionally excluded — always reset to today on launch
        favorites: state.favorites,
        recents: state.recents,
        templates: state.templates,
        myFoods: state.myFoods,
        myMeals: state.myMeals,
        settings: state.settings,
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.setHydrated(true)
        } else {
          // IDB failed — prevent app hanging on loading screen
          // Safe: this callback fires async, useStore is fully assigned by then
          useStore.getState().setHydrated(true)
        }
      },
    }
  )
)

// ─── Convenience selectors ────────────────────────────────────────────────

export const selectUser = (s: AppStore) => s.user
export const selectOnboardingComplete = (s: AppStore) => s.onboardingComplete
export const selectIsHydrated = (s: AppStore) => s.isHydrated
export const selectActiveDate = (s: AppStore) => s.activeDate
export const selectFoodInput = (s: AppStore) => s.foodInput
export const selectSettings = (s: AppStore) => s.settings
// Memoise derived targets so the selector returns a stable object reference.
// useSyncExternalStore (used by Zustand v5) calls getSnapshot() after every
// render and uses Object.is to detect changes. Returning `{ ...t, calories }`
// would always produce a new reference → infinite re-render loop → black screen.
// We only recompute when the underlying user.targets object actually changes.
let _cachedTargetsInput: MacroTargets | null = null
let _cachedTargetsOutput: MacroTargets | null = null

export const selectTargets = (s: AppStore): MacroTargets => {
  const t = s.user?.targets ?? DEFAULT_TARGETS
  if (t !== _cachedTargetsInput || _cachedTargetsOutput === null) {
    _cachedTargetsInput = t
    _cachedTargetsOutput = {
      ...t,
      // Calories are always derived from macros (Atwater: P×4 + C×4 + F×9).
      // Safe-coerce each value so old/missing stored data never produces NaN.
      calories: Math.round(
        (Number(t.protein) || 0) * 4 +
        (Number(t.carbs)   || 0) * 4 +
        (Number(t.fat)     || 0) * 9
      ),
    }
  }
  return _cachedTargetsOutput
}
export const selectLogsForDate = (date: string) => (s: AppStore) =>
  s.logs[date] ?? []
export const selectRecents = (s: AppStore) => s.recents
export const selectFavorites = (s: AppStore) => s.favorites
export const selectTemplates = (s: AppStore) => s.templates
export const selectMyFoods = (s: AppStore) => s.myFoods
export const selectMyMeals = (s: AppStore) => s.myMeals
