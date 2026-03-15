import { registerFoodInputHandler } from '../../services/foodInput/FoodInputService'
import { RecentsPanel } from './RecentsPanel'
import { FavoritesPanel } from './FavoritesPanel'
import { MyFoodsPanel } from './MyFoodsPanel'
import { MyMealsPanel } from './MyMealsPanel'
import { TemplatesPanel } from './TemplatesPanel'
import { ManualEntryPanel } from './ManualEntryPanel'
import { QuickAddPanel } from './QuickAddPanel'
import { ScanPanel } from './ScanPanel'

registerFoodInputHandler({
  mode: 'recent',
  label: 'Recents',
  isReady: true,
  Panel: RecentsPanel,
})

registerFoodInputHandler({
  mode: 'myFoods',
  label: 'My Foods',
  isReady: true,
  Panel: MyFoodsPanel,
})

registerFoodInputHandler({
  mode: 'myMeals',
  label: 'My Meals',
  isReady: true,
  Panel: MyMealsPanel,
})

registerFoodInputHandler({
  mode: 'favorites',
  label: 'Favorites',
  isReady: true,
  Panel: FavoritesPanel,
})

registerFoodInputHandler({
  mode: 'mealTemplate',
  label: 'Templates',
  isReady: true,
  Panel: TemplatesPanel,
})

registerFoodInputHandler({
  mode: 'manual',
  label: 'Manual',
  isReady: true,
  Panel: ManualEntryPanel,
})

registerFoodInputHandler({
  mode: 'quickAdd',
  label: 'Quick Add',
  isReady: true,
  Panel: QuickAddPanel,
})

registerFoodInputHandler({
  mode: 'scan',
  label: 'Scan',
  isReady: true,
  Panel: ScanPanel,
})
