import { macroProgress } from '../../domain/calculations'
import { formatGrams, formatCalories } from '../../utils/format'
import styles from './MacroBar.module.css'

interface MacroBarProps {
  label: string
  consumed: number
  target: number
  unit: 'g' | 'kcal'
  color: string // CSS custom property reference, e.g. 'var(--color-protein)'
}

export function MacroBar({ label, consumed, target, unit, color }: MacroBarProps) {
  const progress = macroProgress(consumed, target) // 0–1.2
  const fillPct = Math.min(progress / 1.2, 1) * 100
  const isOver = consumed > target

  const fmt = (v: number) => (unit === 'kcal' ? formatCalories(v) : formatGrams(v))

  return (
    <div className={styles.row}>
      <div className={styles.top}>
        <span className={styles.label}>{label}</span>
        <span className={[styles.values, isOver ? styles.valuesOver : ''].filter(Boolean).join(' ')}>
          {fmt(consumed)}<span className={styles.sep}>/</span>{fmt(target)}
          <span className={styles.unit}>{unit}</span>
        </span>
      </div>
      <div className={styles.track}>
        <div
          className={styles.fill}
          style={{ width: `${fillPct}%`, background: isOver ? 'var(--color-danger)' : color }}
        />
      </div>
    </div>
  )
}
