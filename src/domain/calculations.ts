import type { MacroSnapshot, MacrosPer100g, MacroTargets } from './types'

/** Compute macros for a given quantity of a food item */
export function computeMacros(
  macrosPer100g: MacrosPer100g,
  quantityG: number
): MacroSnapshot {
  const ratio = quantityG / 100
  return {
    calories: Math.round(macrosPer100g.calories * ratio),
    protein: Math.round(macrosPer100g.protein * ratio * 10) / 10,
    carbs: Math.round(macrosPer100g.carbs * ratio * 10) / 10,
    fat: Math.round(macrosPer100g.fat * ratio * 10) / 10,
  }
}

/** Sum an array of macro snapshots */
export function sumMacros(snapshots: MacroSnapshot[]): MacroSnapshot {
  return snapshots.reduce(
    (acc, m) => ({
      calories: acc.calories + m.calories,
      protein: Math.round((acc.protein + m.protein) * 10) / 10,
      carbs: Math.round((acc.carbs + m.carbs) * 10) / 10,
      fat: Math.round((acc.fat + m.fat) * 10) / 10,
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  )
}

/** Calculate remaining macros vs targets */
export function remainingMacros(
  targets: MacroTargets,
  consumed: MacroSnapshot
): MacroSnapshot {
  return {
    calories: targets.calories - consumed.calories,
    protein: Math.round((targets.protein - consumed.protein) * 10) / 10,
    carbs: Math.round((targets.carbs - consumed.carbs) * 10) / 10,
    fat: Math.round((targets.fat - consumed.fat) * 10) / 10,
  }
}

/** 0–1 progress ratio, clamped to [0, 1.2] to show over-target */
export function macroProgress(consumed: number, target: number): number {
  if (target <= 0) return 0
  return Math.min(consumed / target, 1.2)
}

/** Estimate calories from macros (for quick-add validation) */
export function estimateCalories(protein: number, carbs: number, fat: number): number {
  return Math.round(protein * 4 + carbs * 4 + fat * 9)
}
