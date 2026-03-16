import { useState } from 'react'
import type { FoodInputContext } from '../../services/foodInput/FoodInputService'
import { Input } from '../../components/ui/Input'
import { Button } from '../../components/ui/Button'
import { MealSlotPicker } from './MealSlotPicker'
import { generateId } from '../../utils/id'
import { searchFoods, type SearchableFood } from '../../domain/searchFoods'
import type { FoodItem, MealSlot } from '../../domain/types'
import styles from './QuickAddPanel.module.css'

// Round to 1 decimal, strip trailing .0 → "31" not "31.0"
function roundMacro(v: number): string {
  const r = Math.round(v * 10) / 10
  return r % 1 === 0 ? String(Math.round(r)) : String(r)
}

export function QuickAddPanel({ onConfirm }: FoodInputContext) {
  // ─── Direct-entry state ────────────────────────────────────────────────
  const [calories, setCalories] = useState('')
  const [protein, setProtein]   = useState('')
  const [carbs, setCarbs]       = useState('')
  const [fat, setFat]           = useState('')
  const [label, setLabel]       = useState('')
  const [slot, setSlot]         = useState<MealSlot>('untagged')
  const [calError, setCalError] = useState('')

  // ─── Search state ──────────────────────────────────────────────────────
  const [searchQuery, setSearchQuery]   = useState('')
  const [selectedFood, setSelectedFood] = useState<SearchableFood | null>(null)

  // ─── Quantity state (only active when selectedFood !== null) ───────────
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

    // ── Manual path (no search food selected) ─────────────────────────────
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

          {/* Selected food badge + quantity input */}
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

        {/* Direct-entry fields — auto-filled when a food is selected from search */}
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
