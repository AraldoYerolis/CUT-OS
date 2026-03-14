// ─── Preset food catalog ──────────────────────────────────────────────────
// Serving-level macros (not per 100g) used for Quick Add pre-fill.
// Values are approximate, representative single-serving amounts.

export interface PresetFood {
  id: string
  name: string
  category: 'protein' | 'carb' | 'fat' | 'snack'
  calories: number
  protein: number
  carbs: number
  fat: number
}

export const PRESET_FOODS: PresetFood[] = [
  // Proteins
  { id: 'chicken_breast', name: 'Chicken Breast', category: 'protein', calories: 248, protein: 46, carbs: 0, fat: 5 },
  { id: 'eggs',           name: 'Eggs (2)',        category: 'protein', calories: 143, protein: 13, carbs: 1, fat: 10 },
  { id: 'greek_yogurt',   name: 'Greek Yogurt',    category: 'protein', calories: 89,  protein: 15, carbs: 5, fat: 1 },
  { id: 'tuna',           name: 'Tuna',            category: 'protein', calories: 128, protein: 30, carbs: 0, fat: 1 },
  { id: 'ground_beef',    name: 'Ground Beef',     category: 'protein', calories: 196, protein: 26, carbs: 0, fat: 10 },
  { id: 'cottage_cheese', name: 'Cottage Cheese',  category: 'protein', calories: 98,  protein: 11, carbs: 3, fat: 4 },
  { id: 'whey_protein',   name: 'Whey Protein',    category: 'protein', calories: 130, protein: 25, carbs: 5, fat: 2 },
  { id: 'salmon',         name: 'Salmon',          category: 'protein', calories: 208, protein: 25, carbs: 0, fat: 13 },
  // Carbs
  { id: 'oats',           name: 'Oats',            category: 'carb',    calories: 195, protein: 7,  carbs: 34, fat: 3 },
  { id: 'white_rice',     name: 'White Rice',      category: 'carb',    calories: 195, protein: 4,  carbs: 42, fat: 0 },
  { id: 'sweet_potato',   name: 'Sweet Potato',    category: 'carb',    calories: 103, protein: 2,  carbs: 24, fat: 0 },
  { id: 'bread',          name: 'Bread (2 sl.)',   category: 'carb',    calories: 160, protein: 5,  carbs: 30, fat: 2 },
  { id: 'banana',         name: 'Banana',          category: 'carb',    calories: 89,  protein: 1,  carbs: 23, fat: 0 },
  { id: 'pasta',          name: 'Pasta',           category: 'carb',    calories: 180, protein: 7,  carbs: 37, fat: 1 },
  // Fats
  { id: 'avocado',        name: 'Avocado',         category: 'fat',     calories: 161, protein: 2,  carbs: 9,  fat: 15 },
  { id: 'peanut_butter',  name: 'Peanut Butter',   category: 'fat',     calories: 188, protein: 8,  carbs: 6,  fat: 16 },
  { id: 'almonds',        name: 'Almonds',         category: 'fat',     calories: 174, protein: 6,  carbs: 6,  fat: 15 },
  { id: 'olive_oil',      name: 'Olive Oil',       category: 'fat',     calories: 119, protein: 0,  carbs: 0,  fat: 14 },
  { id: 'cheese',         name: 'Cheese',          category: 'fat',     calories: 120, protein: 8,  carbs: 0,  fat: 10 },
  // Snacks
  { id: 'protein_bar',    name: 'Protein Bar',     category: 'snack',   calories: 250, protein: 20, carbs: 25, fat: 8 },
  { id: 'rice_cakes',     name: 'Rice Cakes',      category: 'snack',   calories: 70,  protein: 1,  carbs: 15, fat: 0 },
  { id: 'jerky',          name: 'Jerky',           category: 'snack',   calories: 80,  protein: 10, carbs: 3,  fat: 2 },
  { id: 'dark_chocolate', name: 'Dark Choc.',      category: 'snack',   calories: 170, protein: 2,  carbs: 19, fat: 12 },
]

export const PRESET_FOOD_BY_ID = new Map(PRESET_FOODS.map(f => [f.id, f]))

export const DEFAULT_QUICK_PRESET_IDS = [
  'chicken_breast',
  'oats',
  'eggs',
  'whey_protein',
  'white_rice',
]

export const EXCLUSION_OPTIONS = [
  'Dairy',
  'Gluten',
  'Nuts',
  'Shellfish',
  'Red Meat',
  'Pork',
  'Soy',
  'Eggs',
]
