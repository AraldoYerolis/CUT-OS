import { MEAL_SLOTS, MEAL_SLOT_LABELS } from '../../domain/constants'
import type { MealSlot } from '../../domain/types'
import styles from './MealSlotPicker.module.css'

interface MealSlotPickerProps {
  value: MealSlot
  onChange: (slot: MealSlot) => void
}

export function MealSlotPicker({ value, onChange }: MealSlotPickerProps) {
  return (
    <div className={styles.wrapper}>
      <span className={styles.label}>Meal</span>
      <div className={styles.pills}>
        {MEAL_SLOTS.map((slot) => (
          <button
            key={slot}
            type="button"
            className={[styles.pill, value === slot ? styles.pillActive : ''].filter(Boolean).join(' ')}
            onClick={() => onChange(slot)}
          >
            {MEAL_SLOT_LABELS[slot]}
          </button>
        ))}
      </div>
    </div>
  )
}
