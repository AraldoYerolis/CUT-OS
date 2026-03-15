import { useState } from 'react'
import { useStore, selectUser } from '../../store'
import type { FoodInputContext } from '../../services/foodInput/FoodInputService'
import { Input } from '../../components/ui/Input'
import { Button } from '../../components/ui/Button'
import { MealSlotPicker } from './MealSlotPicker'
import { generateId } from '../../utils/id'
import {
  PRESET_FOOD_BY_ID,
  DEFAULT_QUICK_PRESET_IDS,
  type PresetFood,
} from '../../domain/foodPresets'
import { searchFoods, type SearchableFood } from '../../domain/searchFoods'
import type { FoodItem, MealSlot } from '../../domain/types'
import styles from './QuickAddPanel.module.css'

export function QuickAddPanel({ onConfirm }: FoodInputContext) {
  const user = useStore(selectUser)

  // ─── Direct-entry state (unchanged) ───────────────────────────────────
  const [calories, setCalories] = useState('')
  const [protein, setProtein]   = useState('')
  const [carbs, setCarbs]       = useState('')
  const [fat, setFat]           = useState('')
  const [label, setLabel]       = useState('')
  const [slot, setSlot]         = useState<MealSlot>('untagged')
  const [calError, setCalError] = useState('')

  // ─── Search state (additive) ───────────────────────────────────────────
  const [searchQuery, setSearchQuery]     = useState('')
  const [selectedFood, setSelectedFood]   = useState<SearchableFood | null>(null)

  // Derived: compute results only while typing (no selected food yet)
  const showResults  = searchQuery.length >= 1 && selectedFood === null
  const searchResults = showResults ? searchFoods(searchQuery, 8) : []

  // ─── Helpers ──────────────────────────────────────────────────────────

  // Shared fill logic used by both search-select and preset chips
  function fillForm(cal: number, pro: number, car: number, f: number, name: string) {
    setCalories(String(cal))
    setProtein(String(pro))
    setCarbs(String(car))
    setFat(String(f))
    setLabel(name)
    setCalError('')
  }

  function applySearchFood(food: SearchableFood) {
    const fullName = food.descriptor ? `${food.name} ${food.descriptor}` : food.name
    fillForm(food.calories, food.protein, food.carbs, food.fat, fullName)
    setSelectedFood(food)
    setSearchQuery('')  // collapse results list
  }

  function clearSearch() {
    setSelectedFood(null)
    setSearchQuery('')
    setCalories('')
    setProtein('')
    setCarbs('')
    setFat('')
    setLabel('')
    setCalError('')
  }

  // Preset chips still use applyPreset (unchanged behavior)
  function applyPreset(preset: PresetFood) {
    fillForm(preset.calories, preset.protein, preset.carbs, preset.fat, preset.name)
    setSelectedFood(null)
    setSearchQuery('')
  }

  // ─── Preset chips from user preferences (unchanged logic) ─────────────
  const presets: PresetFood[] = (() => {
    const prefs = user?.foodPreferences
    const ids = prefs && prefs.selectedFoods.length > 0
      ? prefs.selectedFoods
      : DEFAULT_QUICK_PRESET_IDS

    const excluded = new Set((prefs?.excludedFoods ?? []).map(e => e.toLowerCase()))
    const exclusionMap: Record<string, string[]> = {
      dairy:      ['greek_yogurt', 'cottage_cheese', 'cheese', 'whey_protein'],
      eggs:       ['eggs'],
      nuts:       ['almonds', 'peanut_butter'],
      soy:        ['whey_protein'],
      gluten:     ['bread', 'pasta', 'oats'],
      'red meat': ['ground_beef'],
      pork:       [],
      shellfish:  [],
    }
    const blockedIds = new Set<string>()
    for (const [excl, foodIds] of Object.entries(exclusionMap)) {
      if (excluded.has(excl)) foodIds.forEach(id => blockedIds.add(id))
    }

    return ids
      .filter(id => !blockedIds.has(id))
      .map(id => PRESET_FOOD_BY_ID.get(id))
      .filter((f): f is PresetFood => f !== undefined)
  })()

  // ─── Submit (unchanged) ────────────────────────────────────────────────
  function handleSubmit() {
    const cal = Math.round(parseFloat(calories))
    if (!calories || isNaN(cal) || cal <= 0) {
      setCalError('Enter a calorie amount')
      return
    }
    setCalError('')

    const food: FoodItem = {
      id: generateId(),
      name: label.trim() || 'Quick Add',
      macros: {
        calories: cal,
        protein: Math.max(0, parseFloat(protein) || 0),
        carbs: Math.max(0, parseFloat(carbs) || 0),
        fat: Math.max(0, parseFloat(fat) || 0),
      },
      servingSizeG: 100,
      source: 'quickadd',
      createdAt: new Date().toISOString(),
    }
    onConfirm(food, 100, slot)
  }

  // ─── Selected food display string ─────────────────────────────────────
  const selectedFoodLabel = selectedFood
    ? [selectedFood.name, selectedFood.descriptor].filter(Boolean).join(' — ')
    : null

  return (
    <>
      <div className={styles.scrollContent}>
        <p className={styles.hint}>Fast macro entry — nothing saved to your food library.</p>

        {/* ── Search field (additive) ── */}
        <div className={styles.searchWrap}>
          <div className={styles.searchRow}>
            <input
              type="search"
              className={styles.searchInput}
              placeholder="Search foods…"
              value={searchQuery}
              onChange={e => {
                setSearchQuery(e.target.value)
                if (selectedFood) setSelectedFood(null)
              }}
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="off"
              spellCheck={false}
            />
            {(searchQuery.length > 0 || selectedFood !== null) && (
              <button
                type="button"
                className={styles.searchClear}
                onClick={clearSearch}
                aria-label="Clear search"
              >
                ✕
              </button>
            )}
          </div>

          {/* Selected food badge */}
          {selectedFood !== null && (
            <div className={styles.selectedBadge}>
              <span className={styles.selectedBadgeName}>{selectedFoodLabel}</span>
              <span className={styles.selectedBadgeCal}>{selectedFood.calories} kcal</span>
            </div>
          )}

          {/* Live results */}
          {showResults && (
            <ul className={styles.searchResults} role="listbox">
              {searchResults.length > 0 ? (
                searchResults.map(food => {
                  const displayName = food.descriptor
                    ? <>{food.name} <span className={styles.resultDesc}>{food.descriptor}</span></>
                    : food.name
                  return (
                    <li key={food.id} role="option" aria-selected={false}>
                      <button
                        type="button"
                        className={styles.resultItem}
                        onClick={() => applySearchFood(food)}
                      >
                        <span className={styles.resultName}>{displayName}</span>
                        <span className={styles.resultCal}>{food.calories} kcal</span>
                      </button>
                    </li>
                  )
                })
              ) : (
                <li className={styles.resultEmpty}>No matches for "{searchQuery}"</li>
              )}
            </ul>
          )}
        </div>

        {/* Preset chips (unchanged) */}
        {presets.length > 0 && (
          <div className={styles.presets}>
            {presets.map(preset => (
              <button
                key={preset.id}
                type="button"
                className={styles.presetChip}
                onClick={() => applyPreset(preset)}
              >
                {preset.name}
                <span className={styles.presetCal}>{preset.calories} kcal</span>
              </button>
            ))}
          </div>
        )}

        {/* Direct-entry fields (unchanged) */}
        <Input
          label="Calories"
          value={calories}
          onChange={(e) => setCalories(e.target.value)}
          inputMode="numeric"
          pattern="[0-9]*"
          error={calError}
          rightElement={<span>kcal</span>}
        />
        <Input
          label="Protein"
          value={protein}
          onChange={(e) => setProtein(e.target.value)}
          inputMode="decimal"
          placeholder="0"
          rightElement={<span>g</span>}
        />
        <Input
          label="Carbs"
          value={carbs}
          onChange={(e) => setCarbs(e.target.value)}
          inputMode="decimal"
          placeholder="0"
          rightElement={<span>g</span>}
        />
        <Input
          label="Fat"
          value={fat}
          onChange={(e) => setFat(e.target.value)}
          inputMode="decimal"
          placeholder="0"
          rightElement={<span>g</span>}
        />
        <Input
          label="Name (optional)"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          placeholder="e.g. Afternoon snack"
          autoComplete="off"
        />
        <MealSlotPicker value={slot} onChange={setSlot} />
      </div>
      <div className={styles.footer}>
        <Button variant="primary" size="lg" full onClick={handleSubmit}>
          Quick Log
        </Button>
      </div>
    </>
  )
}
