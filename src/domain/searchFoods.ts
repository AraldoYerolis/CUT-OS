// ─── Searchable food catalog ──────────────────────────────────────────────
// Phase 12B: extended with baseAmount/baseUnit for quantity-based scaling.
// All macros are per baseAmount. Most foods use baseAmount=100, baseUnit='g'.
// Exceptions: eggs (per egg), egg whites (per white).
// Values are USDA-reference generic approximations for common fitness foods.
// Brand-sensitive items (protein bars, flavored yogurts, branded wraps, etc.)
// are intentionally excluded — use barcode scan or manual entry for those.

export interface SearchableFood {
  id: string
  name: string
  descriptor?: string   // variant clarity: "Cooked", "90/10", "Nonfat", "Dry"
  baseAmount: number    // reference serving size (e.g. 100)
  baseUnit: string      // 'g', 'ml', 'egg', 'white'
  calories: number      // per baseAmount
  protein: number
  carbs: number
  fat: number
}

// ─── Helpers ─────────────────────────────────────────────────────────────
const g = (
  id: string, name: string, descriptor: string | undefined,
  cal: number, p: number, c: number, f: number,
  baseAmount = 100,
  baseUnit = 'g',
): SearchableFood => ({ id, name, descriptor, baseAmount, baseUnit, calories: cal, protein: p, carbs: c, fat: f })

export const SEARCHABLE_FOODS: SearchableFood[] = [

  // ─── Chicken ────────────────────────────────────────────────────────────
  g('s_chicken_breast',     'Chicken Breast',     'Cooked',      165, 31,   0,  3.6),
  g('s_chicken_tenderloin', 'Chicken Tenderloin', 'Cooked',      161, 30,   0,  3.4),
  g('s_chicken_thigh',      'Chicken Thigh',      'Skinless, Cooked', 188, 25, 0, 10),
  g('s_ground_chicken',     'Ground Chicken',     'Cooked',      218, 27,   0, 12),

  // ─── Turkey ─────────────────────────────────────────────────────────────
  g('s_turkey_breast',      'Turkey Breast',      'Cooked',      135, 30,   0,  1),
  g('s_ground_turkey_991',  'Ground Turkey',      '99/1',        120, 27,   0,  1),
  g('s_ground_turkey_973',  'Ground Turkey',      '97/3',        128, 26,   0,  3),
  g('s_ground_turkey_937',  'Ground Turkey',      '93/7',        170, 24,   0,  8),

  // ─── Ground Beef ────────────────────────────────────────────────────────
  g('s_ground_beef_9604',   'Ground Beef',        '96/4',        155, 27,   0,  5),
  g('s_ground_beef_937',    'Ground Beef',        '93/7',        172, 25,   0,  8),
  g('s_ground_beef_9010',   'Ground Beef',        '90/10',       196, 26,   0, 10),
  g('s_ground_beef_8515',   'Ground Beef',        '85/15',       215, 21,   0, 15),
  g('s_ground_beef_8020',   'Ground Beef',        '80/20',       254, 17,   0, 20),

  // ─── Steak / Red Meat ────────────────────────────────────────────────────
  g('s_top_sirloin',        'Top Sirloin',        'Cooked',      207, 32,   0,  8),
  g('s_sirloin_tip',        'Sirloin Tip',        'Cooked',      186, 28,   0,  7),
  g('s_flank_steak',        'Flank Steak',        'Cooked',      192, 28,   0,  9),
  g('s_round_steak',        'Round Steak',        'Cooked',      168, 28,   0,  5),
  g('s_bison',              'Bison',              'Ground, Cooked', 146, 28, 0,  3),

  // ─── Pork ───────────────────────────────────────────────────────────────
  g('s_pork_tenderloin',    'Pork Tenderloin',    'Cooked',      143, 25,   0,  3),

  // ─── Fish ───────────────────────────────────────────────────────────────
  g('s_tuna_water',         'Tuna',               'Canned in water', 116, 26, 0, 1),
  g('s_tuna_oil',           'Tuna',               'Canned in oil',   198, 23, 0, 11),
  g('s_salmon',             'Salmon',             'Atlantic, Cooked', 208, 20, 0, 13),
  g('s_tilapia',            'Tilapia',            'Cooked',      128, 26,   0,  3),
  g('s_cod',                'Cod',                'Cooked',       82, 18,   0,  1),
  g('s_haddock',            'Haddock',            'Cooked',       87, 19,   0,  1),
  g('s_shrimp',             'Shrimp',             'Cooked',       85, 18,   1,  1),
  g('s_scallops',           'Scallops',           'Cooked',      111, 20,   6,  1),

  // ─── Eggs ───────────────────────────────────────────────────────────────
  { id: 's_egg_whole',   name: 'Egg',          descriptor: 'Whole, large', baseAmount: 1, baseUnit: 'egg',   calories: 72,  protein: 6,   carbs: 0.4, fat: 5  },
  { id: 's_egg_white',   name: 'Egg White',    descriptor: 'Large',        baseAmount: 1, baseUnit: 'white', calories: 17,  protein: 3.6, carbs: 0.2, fat: 0  },
  g('s_liquid_egg_whites', 'Liquid Egg Whites', undefined,      52, 11,   0.7, 0),

  // ─── Dairy — generic plain variants only ────────────────────────────────
  g('s_greek_yogurt_nonfat', 'Greek Yogurt',     'Nonfat, plain',  59, 10,  3.6, 0.4),
  g('s_greek_yogurt_2',      'Greek Yogurt',     '2%, plain',      73,  9.9, 3.8, 2),
  g('s_greek_yogurt_whole',  'Greek Yogurt',     'Whole milk, plain', 97, 9, 3.7, 5),
  g('s_cottage_cheese_1',    'Cottage Cheese',   '1%',             72, 12,   3,  1),
  g('s_cottage_cheese_2',    'Cottage Cheese',   '2%',             90, 12,   4,  3),
  g('s_cottage_cheese_4',    'Cottage Cheese',   '4%',            110, 11,  3.4, 5),
  g('s_milk_skim',           'Milk',             'Skim',           34,  3.4, 5,  0.1, 100, 'ml'),
  g('s_milk_1',              'Milk',             '1%',             41,  3.4, 5,  1,   100, 'ml'),
  g('s_milk_2',              'Milk',             '2%',             50,  3.3, 4.8, 2,  100, 'ml'),
  g('s_milk_whole',          'Milk',             'Whole',          61,  3.2, 4.8, 3.3, 100, 'ml'),

  // ─── Rice (cooked) ──────────────────────────────────────────────────────
  g('s_white_rice_cooked',   'White Rice',       'Cooked',        130,  2.7, 28, 0.3),
  g('s_jasmine_rice_cooked', 'Jasmine Rice',     'Cooked',        130,  2.7, 28, 0.3),
  g('s_basmati_rice_cooked', 'Basmati Rice',     'Cooked',        130,  2.7, 27, 0.4),
  g('s_brown_rice_cooked',   'Brown Rice',       'Cooked',        123,  2.7, 26, 0.9),

  // ─── Rice (dry) ─────────────────────────────────────────────────────────
  g('s_white_rice_dry',      'White Rice',       'Dry',           365,  7,   80, 0.6),
  g('s_jasmine_rice_dry',    'Jasmine Rice',     'Dry',           365,  7,   80, 0.5),
  g('s_basmati_rice_dry',    'Basmati Rice',     'Dry',           352,  8,   77, 0.7),

  // ─── Oats / Porridge ────────────────────────────────────────────────────
  g('s_oats_dry',            'Oats',             'Dry',           389, 17,   66, 7),
  g('s_oatmeal_cooked',      'Oatmeal',          'Cooked',         71,  2.5, 12, 1.5),
  g('s_cream_of_rice',       'Cream of Rice',    'Cooked',         57,  1.1, 13, 0.1),
  g('s_cream_of_wheat',      'Cream of Wheat',   'Cooked',         59,  2,   12, 0.4),

  // ─── Potato ─────────────────────────────────────────────────────────────
  g('s_russet_potato',       'Russet Potato',    'Baked',          77,  2,   17, 0.1),
  g('s_red_potato',          'Red Potato',       'Boiled',         70,  2,   16, 0.1),
  g('s_yukon_potato',        'Yukon Gold Potato','Boiled',         72,  2,   16, 0.1),
  g('s_sweet_potato',        'Sweet Potato',     'Baked',          86,  1.6, 20, 0.1),
  g('s_potato_boiled',       'Potato',           'Boiled',         87,  1.9, 20, 0.1),

  // ─── Bread / Wraps ──────────────────────────────────────────────────────
  g('s_rice_cakes',          'Rice Cakes',       'Plain',         387,  8,   81, 3),
  g('s_bagel_plain',         'Bagel',            'Plain',         250, 10,   49, 2),
  g('s_english_muffin',      'English Muffin',   'Plain',         227,  8,   44, 2),
  g('s_corn_tortilla',       'Corn Tortilla',    undefined,       218,  5,   46, 3),
  g('s_flour_tortilla',      'Flour Tortilla',   undefined,       303,  8,   50, 8),

  // ─── Pasta ──────────────────────────────────────────────────────────────
  g('s_pasta_cooked',        'Pasta',            'Cooked',        158,  6,   31, 0.9),
  g('s_white_pasta_dry',     'Pasta',            'Dry',           371, 13,   75, 1.5),
  g('s_ww_pasta_cooked',     'Whole Wheat Pasta','Cooked',        149,  5.5, 31, 1.5),

  // ─── Other Grains ───────────────────────────────────────────────────────
  g('s_couscous',            'Couscous',         'Cooked',        112,  3.8, 23, 0.2),
  g('s_quinoa',              'Quinoa',           'Cooked',        120,  4.4, 22, 1.9),
  g('s_grits',               'Grits',            'Cooked',         59,  1.5, 13, 0.2),
  g('s_popcorn',             'Popcorn',          'Air-popped',    387, 13,   78, 5),

  // ─── Fruit ──────────────────────────────────────────────────────────────
  g('s_banana',              'Banana',           undefined,        89,  1.1, 23, 0.3),
  g('s_apple',               'Apple',            undefined,        52,  0.3, 14, 0.2),
  g('s_orange',              'Orange',           undefined,        47,  0.9, 12, 0.1),
  g('s_grapes',              'Grapes',           undefined,        69,  0.7, 18, 0.2),
  g('s_blueberries',         'Blueberries',      undefined,        57,  0.7, 14, 0.3),
  g('s_strawberries',        'Strawberries',     undefined,        32,  0.7,  8, 0.3),
  g('s_raspberries',         'Raspberries',      undefined,        52,  1.2, 12, 0.7),
  g('s_blackberries',        'Blackberries',     undefined,        43,  1.4, 10, 0.5),
  g('s_pineapple',           'Pineapple',        undefined,        50,  0.5, 13, 0.1),
  g('s_watermelon',          'Watermelon',       undefined,        30,  0.6,  8, 0.2),
  g('s_cantaloupe',          'Cantaloupe',       undefined,        34,  0.8,  8, 0.2),
  g('s_kiwi',                'Kiwi',             undefined,        61,  1.1, 15, 0.5),
  g('s_mango',               'Mango',            undefined,        60,  0.8, 15, 0.4),
  g('s_peach',               'Peach',            undefined,        39,  0.9, 10, 0.3),
  g('s_pear',                'Pear',             undefined,        57,  0.4, 15, 0.1),
  g('s_plum',                'Plum',             undefined,        46,  0.7, 11, 0.3),
  g('s_raisins',             'Raisins',          undefined,       299,  3.1, 79, 0.5),
  g('s_dates',               'Dates',            undefined,       277,  1.8, 75, 0.2),

  // ─── Vegetables ─────────────────────────────────────────────────────────
  g('s_broccoli',            'Broccoli',         undefined,        34,  2.8,  7, 0.4),
  g('s_cauliflower',         'Cauliflower',      undefined,        25,  1.9,  5, 0.3),
  g('s_green_beans',         'Green Beans',      undefined,        31,  1.8,  7, 0.1),
  g('s_asparagus',           'Asparagus',        undefined,        20,  2.2,  4, 0.1),
  g('s_spinach',             'Spinach',          undefined,        23,  2.9,  3.6, 0.4),
  g('s_kale',                'Kale',             undefined,        49,  4.3,  9, 0.9),
  g('s_mixed_greens',        'Mixed Greens',     undefined,        25,  2,    4, 0.4),
  g('s_romaine',             'Romaine Lettuce',  undefined,        17,  1.2,  3, 0.3),
  g('s_cucumber',            'Cucumber',         undefined,        15,  0.7,  4, 0.1),
  g('s_zucchini',            'Zucchini',         undefined,        17,  1.2,  3, 0.3),
  g('s_yellow_squash',       'Yellow Squash',    undefined,        20,  1.5,  4, 0.2),
  g('s_bell_pepper',         'Bell Pepper',      undefined,        31,  1,    7, 0.3),
  g('s_onion',               'Onion',            undefined,        40,  1.1,  9, 0.1),
  g('s_mushrooms',           'Mushrooms',        undefined,        22,  3.1,  3, 0.3),
  g('s_tomato',              'Tomato',           undefined,        18,  0.9,  4, 0.2),
  g('s_brussels_sprouts',    'Brussels Sprouts', undefined,        43,  3.4,  9, 0.3),
  g('s_carrots',             'Carrots',          undefined,        41,  0.9, 10, 0.2),
  g('s_cabbage',             'Cabbage',          undefined,        25,  1.3,  6, 0.1),
  g('s_celery',              'Celery',           undefined,        16,  0.7,  3, 0.2),
  g('s_edamame',             'Edamame',          'Shelled, cooked', 121, 11, 10, 5),

  // ─── Fats ───────────────────────────────────────────────────────────────
  g('s_avocado',             'Avocado',          undefined,       160,  2,    9, 15),
  g('s_olive_oil',           'Olive Oil',        undefined,       884,  0,    0, 100),
  g('s_coconut_oil',         'Coconut Oil',      undefined,       892,  0,    0, 100),
  g('s_butter',              'Butter',           undefined,       717,  1,    0, 81),
  g('s_almonds',             'Almonds',          undefined,       579, 21,   22, 50),
  g('s_walnuts',             'Walnuts',          undefined,       654, 15,   14, 65),
  g('s_cashews',             'Cashews',          undefined,       553, 18,   30, 44),
  g('s_pistachios',          'Pistachios',       undefined,       560, 20,   28, 45),
  g('s_natural_peanut_butter', 'Peanut Butter',  'Natural',       588, 25,   20, 50),
  g('s_natural_almond_butter', 'Almond Butter',  'Natural',       614, 21,   19, 56),
  g('s_chia_seeds',          'Chia Seeds',       undefined,       486, 17,   42, 31),
  g('s_flax_seeds',          'Flax Seeds',       undefined,       534, 18,   29, 42),
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
