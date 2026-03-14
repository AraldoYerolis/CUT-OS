import { useStore, selectRecents, selectFavorites } from '../../store'
import { FoodRow } from './FoodRow'
import type { FoodInputContext } from '../../services/foodInput/FoodInputService'
import type { FoodItem } from '../../domain/types'
import styles from './RecentsPanel.module.css'

export function RecentsPanel({ onConfirm }: FoodInputContext) {
  const recents = useStore(selectRecents)
  const favorites = useStore(selectFavorites)
  const addToFavorites = useStore((s) => s.addToFavorites)
  const removeFromFavorites = useStore((s) => s.removeFromFavorites)

  function handleLog(food: FoodItem) {
    onConfirm(food, 100, 'untagged')
  }

  function handleToggleFavorite(food: FoodItem) {
    if (favorites.some((f) => f.id === food.id)) {
      removeFromFavorites(food.id)
    } else {
      addToFavorites(food)
    }
  }

  if (recents.length === 0) {
    return (
      <div className={styles.empty}>
        <p className={styles.emptyTitle}>No recent foods</p>
        <p className={styles.emptyNote}>Foods you log will appear here for quick re-logging.</p>
      </div>
    )
  }

  return (
    <div className={styles.panel}>
      {recents.map((food) => (
        <FoodRow
          key={food.id}
          food={food}
          onLog={handleLog}
          isFavorite={favorites.some((f) => f.id === food.id)}
          onToggleFavorite={handleToggleFavorite}
        />
      ))}
    </div>
  )
}
