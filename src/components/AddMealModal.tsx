import React, { useState } from 'react';
import { MealType } from '../types';
import { Plus, X, Utensils, CheckCircle2 } from 'lucide-react';

interface AddMealModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddMeal: (mealData: {
    name: string;
    mealType: MealType;
    calories: number;
    proteinG: number;
    carbsG: number;
    fatG: number;
    fiberG: number;
    portionSize: string;
    portionGrams?: number;
    unit?: 'g' | 'ml';
    caloriesPer100g?: number;
    proteinPer100g?: number;
    carbsPer100g?: number;
    fatPer100g?: number;
    fiberPer100g?: number;
    isAiScanned: boolean;
  }) => void;
  defaultMealType?: MealType;
}

// Quick common food presets with exact gram weights and per-100g estimates
const QUICK_PRESETS = [
  { name: 'Haferflocken mit Milch & Beeren', type: 'breakfast', portionGrams: 300, unit: 'g' as const, cal100: 117, prot100: 4.7, carbs100: 17.3, fat100: 2.7 },
  { name: 'Magerquark mit Früchten', type: 'breakfast', portionGrams: 250, unit: 'g' as const, cal100: 88, prot100: 12.0, carbs100: 7.2, fat100: 0.4 },
  { name: 'Hähnchenbrust mit Reis & Gemüse', type: 'lunch', portionGrams: 400, unit: 'g' as const, cal100: 130, prot100: 11.3, carbs100: 15.5, fat100: 2.0 },
  { name: 'Großer gemischter Salat mit Pute', type: 'lunch', portionGrams: 350, unit: 'g' as const, cal100: 108, prot100: 10.0, carbs100: 4.3, fat100: 5.1 },
  { name: 'Lachsfilet mit Ofenkartoffeln', type: 'dinner', portionGrams: 450, unit: 'g' as const, cal100: 129, prot100: 8.4, carbs100: 9.3, fat100: 5.8 },
  { name: 'Rührei (3 Eier) mit Vollkornbrot', type: 'breakfast', portionGrams: 250, unit: 'g' as const, cal100: 144, prot100: 9.6, carbs100: 8.8, fat100: 7.2 },
  { name: 'Protein-Shake (Whey & Wasser)', type: 'snack', portionGrams: 300, unit: 'ml' as const, cal100: 40, prot100: 8.0, carbs100: 0.7, fat100: 0.3 },
  { name: 'Apfel mit Handvoll Mandeln', type: 'snack', portionGrams: 180, unit: 'g' as const, cal100: 128, prot100: 3.3, carbs100: 13.3, fat100: 7.8 }
];

export const AddMealModal: React.FC<AddMealModalProps> = ({
  isOpen,
  onClose,
  onAddMeal,
  defaultMealType = 'lunch'
}) => {
  const [name, setName] = useState('');
  const [mealType, setMealType] = useState<MealType>(defaultMealType);
  const [portionGrams, setPortionGrams] = useState<number | ''>(250);
  const [unit, setUnit] = useState<'g' | 'ml'>('g');

  // Per 100g values
  const [caloriesPer100g, setCaloriesPer100g] = useState<number | ''>(120);
  const [proteinPer100g, setProteinPer100g] = useState<number | ''>(8);
  const [carbsPer100g, setCarbsPer100g] = useState<number | ''>(15);
  const [fatPer100g, setFatPer100g] = useState<number | ''>(4);
  const [sugarPer100g, setSugarPer100g] = useState<number | ''>(5);

  // Total calculated portion values
  const [calories, setCalories] = useState<number>(300);
  const [proteinG, setProteinG] = useState<number>(20);
  const [carbsG, setCarbsG] = useState<number>(37.5);
  const [fatG, setFatG] = useState<number>(10);
  const [sugarG, setSugarG] = useState<number>(12.5);

  if (!isOpen) return null;

  const recalculateTotals = (
    grams: number | '',
    c100: number | '',
    p100: number | '',
    cb100: number | '',
    f100: number | '',
    sg100: number | '' = sugarPer100g
  ) => {
    const gNum = typeof grams === 'number' ? grams : 0;
    const cNum = typeof c100 === 'number' ? c100 : 0;
    const pNum = typeof p100 === 'number' ? p100 : 0;
    const cbNum = typeof cb100 === 'number' ? cb100 : 0;
    const fNum = typeof f100 === 'number' ? f100 : 0;
    const sgNum = typeof sg100 === 'number' ? sg100 : 0;

    const factor = gNum / 100;
    setCalories(Math.max(0, Math.round(cNum * factor)));
    setProteinG(Math.max(0, Math.round(pNum * factor * 10) / 10));
    setCarbsG(Math.max(0, Math.round(cbNum * factor * 10) / 10));
    setFatG(Math.max(0, Math.round(fNum * factor * 10) / 10));
    setSugarG(Math.max(0, Math.round(sgNum * factor * 10) / 10));
  };

  const handlePortionGramsChange = (rawVal: string) => {
    if (rawVal === '') {
      setPortionGrams('');
      recalculateTotals('', caloriesPer100g, proteinPer100g, carbsPer100g, fatPer100g);
    } else {
      const num = Math.max(0, Number(rawVal));
      setPortionGrams(num);
      recalculateTotals(num, caloriesPer100g, proteinPer100g, carbsPer100g, fatPer100g);
    }
  };

  const handlePer100gChange = (field: 'cal' | 'prot' | 'carbs' | 'fat', rawVal: string) => {
    const val: number | '' = rawVal === '' ? '' : Math.max(0, Number(rawVal));

    let c100 = caloriesPer100g;
    let p100 = proteinPer100g;
    let cb100 = carbsPer100g;
    let f100 = fatPer100g;

    if (field === 'cal') { c100 = val; setCaloriesPer100g(val); }
    if (field === 'prot') { p100 = val; setProteinPer100g(val); }
    if (field === 'carbs') { cb100 = val; setCarbsPer100g(val); }
    if (field === 'fat') { f100 = val; setFatPer100g(val); }

    recalculateTotals(portionGrams, c100, p100, cb100, f100);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalGrams = typeof portionGrams === 'number' ? portionGrams : 0;
    if (!name || finalGrams <= 0) return;

    const finalCal100 = typeof caloriesPer100g === 'number' ? caloriesPer100g : 0;
    const finalProt100 = typeof proteinPer100g === 'number' ? proteinPer100g : 0;
    const finalCarbs100 = typeof carbsPer100g === 'number' ? carbsPer100g : 0;
    const finalFat100 = typeof fatPer100g === 'number' ? fatPer100g : 0;

    onAddMeal({
      name,
      mealType,
      calories: Number(calories) || 0,
      proteinG: Number(proteinG) || 0,
      carbsG: Number(carbsG) || 0,
      fatG: Number(fatG) || 0,
      fiberG: 0,
      portionSize: `${finalGrams} ${unit}`,
      portionGrams: finalGrams,
      unit,
      caloriesPer100g: finalCal100,
      proteinPer100g: finalProt100,
      carbsPer100g: finalCarbs100,
      fatPer100g: finalFat100,
      isAiScanned: false
    });

    handleReset();
    onClose();
  };

  const handleApplyPreset = (preset: typeof QUICK_PRESETS[0]) => {
    setName(preset.name);
    setMealType(preset.type as MealType);
    setPortionGrams(preset.portionGrams);
    setUnit(preset.unit);
    setCaloriesPer100g(preset.cal100);
    setProteinPer100g(preset.prot100);
    setCarbsPer100g(preset.carbs100);
    setFatPer100g(preset.fat100);

    recalculateTotals(preset.portionGrams, preset.cal100, preset.prot100, preset.carbs100, preset.fat100);
  };

  const handleReset = () => {
    setName('');
    setPortionGrams(250);
    setUnit('g');
    setCaloriesPer100g(120);
    setProteinPer100g(8);
    setCarbsPer100g(15);
    setFatPer100g(4);
    recalculateTotals(250, 120, 8, 15, 4);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-md w-full border border-slate-200 overflow-hidden my-8">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-slate-900 text-white rounded-lg">
              <Utensils className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Mahlzeit manuell eintragen</h3>
              <p className="text-[11px] text-slate-500">Trage deine Speise und Nährwerte direkt ein</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">

          {/* Quick Presets */}
          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
              Schnellauswahl (Presets)
            </label>
            <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto pr-1">
              {QUICK_PRESETS.map((p, idx) => {
                const estCal = Math.round((p.cal100 * p.portionGrams) / 100);
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleApplyPreset(p)}
                    className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-lg text-[11px] font-semibold text-slate-700 transition-colors text-left"
                  >
                    {p.name} ({p.portionGrams}{p.unit}, ~{estCal} kcal)
                  </button>
                );
              })}
            </div>
          </div>

          <hr className="border-slate-100" />

          {/* Meal Name & Category */}
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Name der Speise *</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="z.B. Vollkornbrot mit Frischkäse"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-800"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Kategorie</label>
                <select
                  value={mealType}
                  onChange={(e) => setMealType(e.target.value as MealType)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 font-semibold bg-white"
                >
                  <option value="breakfast">Frühstück</option>
                  <option value="lunch">Mittagessen</option>
                  <option value="dinner">Abendessen</option>
                  <option value="snack">Snack</option>
                </select>
              </div>

              {/* Portionsmenge in Gramms or Milliliters */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Menge ({unit === 'g' ? 'in Gramm' : 'in Milliliter'}) *
                </label>
                <div className="flex gap-1.5 items-center">
                  <input
                    type="number"
                    required
                    min={1}
                    value={portionGrams}
                    onChange={(e) => handlePortionGramsChange(e.target.value)}
                    className="w-full min-w-0 flex-1 px-3 py-2 text-xs font-bold text-slate-900 rounded-xl border border-slate-300 bg-emerald-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  />
                  <div className="flex bg-slate-100 p-0.5 rounded-xl border border-slate-200 shrink-0">
                    <button
                      type="button"
                      onClick={() => setUnit('g')}
                      className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-colors ${
                        unit === 'g' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      g
                    </button>
                    <button
                      type="button"
                      onClick={() => setUnit('ml')}
                      className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-colors ${
                        unit === 'ml' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      ml
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* 100g Values Input */}
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
                Nährwerte pro 100 {unit}
              </span>

              <div className="grid grid-cols-4 gap-2">
                <div>
                  <label className="block text-[10px] font-bold text-slate-600 mb-1">kcal / 100{unit}</label>
                  <input
                    type="number"
                    min={0}
                    value={caloriesPer100g}
                    onChange={(e) => handlePer100gChange('cal', e.target.value)}
                    className="w-full px-2 py-1 text-xs font-bold bg-white rounded-lg border border-slate-300 text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-indigo-700 mb-1">Eiweiß (g)</label>
                  <input
                    type="number"
                    min={0}
                    step={0.1}
                    value={proteinPer100g}
                    onChange={(e) => handlePer100gChange('prot', e.target.value)}
                    className="w-full px-2 py-1 text-xs font-bold bg-white rounded-lg border border-slate-300 text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-amber-700 mb-1">Carbs</label>
                  <input
                    type="number"
                    min={0}
                    step={0.1}
                    value={carbsPer100g}
                    onChange={(e) => handlePer100gChange('carbs', e.target.value)}
                    className="w-full px-2 py-1 text-xs font-bold bg-white rounded-lg border border-slate-300 text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-rose-700 mb-1">Fett</label>
                  <input
                    type="number"
                    min={0}
                    step={0.1}
                    value={fatPer100g}
                    onChange={(e) => handlePer100gChange('fat', e.target.value)}
                    className="w-full px-2 py-1 text-xs font-bold bg-white rounded-lg border border-slate-300 text-slate-900"
                  />
                </div>
              </div>
            </div>

            {/* Calculated Portion Totals */}
            <div className="p-3 bg-emerald-50/80 border border-emerald-200 rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-emerald-950 uppercase tracking-wider block">
                    Gesamte Nährwerte ({portionGrams === '' ? 0 : portionGrams} {unit})
                  </span>
                  <span className="text-[10px] text-emerald-700">
                    Wird automatisch bei Mengenänderung angepasst
                  </span>
                </div>
                <span className="text-base font-black text-emerald-900">{calories} kcal</span>
              </div>

              <div className="grid grid-cols-3 gap-2 pt-1 border-t border-emerald-200/60">
                <div className="bg-white/80 p-2 rounded-lg border border-emerald-100 text-center">
                  <span className="text-[10px] font-bold text-indigo-700 block">Eiweiß</span>
                  <span className="text-xs font-black text-slate-900">{proteinG} g</span>
                </div>

                <div className="bg-white/80 p-2 rounded-lg border border-emerald-100 text-center">
                  <span className="text-[10px] font-bold text-amber-700 block">Kohlenhydrate</span>
                  <span className="text-xs font-black text-slate-900">{carbsG} g</span>
                </div>

                <div className="bg-white/80 p-2 rounded-lg border border-emerald-100 text-center">
                  <span className="text-[10px] font-bold text-rose-700 block">Fett</span>
                  <span className="text-xs font-black text-slate-900">{fatG} g</span>
                </div>
              </div>
            </div>

          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-300 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
            >
              Abbrechen
            </button>

            <button
              type="submit"
              className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-colors shadow-xs flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Speichern</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
