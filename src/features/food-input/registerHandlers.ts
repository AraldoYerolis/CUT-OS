import { registerFoodInputHandler } from '../../services/foodInput/FoodInputService'
import { RecentsPanel } from './RecentsPanel'
import { FavoritesPanel } from './FavoritesPanel'
import { TemplatesPanel } from './TemplatesPanel'
import { ManualEntryPanel } from './ManualEntryPanel'
import { QuickAddPanel } from './QuickAddPanel'

registerFoodInputHandler({
  mode: 'recent',
  label: 'Recents',
  isReady: true,
  Panel: RecentsPanel,
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
