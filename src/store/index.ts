import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { IDBRepository } from '../services/storage/IDBRepository'
import { DEFAULT_SETTINGS, DEFAULT_TARGETS, MAX_RECENTS } from '../domain/constants'
import { toDateKey } from '../utils/date'
import type {
  UserProfile,
  LoggedFood,
  FoodItem,
  MealTemplate,
  AppSettings,
  FoodInputMode,
  MacroTargets,
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
export const selectTargets = (s: AppStore) =>
  s.user?.targets ?? DEFAULT_TARGETS
export const selectLogsForDate = (date: string) => (s: AppStore) =>
  s.logs[date] ?? []
export const selectRecents = (s: AppStore) => s.recents
export const selectFavorites = (s: AppStore) => s.favorites
