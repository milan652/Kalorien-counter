export type Gender = 'male' | 'female' | 'other';

export type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';

export type WeeklyGoal = -1.0 | -0.75 | -0.5 | -0.25 | 0 | 0.25 | 0.5;

export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';

export interface UserProfile {
  uid: string;
  email?: string | null;
  displayName?: string | null;
  gender: Gender;
  age: number;
  heightCm: number;
  currentWeightKg: number;
  targetWeightKg: number;
  activityLevel: ActivityLevel;
  weeklyGoalKg: WeeklyGoal;
  dailyCalorieTarget: number;
  targetProteinG: number;
  targetCarbsG: number;
  targetFatG: number;
  targetSugarG?: number;
  targetWaterMl: number;
  onboardingCompleted: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface IngredientItem {
  id: string;
  name: string;
  amount: number; // in g or ml
  unit: 'g' | 'ml';
  calories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  sugarG?: number;
}

export interface MealEntry {
  id: string;
  userId: string;
  date: string; // YYYY-MM-DD
  mealType: MealType;
  name: string;
  calories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  sugarG?: number;
  fiberG?: number;
  portionSize?: string;
  portionGrams?: number;
  unit?: 'g' | 'ml';
  caloriesPer100g?: number;
  proteinPer100g?: number;
  carbsPer100g?: number;
  fatPer100g?: number;
  sugarPer100g?: number;
  fiberPer100g?: number;
  imageUrl?: string;
  isAiScanned?: boolean;
  notes?: string;
  ingredients?: IngredientItem[];
  timestamp: number;
}

export interface WeightLog {
  id: string;
  userId: string;
  date: string; // YYYY-MM-DD
  weightKg: number;
  notes?: string;
  timestamp: number;
}

export interface WaterLog {
  id: string;
  userId: string;
  date: string; // YYYY-MM-DD
  amountMl: number;
  timestamp: number;
}

export interface AiScanResult {
  foodName: string;
  portionGrams: number;
  unit: 'g' | 'ml';
  caloriesPer100g: number;
  proteinPer100g: number;
  carbsPer100g: number;
  fatPer100g: number;
  sugarPer100g: number;
  fiberPer100g: number;
  calories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  sugarG: number;
  fiberG: number;
  portionSize: string;
  confidence: 'hoch' | 'mittel' | 'niedrig';
  description: string;
  healthTip: string;
  ingredients?: IngredientItem[];
}
