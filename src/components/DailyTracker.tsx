import React from 'react';
import { UserProfile, MealEntry, MealType } from '../types';
import { 
  Flame, 
  Plus, 
  Camera, 
  Trash2, 
  Droplet, 
  Sparkles,
  Check,
  TrendingDown,
  AlertCircle
} from 'lucide-react';
import { WeekCalendarStrip } from './WeekCalendarStrip';

interface DailyTrackerProps {
  profile: UserProfile;
  meals: MealEntry[];
  selectedDate: string;
  onSelectDate: (dateStr: string) => void;
  waterAmountMl?: number;
  onUpdateWater?: (newAmountMl: number) => void;
  onOpenAddMeal: (mealType?: MealType) => void;
  onOpenAiScan: () => void;
  onDeleteMeal: (entryId: string) => void;
}

export const DailyTracker: React.FC<DailyTrackerProps> = ({
  profile,
  meals,
  selectedDate,
  onSelectDate,
  waterAmountMl,
  onUpdateWater,
  onOpenAddMeal,
  onOpenAiScan,
  onDeleteMeal
}) => {
  // Totals
  const totalCalories = meals.reduce((sum, m) => sum + (m.calories || 0), 0);
  const totalProtein = Math.round(meals.reduce((sum, m) => sum + (m.proteinG || 0), 0) * 10) / 10;
  const totalCarbs = Math.round(meals.reduce((sum, m) => sum + (m.carbsG || 0), 0) * 10) / 10;
  const totalFat = Math.round(meals.reduce((sum, m) => sum + (m.fatG || 0), 0) * 10) / 10;
  const totalSugar = Math.round(meals.reduce((sum, m) => sum + (m.sugarG || 0), 0) * 10) / 10;

  const targetCalories = profile.dailyCalorieTarget || 2000;
  const remainingCalories = targetCalories - totalCalories;
  const caloriePercent = Math.min(100, Math.round((totalCalories / targetCalories) * 100));

  const proteinTarget = profile.targetProteinG || 150;
  const carbsTarget = profile.targetCarbsG || 200;
  const fatTarget = profile.targetFatG || 65;
  const sugarTarget = profile.targetSugarG || 35;
  const waterTarget = profile.targetWaterMl || 2500;

  const MEAL_CATEGORIES: { type: MealType; label: string }[] = [
    { type: 'breakfast', label: 'Frühstück' },
    { type: 'lunch', label: 'Mittagessen' },
    { type: 'dinner', label: 'Abendessen' },
    { type: 'snack', label: 'Snacks & Zwischenmahlzeiten' }
  ];

  const getMealsByType = (type: MealType) => meals.filter((m) => m.mealType === type);

  return (
    <div className="space-y-6">

      {/* Week Calendar Strip Navigation */}
      <WeekCalendarStrip 
        selectedDate={selectedDate} 
        onSelectDate={onSelectDate} 
      />

      {/* Top Banner: AI Fast Action Bar */}
      <div className="bg-slate-900 text-white rounded-2xl p-5 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4 border border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 flex items-center justify-center flex-shrink-0">
            <Camera className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-sm font-bold flex items-center gap-1.5">
              <span>Mahlzeit mit KI scannen</span>
              <span className="px-2 py-0.5 text-[10px] font-bold bg-emerald-500 text-slate-950 rounded-md uppercase">
                Foto
              </span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Mache ein Foto deines Tellers – Gemini berechnet Kalorien & Makros automatisch.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <button
            onClick={onOpenAiScan}
            className="flex-1 md:flex-none px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl transition-all shadow-xs flex items-center justify-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            <span>Jetzt Foto scannen</span>
          </button>

          <button
            onClick={() => onOpenAddMeal()}
            className="flex-1 md:flex-none px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl transition-all border border-slate-700 flex items-center justify-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Manuell</span>
          </button>
        </div>
      </div>

      {/* Main Calorie & Macro Dashboard Grid */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
        
        {/* Top summary row: Total Calories & Macros */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2">
            <Flame className="w-5 h-5 text-emerald-600" />
            <div>
              <h3 className="text-sm font-bold text-slate-900">Tagesübersicht Kalorien</h3>
              <p className="text-xs text-slate-500 font-medium">Ziel: {targetCalories} kcal / Tag</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <span className="text-xs font-bold text-slate-400 block uppercase">Gesamt</span>
              <span className="text-lg font-black text-slate-900">{totalCalories} / {targetCalories} kcal</span>
            </div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="space-y-1.5">
          <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
            <div 
              className={`h-full transition-all duration-500 ${
                caloriePercent > 100 
                  ? 'bg-rose-500' 
                  : caloriePercent > 85 
                  ? 'bg-amber-500' 
                  : 'bg-emerald-600'
              }`}
              style={{ width: `${Math.min(100, caloriePercent)}%` }}
            />
          </div>
        </div>

        {/* Macros Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
          
          {/* Eiweiß / Protein */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
            <div className="flex justify-between items-center text-xs font-semibold">
              <span className="text-indigo-800">Eiweiß</span>
              <span className="text-slate-500">{totalProtein}g / {proteinTarget}g</span>
            </div>
            <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-indigo-600 transition-all duration-300"
                style={{ width: `${Math.min(100, (totalProtein / proteinTarget) * 100)}%` }}
              />
            </div>
          </div>

          {/* Carbs */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
            <div className="flex justify-between items-center text-xs font-semibold">
              <span className="text-amber-800">Kohlenhydrate</span>
              <span className="text-slate-500">{totalCarbs}g / {carbsTarget}g</span>
            </div>
            <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-amber-500 transition-all duration-300"
                style={{ width: `${Math.min(100, (totalCarbs / carbsTarget) * 100)}%` }}
              />
            </div>
          </div>

          {/* Fat */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
            <div className="flex justify-between items-center text-xs font-semibold">
              <span className="text-rose-800">Fett</span>
              <span className="text-slate-500">{totalFat}g / {fatTarget}g</span>
            </div>
            <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-rose-500 transition-all duration-300"
                style={{ width: `${Math.min(100, (totalFat / fatTarget) * 100)}%` }}
              />
            </div>
          </div>

          {/* Sugar */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
            <div className="flex justify-between items-center text-xs font-semibold">
              <span className="text-emerald-800">Zucker</span>
              <span className={totalSugar > sugarTarget ? 'text-rose-600 font-bold' : 'text-slate-500'}>
                {totalSugar}g / max {sugarTarget}g
              </span>
            </div>
            <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
              <div 
                className={`h-full transition-all duration-300 ${totalSugar > sugarTarget ? 'bg-rose-500' : 'bg-emerald-600'}`}
                style={{ width: `${Math.min(100, (totalSugar / sugarTarget) * 100)}%` }}
              />
            </div>
          </div>

        </div>

      </div>

      {/* Meals Categorized List */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-slate-900">Mahlzeiten des Tages</h3>

        {MEAL_CATEGORIES.map((cat) => {
          const categoryMeals = getMealsByType(cat.type);
          const categoryCalories = categoryMeals.reduce((s, m) => s + (m.calories || 0), 0);

          return (
            <div key={cat.type} className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
              
              {/* Category Header */}
              <div className="px-5 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-900">{cat.label}</h4>
                  <span className="text-[11px] text-slate-500 font-medium">
                    {categoryMeals.length} {categoryMeals.length === 1 ? 'Eintrag' : 'Einträge'} • {categoryCalories} kcal
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => onOpenAddMeal(cat.type)}
                    className="px-3 py-1 bg-white border border-slate-300 hover:bg-slate-100 rounded-lg text-xs font-semibold text-slate-700 transition-colors flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Hinzufügen</span>
                  </button>
                </div>
              </div>

              {/* Category Entries List */}
              {categoryMeals.length === 0 ? (
                <div className="p-4 text-center text-xs text-slate-400 italic">
                  Noch keine Speise eingetragen
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {categoryMeals.map((meal) => (
                    <div key={meal.id} className="p-4 flex items-center justify-between gap-3 hover:bg-slate-50/50 transition-colors">
                      
                      <div className="flex items-center gap-3 min-w-0">
                        {meal.imageUrl ? (
                          <img 
                            src={meal.imageUrl} 
                            alt={meal.name}
                            className="w-12 h-12 rounded-xl object-cover border border-slate-200 flex-shrink-0" 
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-500 font-bold text-xs flex-shrink-0">
                            {meal.isAiScanned ? <Sparkles className="w-4 h-4 text-emerald-600" /> : meal.name.slice(0, 2).toUpperCase()}
                          </div>
                        )}

                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <h5 className="text-xs font-bold text-slate-900 truncate">{meal.name}</h5>
                            {meal.isAiScanned && (
                              <span className="px-1.5 py-0.5 bg-emerald-100 text-emerald-800 rounded-md text-[9px] font-bold uppercase">
                                KI
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-500 mt-0.5">
                            {meal.portionSize || '1 Portion'}
                            {meal.caloriesPer100g ? ` (${meal.caloriesPer100g} kcal/100${meal.unit || 'g'})` : ''} 
                            {' '}• Eiweiß: {meal.proteinG}g | KH: {meal.carbsG}g | Fett: {meal.fatG}g | Zucker: {meal.sugarG || 0}g
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 flex-shrink-0">
                        <span className="text-xs font-black text-slate-900 bg-slate-100 px-2.5 py-1 rounded-lg">
                          {meal.calories} kcal
                        </span>

                        <button
                          onClick={() => onDeleteMeal(meal.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          title="Eintrag löschen"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                    </div>
                  ))}
                </div>
              )}

            </div>
          );
        })}
      </div>

    </div>
  );
};
