import { useStore, selectFavorites } from '../../store'
import { FoodRow } from './FoodRow'
import type { FoodInputContext } from '../../services/foodInput/FoodInputService'
import type { FoodItem } from '../../domain/types'
import styles from './FavoritesPanel.module.css'

export function FavoritesPanel({ onConfirm }: FoodInputContext) {
  const favorites = useStore(selectFavorites)
  const removeFromFavorites = useStore((s) => s.removeFromFavorites)

  function handleLog(food: FoodItem) {
    onConfirm(food, 100, 'untagged')
  }

  function handleToggleFavorite(food: FoodItem) {
    // In the Favorites panel, toggling always removes (it's already a favorite)
    removeFromFavorites(food.id)
  }

  if (favorites.length === 0) {
    return (
      <div className={styles.empty}>
        <p className={styles.emptyTitle}>No favorites yet</p>
        <p className={styles.emptyNote}>Tap ☆ on any recent food to save it here.</p>
      </div>
    )
  }

  return (
    <div className={styles.panel}>
      {favorites.map((food) => (
        <FoodRow
          key={food.id}
          food={food}
          onLog={handleLog}
          isFavorite={true}
          onToggleFavorite={handleToggleFavorite}
        />
      ))}
    </div>
  )
}
