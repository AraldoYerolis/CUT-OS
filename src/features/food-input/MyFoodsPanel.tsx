import { useState } from 'react'
import { useStore, selectMyFoods } from '../../store'
import type { FoodInputContext } from '../../services/foodInput/FoodInputService'
import { generateId } from '../../utils/id'
import type { FoodItem, SavedFood } from '../../domain/types'
import styles from './MyFoodsPanel.module.css'

export function MyFoodsPanel({ onConfirm }: FoodInputContext) {
  const myFoods = useStore(selectMyFoods)
  const removeFromMyFoods = useStore((s) => s.removeFromMyFoods)

  const [query, setQuery] = useState('')

  // Filter by name or brand, then sort by lastUsedAt descending
  const filtered = query.trim()
    ? myFoods.filter((f) => {
        const q = query.toLowerCase()
        return (
          f.name.toLowerCase().includes(q) ||
          (f.brand?.toLowerCase().includes(q) ?? false)
        )
      })
    : myFoods

  const sorted = [...filtered].sort((a, b) => {
    const aTime = a.lastUsedAt ?? a.savedAt
    const bTime = b.lastUsedAt ?? b.savedAt
    return bTime.localeCompare(aTime)
  })

  function handleLog(saved: SavedFood) {
    // Reconstruct a FoodItem from the saved record for the standard log flow
    const food: FoodItem = {
      id: generateId(),
      name: saved.name,
      brand: saved.brand,
      barcode: saved.barcode,
      macros: {
        calories: saved.calories,
        protein: saved.protein,
        carbs: saved.carbs,
        fat: saved.fat,
      },
      servingSizeG: 100,
      source: saved.source,
      createdAt: new Date().toISOString(),
    }
    onConfirm(food, 100, 'untagged')
  }

  if (myFoods.length === 0) {
    return (
      <div className={styles.empty}>
        <p className={styles.emptyTitle}>No saved foods yet</p>
        <p className={styles.emptyNote}>
          Use "Save to My Foods" in Manual entry to save exact foods for quick reuse here.
        </p>
      </div>
    )
  }

  return (
    <>
      {/* Inline filter — only shown when there is something to filter */}
      {myFoods.length > 3 && (
        <div className={styles.filterRow}>
          <input
            type="search"
            className={styles.filterInput}
            placeholder="Filter my foods…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck={false}
          />
        </div>
      )}

      <div className={styles.list}>
        {sorted.length === 0 ? (
          <p className={styles.noMatch}>No match for "{query}"</p>
        ) : (
          sorted.map((food) => {
            const summary = `${Math.round(food.calories)} kcal · ${Math.round(food.protein)}g P · ${Math.round(food.carbs)}g C · ${Math.round(food.fat)}g F`
            return (
              <div key={food.id} className={styles.row}>
                <button className={styles.tapArea} onClick={() => handleLog(food)}>
                  <span className={styles.name}>{food.name}</span>
                  {food.brand && (
                    <span className={styles.brand}>{food.brand}</span>
                  )}
                  <span className={styles.macros}>{summary}</span>
                </button>
                <button
                  className={styles.removeBtn}
                  onClick={() => removeFromMyFoods(food.id)}
                  aria-label={`Remove ${food.name} from My Foods`}
                >
                  ✕
                </button>
              </div>
            )
          })
        )}
      </div>
    </>
  )
}
