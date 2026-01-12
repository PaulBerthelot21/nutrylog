export interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  avatarUrl?: string
  targetCalories?: number
  targetProteins?: number
  targetCarbs?: number
  targetFats?: number
  createdAt: string
  updatedAt: string
}

export interface AuthResponse {
  user: User
  accessToken: string
}

export interface Food {
  id: string
  name: string
  brand?: string
  calories: number
  proteins: number
  carbs: number
  fats: number
  servingSize: number
  servingUnit: string
  barcode?: string
  createdAt: string
  updatedAt: string
}

export interface MealItem {
  id: string
  food: Food
  foodId: string
  quantity: number
  calories: number
  proteins: number
  carbs: number
  fats: number
}

export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack'

export interface Meal {
  id: string
  type: MealType
  date: string
  notes?: string
  items: MealItem[]
  userId?: string
  createdAt: string
  updatedAt: string
}

export interface DailySummary {
  date: string
  meals: Meal[]
  totals: {
    calories: number
    proteins: number
    carbs: number
    fats: number
  }
}

export const MealTypeLabels: Record<MealType, string> = {
  breakfast: 'Petit-déjeuner',
  lunch: 'Déjeuner',
  dinner: 'Dîner',
  snack: 'Collation'
}

export const MealTypeIcons: Record<MealType, string> = {
  breakfast: 'i-lucide-sunrise',
  lunch: 'i-lucide-sun',
  dinner: 'i-lucide-moon',
  snack: 'i-lucide-cookie'
}
