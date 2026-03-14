import { useStore, selectTemplates, selectActiveDate } from '../../store'
import type { FoodInputContext } from '../../services/foodInput/FoodInputService'
import styles from './TemplatesPanel.module.css'

export function TemplatesPanel({ onCancel }: FoodInputContext) {
  const templates = useStore(selectTemplates)
  const applyTemplate = useStore((s) => s.applyTemplate)
  const deleteTemplate = useStore((s) => s.deleteTemplate)
  const activeDate = useStore(selectActiveDate)

  function handleApply(id: string) {
    applyTemplate(id, activeDate)
    onCancel()
  }

  if (templates.length === 0) {
    return (
      <div className={styles.empty}>
        <p className={styles.emptyTitle}>No templates yet</p>
        <p className={styles.emptyNote}>
          Open the Log tab, tap "Save template", select entries, and name it.
        </p>
      </div>
    )
  }

  return (
    <div className={styles.panel}>
      {templates.map((tmpl) => {
        const totalKcal = tmpl.items.reduce(
          (sum, item) => sum + (item.foodItem.macros.calories * item.quantityG) / 100,
          0
        )
        return (
          <div key={tmpl.id} className={styles.row}>
            <button
              className={styles.tapArea}
              onClick={() => handleApply(tmpl.id)}
              type="button"
            >
              <span className={styles.name}>{tmpl.name}</span>
              <span className={styles.meta}>
                {tmpl.items.length} item{tmpl.items.length !== 1 ? 's' : ''}
                {' · '}
                {Math.round(totalKcal)} kcal
              </span>
            </button>
            <button
              className={styles.deleteBtn}
              onClick={() => deleteTemplate(tmpl.id)}
              aria-label={`Delete ${tmpl.name}`}
              type="button"
            >
              ✕
            </button>
          </div>
        )
      })}
    </div>
  )
}
