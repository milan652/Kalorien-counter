import React, { useState, useEffect } from 'react';
import { UserProfile, Gender, ActivityLevel, WeeklyGoal } from '../types';
import { calculateDailyTarget } from '../utils/calculator';
import { 
  CheckCircle2, 
  ChevronRight, 
  ChevronLeft, 
  Scale,
  Flame,
  Info,
  X,
  Target,
  Sliders
} from 'lucide-react';

interface OnboardingWizardProps {
  initialProfile?: UserProfile | null;
  onSave: (profile: Omit<UserProfile, 'uid'>) => void;
  onCancel?: () => void;
  isEditing?: boolean;
}

export const OnboardingWizard: React.FC<OnboardingWizardProps> = ({
  initialProfile,
  onSave,
  onCancel,
  isEditing = false
}) => {
  const [step, setStep] = useState(1);

  // Form State
  const [gender, setGender] = useState<Gender>(initialProfile?.gender || 'male');
  const [age, setAge] = useState<number | ''>(initialProfile?.age || 30);
  const [heightCm, setHeightCm] = useState<number | ''>(initialProfile?.heightCm || 175);
  const [currentWeightKg, setCurrentWeightKg] = useState<number | ''>(initialProfile?.currentWeightKg || 80);
  const [targetWeightKg, setTargetWeightKg] = useState<number | ''>(initialProfile?.targetWeightKg || 73);
  const [activityLevel, setActivityLevel] = useState<ActivityLevel>(initialProfile?.activityLevel || 'moderate');
  const [weeklyGoalKg, setWeeklyGoalKg] = useState<WeeklyGoal>(initialProfile?.weeklyGoalKg || -0.5);

  // Custom Calculated Values
  const [dailyCalorieTarget, setDailyCalorieTarget] = useState<number | ''>(2000);
  const [targetProteinG, setTargetProteinG] = useState<number | ''>(150);
  const [targetCarbsG, setTargetCarbsG] = useState<number | ''>(200);
  const [targetFatG, setTargetFatG] = useState<number | ''>(65);
  const [targetSugarG, setTargetSugarG] = useState<number | ''>(initialProfile?.targetSugarG || 35);
  const [targetWaterMl, setTargetWaterMl] = useState<number | ''>(2500);

  const [calculatedBmr, setCalculatedBmr] = useState<number>(1700);
  const [calculatedTdee, setCalculatedTdee] = useState<number>(2300);

  // Auto Recalculate whenever inputs change
  useEffect(() => {
    const ageNum = typeof age === 'number' ? age : 30;
    const hNum = typeof heightCm === 'number' ? heightCm : 175;
    const wNum = typeof currentWeightKg === 'number' ? currentWeightKg : 80;

    const calc = calculateDailyTarget(gender, wNum, hNum, ageNum, activityLevel, weeklyGoalKg);
    setCalculatedBmr(calc.bmr);
    setCalculatedTdee(calc.tdee);
    setDailyCalorieTarget(calc.dailyCalorieTarget);
    setTargetProteinG(calc.targetProteinG);
    setTargetCarbsG(calc.targetCarbsG);
    setTargetFatG(calc.targetFatG);
    setTargetSugarG(calc.targetSugarG);
    setTargetWaterMl(calc.targetWaterMl);
  }, [gender, currentWeightKg, heightCm, age, activityLevel, weeklyGoalKg]);

  const handleFinish = () => {
    onSave({
      gender,
      age: typeof age === 'number' ? age : 30,
      heightCm: typeof heightCm === 'number' ? heightCm : 175,
      currentWeightKg: typeof currentWeightKg === 'number' ? currentWeightKg : 80,
      targetWeightKg: typeof targetWeightKg === 'number' ? targetWeightKg : 73,
      activityLevel,
      weeklyGoalKg,
      dailyCalorieTarget: typeof dailyCalorieTarget === 'number' ? dailyCalorieTarget : 2000,
      targetProteinG: typeof targetProteinG === 'number' ? targetProteinG : 150,
      targetCarbsG: typeof targetCarbsG === 'number' ? targetCarbsG : 200,
      targetFatG: typeof targetFatG === 'number' ? targetFatG : 65,
      targetSugarG: typeof targetSugarG === 'number' ? targetSugarG : 35,
      targetWaterMl: typeof targetWaterMl === 'number' ? targetWaterMl : 2500,
      onboardingCompleted: true
    });
  };

  // Target estimation in weeks
  const weightDiff = Math.abs((typeof currentWeightKg === 'number' ? currentWeightKg : 80) - (typeof targetWeightKg === 'number' ? targetWeightKg : 73));
  const absWeeklyPace = Math.abs(weeklyGoalKg);
  const estimatedWeeks = absWeeklyPace > 0 ? Math.ceil(weightDiff / absWeeklyPace) : 0;

  return (
    <div className="fixed inset-0 z-50 bg-white flex flex-col h-screen w-screen overflow-y-auto">
      
      {/* Fullscreen Header */}
      <div className="px-6 py-5 border-b border-slate-200 bg-white sticky top-0 z-20 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-slate-900 text-white rounded-xl">
            <Target className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">
              {isEditing ? 'Ernährungsplan & Ziele anpassen' : 'Persönlicher Kalorien- & Ernährungsplan'}
            </h2>
            <p className="text-xs text-slate-500">
              Schritt {step} von 3 • {step === 1 ? 'Biometrie & Aktivität' : step === 2 ? 'Zielgewicht & Tempo' : 'Tagesbedarf & Makros'}
            </p>
          </div>
        </div>

        {onCancel && (
          <button 
            type="button"
            onClick={onCancel}
            className="p-2 text-slate-400 hover:text-slate-800 rounded-xl hover:bg-slate-100 transition-colors"
            title="Schließen"
          >
            <X className="w-6 h-6" />
          </button>
        )}
      </div>

      {/* Fullscreen Body - Spacious and Clean */}
      <div className="max-w-3xl mx-auto w-full p-6 sm:p-10 flex-1 space-y-8">

        {/* Step Progress Bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-slate-700">
            <span>1. Körperdaten</span>
            <span>2. Ziele & Tempo</span>
            <span>3. Tagesbedarf & Zucker-Limit</span>
          </div>
          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden border border-slate-200">
            <div 
              className="bg-slate-900 h-full transition-all duration-300"
              style={{ width: `${(step / 3) * 100}%` }}
            />
          </div>
        </div>

        {/* STEP 1: Body Metrics & Activity */}
        {step === 1 && (
          <div className="space-y-6 pt-2">
            <div>
              <h3 className="text-lg font-bold text-slate-900">1. Körperdaten & Alltagssituation</h3>
              <p className="text-xs text-slate-500 mt-1">
                Diese Angaben werden benötigt, um deinen exakten Grundumsatz (BMR) und Leistungsumsatz zu ermitteln.
              </p>
            </div>

            {/* Gender Selection */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-800">Biologisches Geschlecht</label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { key: 'male', label: 'Männlich' },
                  { key: 'female', label: 'Weiblich' },
                  { key: 'other', label: 'Divers' }
                ].map((g) => (
                  <button
                    key={g.key}
                    type="button"
                    onClick={() => setGender(g.key as Gender)}
                    className={`py-3 px-4 rounded-xl border text-xs font-bold transition-all ${
                      gender === g.key 
                        ? 'border-slate-900 bg-slate-900 text-white' 
                        : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    {g.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Age, Height, Current Weight */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5">Alter (Jahre)</label>
                <input
                  type="number"
                  min={12}
                  max={100}
                  value={age}
                  onChange={(e) => setAge(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 text-xs font-bold rounded-xl border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5">Körpergröße (cm)</label>
                <input
                  type="number"
                  min={120}
                  max={230}
                  value={heightCm}
                  onChange={(e) => setHeightCm(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 text-xs font-bold rounded-xl border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5">Aktuelles Gewicht (kg)</label>
                <input
                  type="number"
                  step={0.1}
                  min={30}
                  max={250}
                  value={currentWeightKg}
                  onChange={(e) => setCurrentWeightKg(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 text-xs font-black text-emerald-700 rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-slate-800"
                />
              </div>
            </div>

            {/* Activity Level */}
            <div className="space-y-3 pt-2">
              <label className="block text-xs font-bold text-slate-800">Aktivitätsniveau im Alltag</label>
              <div className="space-y-2.5">
                {[
                  { 
                    key: 'sedentary', 
                    title: 'Sitzend (z.B. Bürojob / Homeoffice)', 
                    desc: 'Ausschließend sitzende Tätigkeit, wenig bis kein regelmäßiger Sport.' 
                  },
                  { 
                    key: 'light', 
                    title: 'Leicht aktiv', 
                    desc: 'Spaziergänge, leichte Alltagskörperarbeit oder 1-2x Sport pro Woche.' 
                  },
                  { 
                    key: 'moderate', 
                    title: 'Mäßig aktiv (Standard)', 
                    desc: 'Regelmäßige Schritte am Tag, 3-4 Trainingseinheiten pro Woche.' 
                  },
                  { 
                    key: 'active', 
                    title: 'Sehr aktiv', 
                    desc: 'Körperlich fordernder Beruf oder 5-7 intensivere Sporttage.' 
                  },
                  { 
                    key: 'very_active', 
                    title: 'Extrem aktiv', 
                    desc: 'Schwerstarbeit oder Leistungssport mit mehreren Trainingseinheiten täglich.' 
                  }
                ].map((act) => (
                  <button
                    key={act.key}
                    type="button"
                    onClick={() => setActivityLevel(act.key as ActivityLevel)}
                    className={`w-full p-4 rounded-xl border text-left flex items-start justify-between transition-all ${
                      activityLevel === act.key
                        ? 'border-slate-900 bg-slate-50 text-slate-900 font-bold'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <div>
                      <div className="text-xs font-bold text-slate-900">{act.title}</div>
                      <div className="text-[11px] text-slate-500 mt-0.5">{act.desc}</div>
                    </div>
                    {activityLevel === act.key && <CheckCircle2 className="w-5 h-5 text-slate-900 flex-shrink-0" />}
                  </button>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* STEP 2: Goal Specification */}
        {step === 2 && (
          <div className="space-y-6 pt-2">
            <div>
              <h3 className="text-lg font-bold text-slate-900">2. Zielgewicht & Wöchentliches Tempo</h3>
              <p className="text-xs text-slate-500 mt-1">
                Definiere dein Wunschergebnis. Die Anwendung errechnet dein optimales Kaloriendefizit oder -überschuss.
              </p>
            </div>

            {/* Target Weight Selection */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">Dein Zielgewicht (in kg)</label>
                <input
                  type="number"
                  step={0.1}
                  min={30}
                  max={250}
                  value={targetWeightKg}
                  onChange={(e) => setTargetWeightKg(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full px-4 py-2.5 text-sm font-black text-emerald-700 rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-slate-800"
                />
              </div>

              <div className="p-3 bg-white border border-slate-200 rounded-xl flex items-center justify-between text-xs">
                <span className="text-slate-500 font-medium">Gewichtsdifferenz:</span>
                <span className={`font-bold ${(targetWeightKg || 0) < (currentWeightKg || 0) ? 'text-emerald-700' : (targetWeightKg || 0) > (currentWeightKg || 0) ? 'text-amber-700' : 'text-slate-700'}`}>
                  {((typeof targetWeightKg === 'number' ? targetWeightKg : 0) - (typeof currentWeightKg === 'number' ? currentWeightKg : 0)).toFixed(1)} kg {(targetWeightKg || 0) < (currentWeightKg || 0) ? 'Abnehmen' : (targetWeightKg || 0) > (currentWeightKg || 0) ? 'Zunehmen' : 'Halten'}
                </span>
              </div>
            </div>

            {/* Weekly Pace Options */}
            <div className="space-y-3">
              <label className="block text-xs font-bold text-slate-800">Wöchentliches Ziel / Tempo</label>
              <div className="space-y-2.5">
                {[
                  { value: -0.25, label: '- 0,25 kg / Woche', desc: 'Leichtes Defizit (~275 kcal/Tag) • Sehr nachhaltig und entspannt' },
                  { value: -0.5, label: '- 0,50 kg / Woche', desc: 'Empfohlenes Standard-Defizit (~550 kcal/Tag) • Ausgewogen & effektiv' },
                  { value: -0.75, label: '- 0,75 kg / Woche', desc: 'Zügiger Fettabbau (~825 kcal/Tag) • Hohes Kaloriendefizit' },
                  { value: -1.0, label: '- 1,00 kg / Woche', desc: 'Intensives Abnehmen (~1100 kcal/Tag) • Maximale Disziplin erforderlich' },
                  { value: 0, label: 'Gewicht halten', desc: 'Kein Kaloriendefizit • Erhaltungsbedarf für stabiles Gewicht' },
                  { value: 0.25, label: '+ 0,25 kg / Woche', desc: 'Leichter Überschuss (~275 kcal/Tag) • Kontrollierter Muskelaufbau' }
                ].map((g) => (
                  <button
                    key={g.value}
                    type="button"
                    onClick={() => setWeeklyGoalKg(g.value as WeeklyGoal)}
                    className={`w-full p-3.5 rounded-xl border text-left flex items-center justify-between transition-all ${
                      weeklyGoalKg === g.value
                        ? 'border-slate-900 bg-slate-50 text-slate-900 font-bold'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <div>
                      <div className="text-xs font-bold">{g.label}</div>
                      <div className="text-[11px] text-slate-500">{g.desc}</div>
                    </div>
                    {weeklyGoalKg === g.value && <CheckCircle2 className="w-5 h-5 text-slate-900 flex-shrink-0" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Estimated Duration Card */}
            {estimatedWeeks > 0 && (
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <Flame className="w-5 h-5 text-emerald-600 shrink-0" />
                  <div>
                    <span className="font-bold text-emerald-950 block">Prognostizierter Zeitraum</span>
                    <span className="text-[11px] text-emerald-800">
                      Bei konsequenter Einhaltung deines Wochenziels von {weeklyGoalKg} kg
                    </span>
                  </div>
                </div>
                <span className="text-sm font-black text-emerald-900 shrink-0">
                  ca. {estimatedWeeks} Wochen
                </span>
              </div>
            )}

          </div>
        )}

        {/* STEP 3: Calorie & Macro Target & Sugar Limit */}
        {step === 3 && (
          <div className="space-y-6 pt-2">
            <div>
              <h3 className="text-lg font-bold text-slate-900">3. Berechnete Tagesbilanz & Zucker-Limit</h3>
              <p className="text-xs text-slate-500 mt-1">
                Überprüfe deine errechneten Nährstoffziele. Alle Werte können nach eigenen Wünschen angepasst werden.
              </p>
            </div>

            {/* BMR & TDEE Overview */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
                <span className="text-[11px] font-bold text-slate-500 block">Grundumsatz (BMR)</span>
                <span className="text-base font-black text-slate-900">{calculatedBmr} kcal</span>
                <span className="text-[10px] text-slate-400 block mt-0.5">Mindestbedarf in Ruhe</span>
              </div>

              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
                <span className="text-[11px] font-bold text-slate-500 block">Gesamtumsatz (TDEE)</span>
                <span className="text-base font-black text-slate-900">{calculatedTdee} kcal</span>
                <span className="text-[10px] text-slate-400 block mt-0.5">Verbrauch inklusive Alltag</span>
              </div>
            </div>

            {/* Main Daily Calorie Target Input */}
            <div className="p-4 bg-slate-900 text-white rounded-2xl space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Tägliches Kalorienziel</h4>
                  <p className="text-[11px] text-slate-300">Angepasst an dein ausgewähltes Wochenziel</p>
                </div>
                <span className="text-xs font-bold px-2.5 py-1 bg-slate-800 text-slate-200 rounded-lg">
                  {weeklyGoalKg < 0 ? `${weeklyGoalKg} kg / Woche Defizit` : 'Erhalt'}
                </span>
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="number"
                  value={dailyCalorieTarget}
                  onChange={(e) => setDailyCalorieTarget(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full px-4 py-2.5 text-lg font-black text-slate-900 bg-white rounded-xl border-0 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                />
                <span className="text-sm font-bold text-white shrink-0">kcal / Tag</span>
              </div>
            </div>

            {/* Macros Breakdown including Sugar Limit */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-800">Makronährstoffe & Zucker-Höchstgrenze</h4>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                  <label className="text-[10px] font-bold text-indigo-700 uppercase block">Eiweiß (g)</label>
                  <input
                    type="number"
                    value={targetProteinG}
                    onChange={(e) => setTargetProteinG(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 text-xs font-bold bg-white rounded-lg border border-slate-300 text-slate-900"
                  />
                  <span className="text-[10px] text-slate-400 block">{(typeof targetProteinG === 'number' ? targetProteinG : 0) * 4} kcal</span>
                </div>

                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                  <label className="text-[10px] font-bold text-amber-700 uppercase block">Carbs (g)</label>
                  <input
                    type="number"
                    value={targetCarbsG}
                    onChange={(e) => setTargetCarbsG(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 text-xs font-bold bg-white rounded-lg border border-slate-300 text-slate-900"
                  />
                  <span className="text-[10px] text-slate-400 block">{(typeof targetCarbsG === 'number' ? targetCarbsG : 0) * 4} kcal</span>
                </div>

                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                  <label className="text-[10px] font-bold text-rose-700 uppercase block">Fett (g)</label>
                  <input
                    type="number"
                    value={targetFatG}
                    onChange={(e) => setTargetFatG(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 text-xs font-bold bg-white rounded-lg border border-slate-300 text-slate-900"
                  />
                  <span className="text-[10px] text-slate-400 block">{(typeof targetFatG === 'number' ? targetFatG : 0) * 9} kcal</span>
                </div>

                {/* Sugar Max Target */}
                <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl space-y-1">
                  <label className="text-[10px] font-bold text-emerald-800 uppercase block">Max. Zucker (g)</label>
                  <input
                    type="number"
                    value={targetSugarG}
                    onChange={(e) => setTargetSugarG(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 text-xs font-bold bg-white rounded-lg border border-emerald-300 text-slate-900"
                  />
                  <span className="text-[10px] text-emerald-700 block">WHO: Max 25-50g</span>
                </div>
              </div>
            </div>

            {/* Water Target */}
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-900">Tägliches Trinkziel (Wasser)</span>
                <span className="text-[11px] text-slate-500 block">Berechnet anhand deines Körpergewichts</span>
              </div>
              <div className="flex items-center gap-1.5">
                <input
                  type="number"
                  step={100}
                  value={targetWaterMl}
                  onChange={(e) => setTargetWaterMl(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-24 px-3 py-1.5 text-xs font-bold text-slate-900 bg-white rounded-lg border border-slate-300 text-right"
                />
                <span className="text-xs font-bold text-slate-600">ml</span>
              </div>
            </div>

          </div>
        )}

      </div>

      {/* Fullscreen Sticky Footer Controls */}
      <div className="p-6 border-t border-slate-200 bg-white sticky bottom-0 z-20 flex items-center justify-between max-w-3xl mx-auto w-full">
        {step > 1 ? (
          <button
            type="button"
            onClick={() => setStep(step - 1)}
            className="px-5 py-3 border border-slate-300 hover:bg-slate-100 rounded-xl text-xs font-bold text-slate-700 transition-colors flex items-center gap-1.5"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Zurück</span>
          </button>
        ) : (
          isEditing && onCancel ? (
            <button
              type="button"
              onClick={onCancel}
              className="px-5 py-3 text-xs font-bold text-slate-500 hover:text-slate-800"
            >
              Abbrechen
            </button>
          ) : <div />
        )}

        {step < 3 ? (
          <button
            type="button"
            onClick={() => setStep(step + 1)}
            className="px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5"
          >
            <span>Weiter</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        ) : (
          <button
            type="button"
            onClick={handleFinish}
            className="px-8 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-2"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Plan jetzt speichern & starten</span>
          </button>
        )}
      </div>

    </div>
  );
};
