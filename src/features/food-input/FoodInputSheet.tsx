import { useState, useEffect } from 'react'
import { useStore, selectActiveDate } from '../../store'
import { Sheet } from '../../components/ui/Sheet'
import { QuickAddPanel } from './QuickAddPanel'
import { MyMealsPanel } from './MyMealsPanel'
import { TemplatesPanel } from './TemplatesPanel'
import { ScanPanel } from './ScanPanel'
import { computeMacros } from '../../domain/calculations'
import { generateId } from '../../utils/id'
import type { FoodItem, LoggedFood, MealSlot } from '../../domain/types'
import styles from './FoodInputSheet.module.css'

// ─── Types ────────────────────────────────────────────────────────────────

type TopTab     = 'search' | 'saved' | 'scan'
type SavedSubTab = 'meals' | 'templates'

interface FoodInputSheetProps {
  isOpen: boolean
  onClose: () => void
}

// ─── Component ────────────────────────────────────────────────────────────

export function FoodInputSheet({ isOpen, onClose }: FoodInputSheetProps) {
  const addLogEntry  = useStore(s => s.addLogEntry)
  const addToRecents = useStore(s => s.addToRecents)
  const activeDate   = useStore(selectActiveDate)
  // Store mode lets call-sites pre-select a tab (e.g. openFoodInput('scan'))
  const mode         = useStore(s => s.foodInput.mode)

  const [topTab,      setTopTab]      = useState<TopTab>('search')
  const [savedSubTab, setSavedSubTab] = useState<SavedSubTab>('meals')
  // Incremented on each open so panels remount → clears all form state
  const [panelKey,    setPanelKey]    = useState(0)

  useEffect(() => {
    if (!isOpen) return
    // Map the store mode to the appropriate top-level tab
    if (mode === 'scan') {
      setTopTab('scan')
    } else if (mode === 'myMeals' || mode === 'mealTemplate') {
      setTopTab('saved')
      setSavedSubTab(mode === 'myMeals' ? 'meals' : 'templates')
    } else {
      setTopTab('search')
    }
    setPanelKey(k => k + 1)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen])

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
    if (food.source !== 'quickadd') addToRecents(food)
    onClose()
  }

  return (
    <Sheet isOpen={isOpen} onClose={onClose} label="Add food">
      <div className={styles.sheetContent}>

        {/* ── 3 top-level tabs ── */}
        <div className={styles.tabBar} role="tablist" aria-label="Add food">
          <button
            role="tab"
            aria-selected={topTab === 'search'}
            className={[styles.tab, topTab === 'search' ? styles.tabActive : ''].filter(Boolean).join(' ')}
            onClick={() => setTopTab('search')}
          >
            <span className={styles.tabLabel}>Search</span>
            <span className={styles.tabHint}>foods &amp; favorites</span>
          </button>

          <button
            role="tab"
            aria-selected={topTab === 'saved'}
            className={[styles.tab, topTab === 'saved' ? styles.tabActive : ''].filter(Boolean).join(' ')}
            onClick={() => setTopTab('saved')}
          >
            <span className={styles.tabLabel}>Saved</span>
            <span className={styles.tabHint}>meals &amp; templates</span>
          </button>

          <button
            role="tab"
            aria-selected={topTab === 'scan'}
            className={[styles.tab, topTab === 'scan' ? styles.tabActive : ''].filter(Boolean).join(' ')}
            onClick={() => setTopTab('scan')}
          >
            <span className={styles.tabLabel}>Scan</span>
            <span className={styles.tabHint}>barcode &amp; label</span>
          </button>
        </div>

        {/* ── Saved sub-tabs — only rendered when Saved is active ── */}
        {topTab === 'saved' && (
          <div className={styles.subTabBar}>
            <button
              className={[styles.subTab, savedSubTab === 'meals' ? styles.subTabActive : ''].filter(Boolean).join(' ')}
              onClick={() => setSavedSubTab('meals')}
            >
              <span className={styles.subTabLabel}>My Meals</span>
              <span className={styles.subTabDesc}>saved reusable meals</span>
            </button>
            <button
              className={[styles.subTab, savedSubTab === 'templates' ? styles.subTabActive : ''].filter(Boolean).join(' ')}
              onClick={() => setSavedSubTab('templates')}
            >
              <span className={styles.subTabLabel}>Templates</span>
              <span className={styles.subTabDesc}>flexible food presets</span>
            </button>
          </div>
        )}

        {/* ── Panel area — scrollable ── */}
        <div className={styles.panelArea} role="tabpanel">
          {topTab === 'search' && (
            <QuickAddPanel
              key={panelKey}
              onConfirm={handleConfirm}
              onCancel={onClose}
            />
          )}
          {topTab === 'saved' && savedSubTab === 'meals' && (
            <MyMealsPanel
              key={panelKey}
              onConfirm={handleConfirm}
              onCancel={onClose}
            />
          )}
          {topTab === 'saved' && savedSubTab === 'templates' && (
            <TemplatesPanel
              key={panelKey}
              onConfirm={handleConfirm}
              onCancel={onClose}
            />
          )}
          {topTab === 'scan' && (
            <ScanPanel
              key={panelKey}
              onConfirm={handleConfirm}
              onCancel={onClose}
            />
          )}
        </div>

      </div>
    </Sheet>
  )
}
