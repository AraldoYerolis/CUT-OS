import { useState } from 'react'
import {
  useStore,
  selectUser,
  selectRecents,
  selectFavorites,
  selectMyFoods,
} from '../../store'
import type { FoodInputContext } from '../../services/foodInput/FoodInputService'
import { Input } from '../../components/ui/Input'
import { Button } from '../../components/ui/Button'
import { MealSlotPicker } from './MealSlotPicker'
import { generateId } from '../../utils/id'
import {
  PRESET_FOOD_BY_ID,
  DEFAULT_QUICK_PRESET_IDS,
} from '../../domain/foodPresets'
import { searchFoods, type SearchableFood } from '../../domain/searchFoods'
import type { FoodItem, MealSlot, SavedFood } from '../../domain/types'
import styles from './QuickAddPanel.module.css'

// ─── Personalized shortcut chips ─────────────────────────────────────────
// Unified shape for all chip sources (recents, favorites, my foods, fallback).
interface QuickChip {
  id: string
  name: string
  calories: number
  protein: number
  carbs: number
  fat: number
}

function buildShortcuts(
  recents: FoodItem[],
  favorites: FoodItem[],
  myFoods: SavedFood[],
  maxTotal = 6,
): QuickChip[] {
  const seen = new Set<string>()
  const chips: QuickChip[] = []

  function fromFoodItem(food: FoodItem): QuickChip {
    const s = food.servingSizeG
    return {
      id:       food.id,
      name:     food.name,
      calories: Math.round(food.macros.calories * s / 100),
      protein:  Math.round(food.macros.protein  * s / 100 * 10) / 10,
      carbs:    Math.round(food.macros.carbs    * s / 100 * 10) / 10,
      fat:      Math.round(food.macros.fat      * s / 100 * 10) / 10,
    }
  }

  function tryAdd(chip: QuickChip) {
    if (chips.length >= maxTotal) return
    const key = chip.name.trim().toLowerCase()
    if (seen.has(key)) return
    seen.add(key)
    chips.push(chip)
  }

  // Tier 1: 3 most recent foods
  for (const f of recents.slice(0, 3)) tryAdd(fromFoodItem(f))

  // Tier 2: first 2 favorites
  for (const f of favorites.slice(0, 2)) tryAdd(fromFoodItem(f))

  // Tier 3: most-used My Foods (sorted by lastUsedAt/savedAt)
  const sortedMyFoods = [...myFoods].sort((a, b) =>
    (b.lastUsedAt ?? b.savedAt).localeCompare(a.lastUsedAt ?? a.savedAt)
  )
  for (const f of sortedMyFoods.slice(0, 3)) {
    tryAdd({ id: f.id, name: f.name, calories: f.calories, protein: f.protein, carbs: f.carbs, fat: f.fat })
  }

  // Tier 4: static fallback — only used when user has almost no data
  if (chips.length < 2) {
    for (const id of DEFAULT_QUICK_PRESET_IDS) {
      if (chips.length >= maxTotal) break
      const p = PRESET_FOOD_BY_ID.get(id)
      if (!p) continue
      tryAdd({ id: p.id, name: p.name, calories: p.calories, protein: p.protein, carbs: p.carbs, fat: p.fat })
    }
  }

  return chips
}

// Round to 1 decimal, strip trailing .0 → "31" not "31.0"
function roundMacro(v: number): string {
  const r = Math.round(v * 10) / 10
  return r % 1 === 0 ? String(Math.round(r)) : String(r)
}

export function QuickAddPanel({ onConfirm }: FoodInputContext) {
  const user      = useStore(selectUser)
  const recents   = useStore(selectRecents)
  const favorites = useStore(selectFavorites)
  const myFoods   = useStore(selectMyFoods)

  // ─── Direct-entry state (unchanged) ───────────────────────────────────
  const [calories, setCalories] = useState('')
  const [protein, setProtein]   = useState('')
  const [carbs, setCarbs]       = useState('')
  const [fat, setFat]           = useState('')
  const [label, setLabel]       = useState('')
  const [slot, setSlot]         = useState<MealSlot>('untagged')
  const [calError, setCalError] = useState('')

  // ─── Search state (Phase 12A) ──────────────────────────────────────────
  const [searchQuery, setSearchQuery]   = useState('')
  const [selectedFood, setSelectedFood] = useState<SearchableFood | null>(null)

  // ─── Quantity state (Phase 12B — only active when selectedFood !== null) ─
  const [quantity, setQuantity] = useState('')

  // Derived
  const showResults   = searchQuery.length >= 1 && selectedFood === null
  const searchResults = showResults ? searchFoods(searchQuery, 8) : []

  // ─── Scaling helper ────────────────────────────────────────────────────
  function scaleAndFill(food: SearchableFood, qty: string) {
    const q = parseFloat(qty)
    if (!qty.trim() || isNaN(q) || q <= 0) return
    const factor = q / food.baseAmount
    setCalories(String(Math.round(food.calories * factor)))
    setProtein(roundMacro(food.protein * factor))
    setCarbs(roundMacro(food.carbs * factor))
    setFat(roundMacro(food.fat * factor))
    setCalError('')
  }

  // ─── Helpers ──────────────────────────────────────────────────────────

  function fillForm(cal: number, pro: number, car: number, f: number, name: string) {
    setCalories(String(cal))
    setProtein(String(pro))
    setCarbs(String(car))
    setFat(String(f))
    setLabel(name)
    setCalError('')
  }

  function applySearchFood(food: SearchableFood) {
    const fullName = [food.name, food.descriptor].filter(Boolean).join(' — ')
    const defaultQty = String(food.baseAmount)
    setSelectedFood(food)
    setSearchQuery('')
    setQuantity(defaultQty)
    setLabel(fullName)
    scaleAndFill(food, defaultQty)
  }

  function handleQuantityChange(val: string) {
    setQuantity(val)
    if (selectedFood) scaleAndFill(selectedFood, val)
  }

  function clearSearch() {
    setSelectedFood(null)
    setSearchQuery('')
    setQuantity('')
    setCalories('')
    setProtein('')
    setCarbs('')
    setFat('')
    setLabel('')
    setCalError('')
  }

  // Shortcut chips: personalized from recents → favorites → my foods → fallback
  function applyPreset(chip: QuickChip) {
    fillForm(chip.calories, chip.protein, chip.carbs, chip.fat, chip.name)
    setSelectedFood(null)
    setQuantity('')
    setSearchQuery('')
  }

  // Respect onboarding exclusions for the static fallback tier only.
  // When the user has real behavioral data the fallback tier is never reached.
  const excludedIds = (() => {
    const prefs = user?.foodPreferences
    const excluded = new Set((prefs?.excludedFoods ?? []).map(e => e.toLowerCase()))
    const exclusionMap: Record<string, string[]> = {
      dairy:      ['greek_yogurt', 'cottage_cheese', 'cheese', 'whey_protein'],
      eggs:       ['eggs'],
      nuts:       ['almonds', 'peanut_butter'],
      soy:        ['whey_protein'],
      gluten:     ['bread', 'pasta', 'oats'],
      'red meat': ['ground_beef'],
    }
    const blocked = new Set<string>()
    for (const [excl, foodIds] of Object.entries(exclusionMap)) {
      if (excluded.has(excl)) foodIds.forEach(id => blocked.add(id))
    }
    return blocked
  })()

  const filteredRecents   = recents.filter(f => !excludedIds.has(f.id))
  const filteredFavorites = favorites.filter(f => !excludedIds.has(f.id))

  const shortcuts = buildShortcuts(filteredRecents, filteredFavorites, myFoods)

  // ─── Submit ────────────────────────────────────────────────────────────
  function handleSubmit() {
    const now = new Date().toISOString()

    // ── Search-mode path: normalize to per-100g, use actual quantity ───────
    if (selectedFood !== null) {
      const q = parseFloat(quantity)
      if (!quantity.trim() || isNaN(q) || q <= 0) {
        setCalError('Enter an amount')
        return
      }
      setCalError('')
      // Normalize search food macros to per-100g so templates/meals can
      // re-scale correctly when a different quantity is entered later.
      const factor100 = 100 / selectedFood.baseAmount
      const food: FoodItem = {
        id: generateId(),
        name: label.trim() || selectedFood.name,
        macros: {
          calories: Math.round(selectedFood.calories * factor100),
          protein:  Math.round(selectedFood.protein  * factor100 * 10) / 10,
          carbs:    Math.round(selectedFood.carbs     * factor100 * 10) / 10,
          fat:      Math.round(selectedFood.fat       * factor100 * 10) / 10,
        },
        servingSizeG: selectedFood.baseAmount,
        source: 'search',
        searchFoodId: selectedFood.id,
        createdAt: now,
      }
      onConfirm(food, q, slot)
      return
    }

    // ── Manual / chip-preset path (no search food selected) ───────────────
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
      createdAt: now,
    }
    onConfirm(food, 100, slot)
  }

  const selectedFoodLabel = selectedFood
    ? [selectedFood.name, selectedFood.descriptor].filter(Boolean).join(' — ')
    : null

  return (
    <>
      <div className={styles.scrollContent}>
        <p className={styles.hint}>Fast macro entry — nothing saved to your food library.</p>

        {/* ── Search field ── */}
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

          {/* Selected food badge + quantity input (Phase 12B) */}
          {selectedFood !== null && (
            <>
              <div className={styles.selectedBadge}>
                <span className={styles.selectedBadgeName}>{selectedFoodLabel}</span>
                <span className={styles.selectedBadgeCal}>
                  per {selectedFood.baseAmount}&thinsp;{selectedFood.baseUnit}
                </span>
              </div>
              <Input
                label="Amount"
                value={quantity}
                onChange={e => handleQuantityChange(e.target.value)}
                inputMode="decimal"
                pattern="[0-9.]*"
                error={calError && selectedFood ? calError : undefined}
                rightElement={<span>{selectedFood.baseUnit}</span>}
              />
            </>
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

        {/* Personalized shortcut chips */}
        {shortcuts.length > 0 && (
          <div className={styles.presets}>
            {shortcuts.map(chip => (
              <button
                key={chip.id}
                type="button"
                className={styles.presetChip}
                onClick={() => applyPreset(chip)}
              >
                {chip.name}
                <span className={styles.presetCal}>{chip.calories} kcal</span>
              </button>
            ))}
          </div>
        )}

        {/* Direct-entry fields (unchanged — auto-filled when food is selected) */}
        <Input
          label="Calories"
          value={calories}
          onChange={(e) => setCalories(e.target.value)}
          inputMode="numeric"
          pattern="[0-9]*"
          error={selectedFood === null ? calError : undefined}
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
