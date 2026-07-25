import { Gender, ActivityLevel, WeeklyGoal, UserProfile } from '../types';

export function calculateBMR(gender: Gender, weightKg: number, heightCm: number, age: number): number {
  if (weightKg <= 0 || heightCm <= 0 || age <= 0) return 2000;
  
  if (gender === 'male') {
    return Math.round((10 * weightKg) + (6.25 * heightCm) - (5 * age) + 5);
  } else if (gender === 'female') {
    return Math.round((10 * weightKg) + (6.25 * heightCm) - (5 * age) - 161);
  } else {
    // Average
    const male = (10 * weightKg) + (6.25 * heightCm) - (5 * age) + 5;
    const female = (10 * weightKg) + (6.25 * heightCm) - (5 * age) - 161;
    return Math.round((male + female) / 2);
  }
}

export function getActivityMultiplier(activityLevel: ActivityLevel): number {
  switch (activityLevel) {
    case 'sedentary': return 1.2;
    case 'light': return 1.375;
    case 'moderate': return 1.55;
    case 'active': return 1.725;
    case 'very_active': return 1.9;
    default: return 1.375;
  }
}

export function calculateTDEE(gender: Gender, weightKg: number, heightCm: number, age: number, activityLevel: ActivityLevel): number {
  const bmr = calculateBMR(gender, weightKg, heightCm, age);
  const multiplier = getActivityMultiplier(activityLevel);
  return Math.round(bmr * multiplier);
}

export function calculateDailyTarget(
  gender: Gender, 
  weightKg: number, 
  heightCm: number, 
  age: number, 
  activityLevel: ActivityLevel, 
  weeklyGoalKg: WeeklyGoal
): {
  bmr: number;
  tdee: number;
  dailyCalorieTarget: number;
  targetProteinG: number;
  targetCarbsG: number;
  targetFatG: number;
  targetSugarG: number;
  targetWaterMl: number;
} {
  const bmr = calculateBMR(gender, weightKg, heightCm, age);
  const tdee = calculateTDEE(gender, weightKg, heightCm, age, activityLevel);
  
  // Weekly goal deficit/surplus adjustment
  // 1kg fat ~= 7700 kcal -> 1kg/week = 1100 kcal/day
  const dailyAdjustment = Math.round((weeklyGoalKg * 7700) / 7);
  let target = tdee + dailyAdjustment;
  
  // Minimum safe calorie floor
  const minCalories = gender === 'female' ? 1200 : 1500;
  if (target < minCalories) {
    target = minCalories;
  }
  
  // Recommended macros:
  // Protein: 2.0g per kg body weight (high protein for fat loss)
  const targetProteinG = Math.round(Math.min(weightKg * 2.0, (target * 0.35) / 4));
  
  // Fat: 25% of daily calories
  const targetFatG = Math.round((target * 0.25) / 9);
  
  // Carbs: remaining calories
  const proteinCalories = targetProteinG * 4;
  const fatCalories = targetFatG * 9;
  const remainingCalories = Math.max(0, target - proteinCalories - fatCalories);
  const targetCarbsG = Math.round(remainingCalories / 4);

  // Maximum recommended sugar: ~8% of total daily calories (WHO guideline max 10% / <50g)
  const targetSugarG = Math.round(Math.min(50, Math.max(25, (target * 0.08) / 4)));

  // Water recommendation: 35ml per kg body weight
  const targetWaterMl = Math.round(Math.max(2000, weightKg * 35));

  return {
    bmr,
    tdee,
    dailyCalorieTarget: target,
    targetProteinG,
    targetCarbsG,
    targetFatG,
    targetSugarG,
    targetWaterMl
  };
}

export function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function formatGermanDate(dateStr: string): string {
  if (!dateStr) return '';
  const [year, month, day] = dateStr.split('-');
  return `${day}.${month}.${year}`;
}
