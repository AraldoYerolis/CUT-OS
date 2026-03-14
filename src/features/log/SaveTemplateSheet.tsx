import { useState, useEffect } from 'react'
import { useStore } from '../../store'
import { Sheet } from '../../components/ui/Sheet'
import { Button } from '../../components/ui/Button'
import { generateId } from '../../utils/id'
import type { LoggedFood, MealTemplate, TemplateItem } from '../../domain/types'
import styles from './SaveTemplateSheet.module.css'

interface SaveTemplateSheetProps {
  entries: LoggedFood[]
  isOpen: boolean
  onClose: () => void
}

export function SaveTemplateSheet({ entries, isOpen, onClose }: SaveTemplateSheetProps) {
  const saveTemplate = useStore((s) => s.saveTemplate)
  const [name, setName] = useState('')
  const [selected, setSelected] = useState<Set<string>>(new Set())

  useEffect(() => {
    if (isOpen) {
      setName('')
      setSelected(new Set())
    }
  }, [isOpen])

  function toggleEntry(id: string) {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function handleSave() {
    const trimmed = name.trim()
    if (!trimmed || selected.size === 0) return
    const items: TemplateItem[] = entries
      .filter((e) => selected.has(e.id))
      .map((e) => ({
        foodItem: e.foodItem,
        quantityG: e.quantityG,
        mealSlot: e.mealSlot,
      }))
    const template: MealTemplate = {
      id: generateId(),
      name: trimmed,
      items,
      createdAt: new Date().toISOString(),
    }
    saveTemplate(template)
    onClose()
  }

  const canSave = name.trim().length > 0 && selected.size > 0

  const footerContent = (
    <div className={styles.footer}>
      <Button
        variant="primary"
        size="lg"
        full
        onClick={handleSave}
        disabled={!canSave}
      >
        Save template
      </Button>
    </div>
  )

  return (
    <Sheet isOpen={isOpen} onClose={onClose} label="Save template" footer={footerContent}>

      {/* Scrollable form content only — footer lives outside this scroll area */}
      <div className={styles.scrollContent}>

        <div className={styles.field}>
          <label className={styles.label} htmlFor="template-name">
            Template name
          </label>
          <input
            id="template-name"
            className={styles.input}
            type="text"
            placeholder="e.g. Breakfast A"
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={40}
            autoComplete="off"
          />
        </div>

        <p className={styles.sectionLabel}>Select entries</p>

        {entries.length === 0 ? (
          <p className={styles.emptyNote}>Nothing logged today to save.</p>
        ) : (
          <div className={styles.list}>
            {entries.map((entry) => {
              const isSelected = selected.has(entry.id)
              return (
                <button
                  key={entry.id}
                  className={[styles.entryRow, isSelected ? styles.entrySelected : ''].filter(Boolean).join(' ')}
                  onClick={() => toggleEntry(entry.id)}
                  type="button"
                >
                  <span className={[styles.check, isSelected ? styles.checkActive : ''].filter(Boolean).join(' ')}>
                    {isSelected ? '✓' : '○'}
                  </span>
                  <span className={styles.entryName}>{entry.foodItem.name}</span>
                  <span className={styles.entryKcal}>{Math.round(entry.macros.calories)} kcal</span>
                </button>
              )
            })}
          </div>
        )}

      </div>

    </Sheet>
  )
}
