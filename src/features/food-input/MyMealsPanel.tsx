import { useState } from 'react'
import { useStore, selectMyMeals, selectMyFoods, selectActiveDate } from '../../store'
import type { FoodInputContext } from '../../services/foodInput/FoodInputService'
import { Input } from '../../components/ui/Input'
import { Button } from '../../components/ui/Button'
import { MealSlotPicker } from './MealSlotPicker'
import { searchFoods, type SearchableFood } from '../../domain/searchFoods'
import { generateId } from '../../utils/id'
import type { MealItem, MyMeal, MealSlot, SavedFood } from '../../domain/types'
import styles from './MyMealsPanel.module.css'

// ─── Shared food shape used by the builder ─────────────────────────────────
// Unifies SearchableFood and SavedFood into a single pending-entry shape.
interface PendingEntry {
  name: string
  baseAmount: number
  baseUnit: string
  calories: number
  protein: number
  carbs: number
  fat: number
}

function round1(v: number): number {
  return Math.round(v * 10) / 10
}

function scaledMacros(entry: PendingEntry, qty: number) {
  const f = qty / entry.baseAmount
  return {
    calories: Math.round(entry.calories * f),
    protein:  round1(entry.protein * f),
    carbs:    round1(entry.carbs * f),
    fat:      round1(entry.fat * f),
  }
}

// ─── Builder view ──────────────────────────────────────────────────────────

interface BuilderProps {
  myFoods: SavedFood[]
  onSave: (meal: MyMeal) => void
  onBack: () => void
}

function Builder({ myFoods, onSave, onBack }: BuilderProps) {
  const [mealName, setMealName]           = useState('')
  const [nameError, setNameError]         = useState('')
  const [searchQuery, setSearchQuery]     = useState('')
  const [pending, setPending]             = useState<PendingEntry | null>(null)
  const [pendingQty, setPendingQty]       = useState('')
  const [pendingErr, setPendingErr]       = useState('')
  const [draftItems, setDraftItems]       = useState<MealItem[]>([])

  const showResults  = searchQuery.length >= 1 && pending === null
  const searchResults: SearchableFood[] = showResults ? searchFoods(searchQuery, 8) : []
  const showMyFoods  = searchQuery.length === 0 && pending === null && myFoods.length > 0

  const totals = draftItems.reduce(
    (acc, item) => ({
      calories: acc.calories + item.calories,
      protein:  acc.protein  + item.protein,
      carbs:    acc.carbs    + item.carbs,
      fat:      acc.fat      + item.fat,
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  )

  function selectSearchFood(food: SearchableFood) {
    setPending({
      name:       [food.name, food.descriptor].filter(Boolean).join(' — '),
      baseAmount: food.baseAmount,
      baseUnit:   food.baseUnit,
      calories:   food.calories,
      protein:    food.protein,
      carbs:      food.carbs,
      fat:        food.fat,
    })
    setPendingQty(String(food.baseAmount))
    setPendingErr('')
    setSearchQuery('')
  }

  function selectMyFood(food: SavedFood) {
    setPending({
      name:       food.name,
      baseAmount: 1,
      baseUnit:   'serving',
      calories:   food.calories,
      protein:    food.protein,
      carbs:      food.carbs,
      fat:        food.fat,
    })
    setPendingQty('1')
    setPendingErr('')
  }

  function confirmPending() {
    if (!pending) return
    const qty = parseFloat(pendingQty)
    if (!pendingQty.trim() || isNaN(qty) || qty <= 0) {
      setPendingErr('Enter a valid amount')
      return
    }
    const m = scaledMacros(pending, qty)
    const item: MealItem = {
      id:       generateId(),
      name:     pending.name,
      calories: m.calories,
      protein:  m.protein,
      carbs:    m.carbs,
      fat:      m.fat,
    }
    setDraftItems(prev => [...prev, item])
    setPending(null)
    setPendingQty('')
    setPendingErr('')
  }

  function removeDraftItem(id: string) {
    setDraftItems(prev => prev.filter(i => i.id !== id))
  }

  function handleSave() {
    const trimmed = mealName.trim()
    if (!trimmed) {
      setNameError('Name is required')
      return
    }
    if (draftItems.length === 0) {
      setNameError('Add at least one food')
      return
    }
    setNameError('')
    const now = new Date().toISOString()
    const meal: MyMeal = {
      id:        generateId(),
      name:      trimmed,
      items:     draftItems,
      createdAt: now,
      useCount:  0,
    }
    onSave(meal)
  }

  const livePreview = pending
    ? (() => {
        const qty = parseFloat(pendingQty)
        if (!pendingQty.trim() || isNaN(qty) || qty <= 0) return null
        return scaledMacros(pending, qty)
      })()
    : null

  return (
    <>
      <div className={styles.scrollContent}>
        {/* Back link */}
        <button type="button" className={styles.backBtn} onClick={onBack}>
          ← My Meals
        </button>

        <Input
          label="Meal name"
          value={mealName}
          onChange={e => { setMealName(e.target.value); setNameError('') }}
          placeholder="e.g. Chicken prep meal"
          error={nameError}
          autoComplete="off"
        />

        {/* ── Food search ── */}
        <div className={styles.searchWrap}>
          <div className={styles.searchRow}>
            <input
              type="search"
              className={styles.searchInput}
              placeholder="Search foods to add…"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="off"
              spellCheck={false}
            />
            {searchQuery.length > 0 && (
              <button
                type="button"
                className={styles.searchClear}
                onClick={() => setSearchQuery('')}
                aria-label="Clear search"
              >
                ✕
              </button>
            )}
          </div>

          {/* Search results */}
          {showResults && (
            <ul className={styles.searchResults} role="listbox">
              {searchResults.length > 0 ? (
                searchResults.map(food => (
                  <li key={food.id} role="option" aria-selected={false}>
                    <button
                      type="button"
                      className={styles.resultItem}
                      onClick={() => selectSearchFood(food)}
                    >
                      <span className={styles.resultName}>
                        {food.name}
                        {food.descriptor && (
                          <span className={styles.resultDesc}> {food.descriptor}</span>
                        )}
                      </span>
                      <span className={styles.resultCal}>{food.calories} kcal</span>
                    </button>
                  </li>
                ))
              ) : (
                <li className={styles.resultEmpty}>No matches for "{searchQuery}"</li>
              )}
            </ul>
          )}

          {/* My Foods chips (shown when search is empty) */}
          {showMyFoods && (
            <div className={styles.myFoodsChips}>
              <span className={styles.chipsLabel}>My Foods</span>
              <div className={styles.chipRow}>
                {myFoods.slice(0, 8).map(food => (
                  <button
                    key={food.id}
                    type="button"
                    className={styles.foodChip}
                    onClick={() => selectMyFood(food)}
                  >
                    {food.name}
                    <span className={styles.chipCal}>{Math.round(food.calories)} kcal</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Pending food widget */}
          {pending !== null && (
            <div className={styles.pendingWidget}>
              <div className={styles.pendingHeader}>
                <span className={styles.pendingName}>{pending.name}</span>
                <button
                  type="button"
                  className={styles.pendingCancel}
                  onClick={() => { setPending(null); setPendingQty(''); setPendingErr('') }}
                  aria-label="Cancel"
                >
                  ✕
                </button>
              </div>
              <Input
                label={`Amount (${pending.baseUnit})`}
                value={pendingQty}
                onChange={e => { setPendingQty(e.target.value); setPendingErr('') }}
                inputMode="decimal"
                pattern="[0-9.]*"
                error={pendingErr}
                rightElement={<span>{pending.baseUnit}</span>}
              />
              {livePreview && (
                <p className={styles.pendingPreview}>
                  {livePreview.calories} kcal · {livePreview.protein}g P · {livePreview.carbs}g C · {livePreview.fat}g F
                </p>
              )}
              <Button variant="secondary" size="sm" full onClick={confirmPending}>
                + Add to Meal
              </Button>
            </div>
          )}
        </div>

        {/* Draft items */}
        {draftItems.length > 0 && (
          <div className={styles.draftSection}>
            <span className={styles.draftLabel}>Items ({draftItems.length})</span>
            {draftItems.map(item => (
              <div key={item.id} className={styles.draftRow}>
                <div className={styles.draftInfo}>
                  <span className={styles.draftName}>{item.name}</span>
                  <span className={styles.draftMacros}>
                    {item.calories} kcal · {item.protein}g P · {item.carbs}g C · {item.fat}g F
                  </span>
                </div>
                <button
                  type="button"
                  className={styles.draftRemove}
                  onClick={() => removeDraftItem(item.id)}
                  aria-label={`Remove ${item.name}`}
                >
                  ✕
                </button>
              </div>
            ))}
            <div className={styles.draftTotals}>
              <span>Total</span>
              <span>
                {Math.round(totals.calories)} kcal · {round1(totals.protein)}g P · {round1(totals.carbs)}g C · {round1(totals.fat)}g F
              </span>
            </div>
          </div>
        )}
      </div>

      <div className={styles.footer}>
        <Button variant="primary" size="lg" full onClick={handleSave}>
          Save Meal
        </Button>
        <Button variant="ghost" size="lg" full onClick={onBack}>
          Cancel
        </Button>
      </div>
    </>
  )
}

// ─── List view ─────────────────────────────────────────────────────────────

export function MyMealsPanel({ onCancel }: FoodInputContext) {
  const myMeals      = useStore(selectMyMeals)
  const myFoods      = useStore(selectMyFoods)
  const saveMyMeal   = useStore(s => s.saveMyMeal)
  const deleteMyMeal = useStore(s => s.deleteMyMeal)
  const logMyMeal    = useStore(s => s.logMyMeal)
  const activeDate   = useStore(selectActiveDate)

  const [view, setView]   = useState<'list' | 'builder'>('list')
  const [slot, setSlot]   = useState<MealSlot>('untagged')
  const [query, setQuery] = useState('')

  function handleSave(meal: MyMeal) {
    saveMyMeal(meal)
    setView('list')
  }

  function handleLog(id: string) {
    logMyMeal(id, activeDate, slot)
    onCancel()
  }

  if (view === 'builder') {
    return (
      <Builder
        myFoods={myFoods}
        onSave={handleSave}
        onBack={() => setView('list')}
      />
    )
  }

  // ── Sort meals by lastUsedAt desc ──
  const sorted = [...myMeals].sort((a, b) => {
    const aTime = a.lastUsedAt ?? a.createdAt
    const bTime = b.lastUsedAt ?? b.createdAt
    return bTime.localeCompare(aTime)
  })

  const filtered = query.trim()
    ? sorted.filter(m => m.name.toLowerCase().includes(query.toLowerCase()))
    : sorted

  if (myMeals.length === 0) {
    return (
      <>
        <div className={styles.empty}>
          <p className={styles.emptyTitle}>No saved meals yet</p>
          <p className={styles.emptyNote}>
            Build a meal from multiple foods and save it for one-tap logging.
          </p>
        </div>
        <div className={styles.footer}>
          <Button variant="primary" size="lg" full onClick={() => setView('builder')}>
            + Build New Meal
          </Button>
        </div>
      </>
    )
  }

  return (
    <>
      <div className={styles.listContent}>
        {/* Slot picker + new meal button */}
        <div className={styles.listHeader}>
          <MealSlotPicker value={slot} onChange={setSlot} />
          <button
            type="button"
            className={styles.newMealBtn}
            onClick={() => setView('builder')}
          >
            + New
          </button>
        </div>

        {/* Filter */}
        {myMeals.length > 3 && (
          <div className={styles.filterRow}>
            <input
              type="search"
              className={styles.filterInput}
              placeholder="Filter meals…"
              value={query}
              onChange={e => setQuery(e.target.value)}
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="off"
              spellCheck={false}
            />
          </div>
        )}

        {/* Meal list */}
        <div className={styles.list}>
          {filtered.length === 0 ? (
            <p className={styles.noMatch}>No match for "{query}"</p>
          ) : (
            filtered.map(meal => {
              const totalKcal = Math.round(
                meal.items.reduce((sum, i) => sum + i.calories, 0)
              )
              return (
                <div key={meal.id} className={styles.mealRow}>
                  <button
                    type="button"
                    className={styles.logBtn}
                    onClick={() => handleLog(meal.id)}
                  >
                    <span className={styles.mealName}>{meal.name}</span>
                    <span className={styles.mealMeta}>
                      {meal.items.length} item{meal.items.length !== 1 ? 's' : ''} · {totalKcal} kcal
                    </span>
                  </button>
                  <button
                    type="button"
                    className={styles.deleteBtn}
                    onClick={() => deleteMyMeal(meal.id)}
                    aria-label={`Delete ${meal.name}`}
                  >
                    ✕
                  </button>
                </div>
              )
            })
          )}
        </div>
      </div>
    </>
  )
}
