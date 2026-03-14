import type { FoodItem } from '../../domain/types'
import styles from './FoodRow.module.css'

interface FoodRowProps {
  food: FoodItem
  onLog: (food: FoodItem) => void
  isFavorite: boolean
  onToggleFavorite: (food: FoodItem) => void
}

export function FoodRow({ food, onLog, isFavorite, onToggleFavorite }: FoodRowProps) {
  const { calories, protein, carbs, fat } = food.macros
  const summary = `${Math.round(calories)} kcal · ${Math.round(protein)}g P · ${Math.round(carbs)}g C · ${Math.round(fat)}g F`

  return (
    <div className={styles.row}>
      <button className={styles.tapArea} onClick={() => onLog(food)}>
        <span className={styles.name}>{food.name}</span>
        <span className={styles.macros}>{summary}</span>
      </button>
      <button
        className={[styles.star, isFavorite ? styles.starActive : ''].filter(Boolean).join(' ')}
        onClick={(e) => { e.stopPropagation(); onToggleFavorite(food) }}
        aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
        aria-pressed={isFavorite}
      >
        {isFavorite ? '★' : '☆'}
      </button>
    </div>
  )
}
