/** Format a macro gram value for display */
export function formatGrams(value: number): string {
  if (value >= 100) return Math.round(value).toString()
  if (value >= 10) return value.toFixed(1)
  return value.toFixed(1)
}

/** Format calories (whole number) */
export function formatCalories(value: number): string {
  return Math.round(value).toString()
}

/** Format a weight in grams or oz depending on units */
export function formatWeight(grams: number, units: 'metric' | 'imperial' = 'metric'): string {
  if (units === 'imperial') {
    const oz = grams / 28.3495
    return `${oz.toFixed(1)} oz`
  }
  return `${Math.round(grams)} g`
}

/** Format a percentage (0–1 ratio) */
export function formatPercent(ratio: number): string {
  return `${Math.round(ratio * 100)}%`
}
