import { useState, useEffect } from 'react'
import { useStore, selectActiveDate } from '../../store'
import { Sheet } from '../../components/ui/Sheet'
import { getReadyModes, requestInput } from '../../services/foodInput/FoodInputService'
import { computeMacros } from '../../domain/calculations'
import { generateId } from '../../utils/id'
import type { FoodItem, LoggedFood, MealSlot } from '../../domain/types'
import styles from './FoodInputSheet.module.css'

interface FoodInputSheetProps {
  isOpen: boolean
  onClose: () => void
}

/**
 * Food Input Sheet — the unified entry point for all food logging modes.
 * Only renders tabs for modes where isReady: true.
 */
export function FoodInputSheet({ isOpen, onClose }: FoodInputSheetProps) {
  const activeMode = useStore((s) => s.foodInput.mode)
  const setMode = useStore((s) => s.setFoodInputMode)
  const addLogEntry = useStore((s) => s.addLogEntry)
  const activeDate = useStore(selectActiveDate)

  // Increment on each open to force panel remount → clears form state
  const [panelKey, setPanelKey] = useState(0)
  useEffect(() => {
    if (isOpen) setPanelKey((k) => k + 1)
  }, [isOpen])

  const readyModes = getReadyModes()

  function handleConfirm(food: FoodItem, quantity: number, slot: MealSlot) {
    const entry: LoggedFood = {
      id: generateId(),
      date: activeDate,
      foodItem: food,
      quantityG: quantity,
      macros: computeMacros(food.macros, quantity),
      mealSlot: slot,
      loggedAt: new Date().toISOString(),
    }
    addLogEntry(entry)
    onClose()
  }

  const activeHandler = requestInput(activeMode)

  return (
    <Sheet isOpen={isOpen} onClose={onClose} label="Add food">
      <div className={styles.sheetContent}>

        {/* Mode tab bar — only ready modes */}
        {readyModes.length > 0 && (
          <div className={styles.tabBar} role="tablist" aria-label="Food input modes">
            {readyModes.map((handler) => (
              <button
                key={handler.mode}
                role="tab"
                aria-selected={activeMode === handler.mode}
                className={[
                  styles.tab,
                  activeMode === handler.mode ? styles.tabActive : '',
                ].filter(Boolean).join(' ')}
                onClick={() => setMode(handler.mode)}
              >
                {handler.label}
              </button>
            ))}
          </div>
        )}

        {/* Active panel — keyed on open count to reset form on each open */}
        <div className={styles.panelArea} role="tabpanel" key={panelKey}>
          {activeHandler ? (
            <activeHandler.Panel
              onConfirm={handleConfirm}
              onCancel={onClose}
            />
          ) : (
            <div className={styles.placeholderPanel}>
              <p className={styles.placeholderTitle}>Add food</p>
            </div>
          )}
        </div>

      </div>
    </Sheet>
  )
}
