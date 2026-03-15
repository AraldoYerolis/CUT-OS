// ─── Searchable food catalog ──────────────────────────────────────────────
// Serving-level macros for Quick Add pre-fill.
// Extended beyond foodPresets.ts to support full variants and discovery.
// Phase 12B can extend this model (add baseWeightG etc.) without breaking changes.

export interface SearchableFood {
  id: string
  name: string
  descriptor?: string  // variant clarity: "90/10", "Nonfat", "Cooked"
  calories: number
  protein: number
  carbs: number
  fat: number
}

export const SEARCHABLE_FOODS: SearchableFood[] = [
  // ─── Chicken ────────────────────────────────────────────────────────────
  { id: 's_chicken_breast',      name: 'Chicken Breast',  descriptor: 'Cooked',       calories: 248, protein: 46, carbs: 0,  fat: 5  },
  { id: 's_chicken_thigh',       name: 'Chicken Thigh',   descriptor: 'Cooked',       calories: 280, protein: 28, carbs: 0,  fat: 18 },
  { id: 's_chicken_tender',      name: 'Chicken Tenders', descriptor: 'Cooked',       calories: 200, protein: 34, carbs: 2,  fat: 6  },
  { id: 's_rotisserie_chicken',  name: 'Rotisserie Chicken', descriptor: 'Breast',    calories: 215, protein: 38, carbs: 0,  fat: 6  },
  { id: 's_ground_chicken',      name: 'Ground Chicken',  descriptor: 'Cooked',       calories: 218, protein: 27, carbs: 0,  fat: 12 },

  // ─── Ground Beef ────────────────────────────────────────────────────────
  { id: 's_ground_beef_8020',    name: 'Ground Beef',     descriptor: '80/20',        calories: 280, protein: 24, carbs: 0,  fat: 20 },
  { id: 's_ground_beef_8515',    name: 'Ground Beef',     descriptor: '85/15',        calories: 240, protein: 25, carbs: 0,  fat: 15 },
  { id: 's_ground_beef_9010',    name: 'Ground Beef',     descriptor: '90/10',        calories: 196, protein: 26, carbs: 0,  fat: 10 },
  { id: 's_ground_beef_9604',    name: 'Ground Beef',     descriptor: '96/4',         calories: 155, protein: 27, carbs: 0,  fat: 5  },

  // ─── Ground Turkey ──────────────────────────────────────────────────────
  { id: 's_ground_turkey_937',   name: 'Ground Turkey',   descriptor: '93/7',         calories: 170, protein: 24, carbs: 0,  fat: 8  },
  { id: 's_ground_turkey_991',   name: 'Ground Turkey',   descriptor: '99/1',         calories: 120, protein: 26, carbs: 0,  fat: 1  },

  // ─── Other Beef / Red Meat ──────────────────────────────────────────────
  { id: 's_sirloin_steak',       name: 'Sirloin Steak',   descriptor: 'Cooked',       calories: 207, protein: 32, carbs: 0,  fat: 8  },
  { id: 's_ribeye_steak',        name: 'Ribeye Steak',    descriptor: 'Cooked',       calories: 310, protein: 29, carbs: 0,  fat: 21 },
  { id: 's_beef_jerky',          name: 'Beef Jerky',                                  calories: 80,  protein: 10, carbs: 3,  fat: 2  },

  // ─── Pork ───────────────────────────────────────────────────────────────
  { id: 's_pork_tenderloin',     name: 'Pork Tenderloin', descriptor: 'Cooked',       calories: 186, protein: 32, carbs: 0,  fat: 6  },
  { id: 's_bacon',               name: 'Bacon',           descriptor: '3 strips',     calories: 130, protein: 9,  carbs: 0,  fat: 10 },

  // ─── Fish & Seafood ─────────────────────────────────────────────────────
  { id: 's_salmon',              name: 'Salmon',          descriptor: 'Atlantic',     calories: 208, protein: 25, carbs: 0,  fat: 13 },
  { id: 's_tuna_water',          name: 'Tuna',            descriptor: 'Canned in water', calories: 128, protein: 30, carbs: 0, fat: 1  },
  { id: 's_tuna_oil',            name: 'Tuna',            descriptor: 'Canned in oil', calories: 168, protein: 25, carbs: 0, fat: 7  },
  { id: 's_tilapia',             name: 'Tilapia',         descriptor: 'Cooked',       calories: 145, protein: 29, carbs: 0,  fat: 3  },
  { id: 's_shrimp',              name: 'Shrimp',          descriptor: 'Cooked',       calories: 84,  protein: 18, carbs: 0,  fat: 1  },
  { id: 's_cod',                 name: 'Cod',             descriptor: 'Cooked',       calories: 105, protein: 23, carbs: 0,  fat: 1  },

  // ─── Eggs / Dairy Protein ────────────────────────────────────────────────
  { id: 's_whole_eggs',          name: 'Eggs',            descriptor: 'Whole, 2',     calories: 143, protein: 13, carbs: 1,  fat: 10 },
  { id: 's_egg_whites',          name: 'Egg Whites',      descriptor: '3 large',      calories: 52,  protein: 11, carbs: 1,  fat: 0  },
  { id: 's_greek_yogurt_nonfat', name: 'Greek Yogurt',    descriptor: 'Nonfat',       calories: 89,  protein: 15, carbs: 5,  fat: 0  },
  { id: 's_greek_yogurt_2',      name: 'Greek Yogurt',    descriptor: '2%',           calories: 110, protein: 15, carbs: 8,  fat: 3  },
  { id: 's_cottage_cheese_2',    name: 'Cottage Cheese',  descriptor: '2%',           calories: 90,  protein: 12, carbs: 4,  fat: 2  },
  { id: 's_cottage_cheese_4',    name: 'Cottage Cheese',  descriptor: '4%',           calories: 110, protein: 12, carbs: 4,  fat: 5  },
  { id: 's_milk_whole',          name: 'Milk',            descriptor: 'Whole',        calories: 149, protein: 8,  carbs: 12, fat: 8  },
  { id: 's_milk_skim',           name: 'Milk',            descriptor: 'Skim',         calories: 83,  protein: 8,  carbs: 12, fat: 0  },
  { id: 's_string_cheese',       name: 'String Cheese',   descriptor: '1 stick',      calories: 80,  protein: 7,  carbs: 1,  fat: 5  },
  { id: 's_cheddar_cheese',      name: 'Cheddar Cheese',  descriptor: '1 oz',         calories: 113, protein: 7,  carbs: 0,  fat: 9  },
  { id: 's_mozzarella',          name: 'Mozzarella',      descriptor: '1 oz',         calories: 85,  protein: 6,  carbs: 1,  fat: 6  },

  // ─── Protein Powders ────────────────────────────────────────────────────
  { id: 's_whey_protein',        name: 'Whey Protein',    descriptor: '1 scoop',      calories: 130, protein: 25, carbs: 5,  fat: 2  },
  { id: 's_casein_protein',      name: 'Casein Protein',  descriptor: '1 scoop',      calories: 120, protein: 24, carbs: 4,  fat: 1  },
  { id: 's_plant_protein',       name: 'Plant Protein',   descriptor: '1 scoop',      calories: 120, protein: 22, carbs: 6,  fat: 2  },

  // ─── Plant Protein ──────────────────────────────────────────────────────
  { id: 's_tofu',                name: 'Tofu',            descriptor: 'Firm, 4 oz',   calories: 90,  protein: 10, carbs: 2,  fat: 5  },
  { id: 's_tempeh',              name: 'Tempeh',          descriptor: '3 oz',         calories: 162, protein: 15, carbs: 8,  fat: 9  },
  { id: 's_edamame',             name: 'Edamame',         descriptor: '1 cup',        calories: 189, protein: 17, carbs: 15, fat: 8  },
  { id: 's_turkey_breast',       name: 'Turkey Breast',   descriptor: 'Sliced, 3 oz', calories: 90,  protein: 18, carbs: 1,  fat: 1  },

  // ─── Rice & Grains ──────────────────────────────────────────────────────
  { id: 's_white_rice',          name: 'White Rice',      descriptor: 'Cooked, 1 cup', calories: 205, protein: 4,  carbs: 45, fat: 0  },
  { id: 's_brown_rice',          name: 'Brown Rice',      descriptor: 'Cooked, 1 cup', calories: 215, protein: 5,  carbs: 45, fat: 2  },
  { id: 's_jasmine_rice',        name: 'Jasmine Rice',    descriptor: 'Cooked, 1 cup', calories: 205, protein: 4,  carbs: 45, fat: 0  },
  { id: 's_basmati_rice',        name: 'Basmati Rice',    descriptor: 'Cooked, 1 cup', calories: 200, protein: 4,  carbs: 43, fat: 0  },
  { id: 's_oats',                name: 'Oats',            descriptor: 'Dry, 1/2 cup', calories: 195, protein: 7,  carbs: 34, fat: 3  },
  { id: 's_quinoa',              name: 'Quinoa',          descriptor: 'Cooked, 1 cup', calories: 222, protein: 8,  carbs: 39, fat: 4  },

  // ─── Bread / Pasta ──────────────────────────────────────────────────────
  { id: 's_pasta_cooked',        name: 'Pasta',           descriptor: 'Cooked, 1 cup', calories: 180, protein: 7,  carbs: 37, fat: 1  },
  { id: 's_whole_wheat_pasta',   name: 'Whole Wheat Pasta', descriptor: 'Cooked',     calories: 174, protein: 7,  carbs: 37, fat: 1  },
  { id: 's_white_bread',         name: 'White Bread',     descriptor: '2 slices',     calories: 160, protein: 5,  carbs: 30, fat: 2  },
  { id: 's_whole_wheat_bread',   name: 'Whole Wheat Bread', descriptor: '2 slices',   calories: 138, protein: 7,  carbs: 24, fat: 2  },
  { id: 's_bagel',               name: 'Bagel',           descriptor: 'Plain',        calories: 270, protein: 11, carbs: 53, fat: 2  },
  { id: 's_tortilla_flour',      name: 'Flour Tortilla',  descriptor: '10"',          calories: 218, protein: 6,  carbs: 36, fat: 6  },
  { id: 's_tortilla_corn',       name: 'Corn Tortilla',   descriptor: '2 small',      calories: 104, protein: 3,  carbs: 22, fat: 1  },
  { id: 's_pita',                name: 'Pita Bread',      descriptor: '1 pocket',     calories: 165, protein: 5,  carbs: 33, fat: 1  },

  // ─── Potato / Root Veg ──────────────────────────────────────────────────
  { id: 's_sweet_potato',        name: 'Sweet Potato',    descriptor: 'Baked, medium', calories: 103, protein: 2,  carbs: 24, fat: 0  },
  { id: 's_white_potato',        name: 'Potato',          descriptor: 'Baked, medium', calories: 159, protein: 4,  carbs: 36, fat: 0  },

  // ─── Fruit ──────────────────────────────────────────────────────────────
  { id: 's_banana',              name: 'Banana',          descriptor: 'Medium',       calories: 89,  protein: 1,  carbs: 23, fat: 0  },
  { id: 's_apple',               name: 'Apple',           descriptor: 'Medium',       calories: 95,  protein: 0,  carbs: 25, fat: 0  },
  { id: 's_grapes',              name: 'Grapes',          descriptor: '1 cup',        calories: 104, protein: 1,  carbs: 27, fat: 0  },
  { id: 's_orange',              name: 'Orange',          descriptor: 'Medium',       calories: 62,  protein: 1,  carbs: 15, fat: 0  },
  { id: 's_mango',               name: 'Mango',           descriptor: '1 cup sliced', calories: 107, protein: 1,  carbs: 28, fat: 0  },
  { id: 's_blueberries',         name: 'Blueberries',     descriptor: '1 cup',        calories: 84,  protein: 1,  carbs: 21, fat: 0  },
  { id: 's_strawberries',        name: 'Strawberries',    descriptor: '1 cup',        calories: 49,  protein: 1,  carbs: 12, fat: 0  },

  // ─── Vegetables ─────────────────────────────────────────────────────────
  { id: 's_broccoli',            name: 'Broccoli',        descriptor: '1 cup',        calories: 55,  protein: 4,  carbs: 11, fat: 1  },
  { id: 's_green_beans',         name: 'Green Beans',     descriptor: '1 cup',        calories: 44,  protein: 2,  carbs: 10, fat: 0  },
  { id: 's_spinach',             name: 'Spinach',         descriptor: '2 cups',       calories: 14,  protein: 2,  carbs: 2,  fat: 0  },
  { id: 's_asparagus',           name: 'Asparagus',       descriptor: '6 spears',     calories: 26,  protein: 3,  carbs: 5,  fat: 0  },

  // ─── Fats / Oils ────────────────────────────────────────────────────────
  { id: 's_avocado',             name: 'Avocado',         descriptor: 'Half',         calories: 161, protein: 2,  carbs: 9,  fat: 15 },
  { id: 's_peanut_butter',       name: 'Peanut Butter',   descriptor: '2 tbsp',       calories: 188, protein: 8,  carbs: 6,  fat: 16 },
  { id: 's_almond_butter',       name: 'Almond Butter',   descriptor: '2 tbsp',       calories: 196, protein: 7,  carbs: 6,  fat: 18 },
  { id: 's_almonds',             name: 'Almonds',         descriptor: '1 oz',         calories: 164, protein: 6,  carbs: 6,  fat: 14 },
  { id: 's_walnuts',             name: 'Walnuts',         descriptor: '1 oz',         calories: 185, protein: 4,  carbs: 4,  fat: 18 },
  { id: 's_cashews',             name: 'Cashews',         descriptor: '1 oz',         calories: 157, protein: 5,  carbs: 9,  fat: 12 },
  { id: 's_mixed_nuts',          name: 'Mixed Nuts',      descriptor: '1 oz',         calories: 170, protein: 5,  carbs: 7,  fat: 15 },
  { id: 's_olive_oil',           name: 'Olive Oil',       descriptor: '1 tbsp',       calories: 119, protein: 0,  carbs: 0,  fat: 14 },
  { id: 's_coconut_oil',         name: 'Coconut Oil',     descriptor: '1 tbsp',       calories: 121, protein: 0,  carbs: 0,  fat: 14 },
  { id: 's_dark_chocolate',      name: 'Dark Chocolate',  descriptor: '1 oz',         calories: 170, protein: 2,  carbs: 19, fat: 12 },

  // ─── Snacks / Bars ──────────────────────────────────────────────────────
  { id: 's_protein_bar',         name: 'Protein Bar',                                 calories: 250, protein: 20, carbs: 25, fat: 8  },
  { id: 's_rice_cakes',          name: 'Rice Cakes',      descriptor: '2 cakes',      calories: 70,  protein: 1,  carbs: 15, fat: 0  },
  { id: 's_jerky',               name: 'Jerky',           descriptor: '1 oz',         calories: 80,  protein: 10, carbs: 3,  fat: 2  },
  { id: 's_granola_bar',         name: 'Granola Bar',                                 calories: 193, protein: 4,  carbs: 28, fat: 8  },
  { id: 's_hummus',              name: 'Hummus',          descriptor: '1/4 cup',      calories: 100, protein: 5,  carbs: 9,  fat: 6  },
  { id: 's_popcorn',             name: 'Popcorn',         descriptor: '3 cups',       calories: 93,  protein: 3,  carbs: 19, fat: 1  },
  { id: 's_trail_mix',           name: 'Trail Mix',       descriptor: '1/4 cup',      calories: 173, protein: 5,  carbs: 17, fat: 10 },
]

// ─── 4-tier ranked search ─────────────────────────────────────────────────
// Priority: exact > starts-with > word-start > contains
// Ties broken by natural list order (common foods listed first).

export function searchFoods(query: string, limit = 8): SearchableFood[] {
  const q = query.trim().toLowerCase()
  if (q.length === 0) return []

  type Ranked = { food: SearchableFood; score: number }
  const ranked: Ranked[] = []

  for (const food of SEARCHABLE_FOODS) {
    const full = [food.name, food.descriptor].filter(Boolean).join(' ').toLowerCase()
    const nameLower = food.name.toLowerCase()

    let score = 0
    if (nameLower === q) {
      score = 4  // exact
    } else if (nameLower.startsWith(q)) {
      score = 3  // starts-with
    } else {
      const wordStart = full.split(/\s+/).some(w => w.startsWith(q))
      if (wordStart) {
        score = 2  // word-start
      } else if (full.includes(q)) {
        score = 1  // contains
      }
    }

    if (score > 0) ranked.push({ food, score })
  }

  return ranked
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(r => r.food)
}
