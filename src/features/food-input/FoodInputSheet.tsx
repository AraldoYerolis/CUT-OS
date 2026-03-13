import { useStore } from '../../store'
import { Sheet } from '../../components/ui/Sheet'
import { getReadyModes, requestInput } from '../../services/foodInput/FoodInputService'
import type { FoodItem, MealSlot } from '../../domain/types'
import styles from './FoodInputSheet.module.css'

interface FoodInputSheetProps {
  isOpen: boolean
  onClose: () => void
}

/**
 * Food Input Sheet — the unified entry point for all food logging modes.
 * Only renders tabs for modes where isReady: true.
 * Phase 1: tab chrome only. Panels are stubs until Phase 4.
 */
export function FoodInputSheet({ isOpen, onClose }: FoodInputSheetProps) {
  const activeMode = useStore((s) => s.foodInput.mode)
  const setMode = useStore((s) => s.setFoodInputMode)

  const readyModes = getReadyModes()

  function handleConfirm(_food: FoodItem, _quantity: number, _slot: MealSlot) {
    // Phase 4: dispatch to log store
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
                ].join(' ')}
                onClick={() => setMode(handler.mode)}
              >
                {handler.label}
              </button>
            ))}
          </div>
        )}

        {/* Active panel */}
        <div className={styles.panelArea} role="tabpanel">
          {activeHandler ? (
            <activeHandler.Panel
              onConfirm={handleConfirm}
              onCancel={onClose}
            />
          ) : (
            <div className={styles.placeholderPanel}>
              <p className={styles.placeholderTitle}>Add food</p>
              <p className={styles.placeholderNote}>
                Food input panels coming in Phase 4
              </p>
            </div>
          )}
        </div>

      </div>
    </Sheet>
  )
}
