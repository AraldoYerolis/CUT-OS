import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { IDBRepository } from '../services/storage/IDBRepository'
import { DEFAULT_SETTINGS, DEFAULT_TARGETS } from '../domain/constants'
import { toDateKey } from '../utils/date'
import type {
  UserProfile,
  LoggedFood,
  FoodItem,
  MealTemplate,
  AppSettings,
  FoodInputMode,
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
  mode: 'recent',
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

      openFoodInput: (mode = 'recent') =>
        set({ foodInput: { isOpen: true, mode } }),

      closeFoodInput: () =>
        set({ foodInput: { isOpen: false, mode: 'recent' } }),

      setFoodInputMode: (mode) =>
        set((state) => ({ foodInput: { ...state.foodInput, mode } })),
    }),
    {
      name: 'cutos:state',
      storage: idbStorage,
      // Exclude transient UI state from persistence
      partialize: (state) => ({
        user: state.user,
        onboardingComplete: state.onboardingComplete,
        logs: state.logs,
        activeDate: state.activeDate,
        favorites: state.favorites,
        recents: state.recents,
        templates: state.templates,
        settings: state.settings,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated(true)
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
