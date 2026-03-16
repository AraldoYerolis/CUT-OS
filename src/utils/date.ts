/** Format a Date as YYYY-MM-DD (local time) */
export function toDateKey(date: Date = new Date()): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

/** Parse a YYYY-MM-DD key back to a Date (local midnight) */
export function fromDateKey(key: string): Date {
  const [y, m, d] = key.split('-').map(Number)
  return new Date(y, m - 1, d)
}

/** Human-readable label for a date key (Today / Yesterday / day name) */
export function dateLabel(key: string): string {
  const today = toDateKey()
  const yesterday = toDateKey(new Date(Date.now() - 86_400_000))

  if (key === today) return 'Today'
  if (key === yesterday) return 'Yesterday'

  const date = fromDateKey(key)
  return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
}

/** Short label for compact views (Today / Mon 12 / etc.) */
export function shortDateLabel(key: string): string {
  const today = toDateKey()
  if (key === today) return 'Today'

  const date = fromDateKey(key)
  return date.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric' })
}
