import React, { useState } from 'react';
import { UserProfile, WeightLog, MealEntry } from '../types';
import { 
  TrendingDown, 
  Scale, 
  Calendar, 
  Flame, 
  Plus, 
  Award, 
  CheckCircle2, 
  Info,
  TrendingUp
} from 'lucide-react';

interface ProgressAnalysisProps {
  profile: UserProfile;
  weightLogs: WeightLog[];
  onAddWeightLog: (weightKg: number, notes?: string) => void;
}

export const ProgressAnalysis: React.FC<ProgressAnalysisProps> = ({
  profile,
  weightLogs,
  onAddWeightLog
}) => {
  const [timeframe, setTimeframe] = useState<7 | 14 | 30>(7);
  const [newWeight, setNewWeight] = useState<string>('');
  const [weightNote, setWeightNote] = useState<string>('');
  const [showAddWeight, setShowAddWeight] = useState<boolean>(false);

  // Weight Calculations
  const currentWeight = weightLogs.length > 0 
    ? weightLogs[weightLogs.length - 1].weightKg 
    : profile.currentWeightKg;
  
  const startWeight = profile.currentWeightKg;
  const targetWeight = profile.targetWeightKg;
  const weightChange = currentWeight - startWeight;
  const remainingToGoal = currentWeight - targetWeight;

  const handleSaveWeight = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWeight) return;
    onAddWeightLog(Number(newWeight), weightNote.trim());
    setNewWeight('');
    setWeightNote('');
    setShowAddWeight(false);
  };

  // Mock past days calorie balances for analysis demonstration
  const generatePastDaysData = (daysCount: number) => {
    const today = new Date();
    const list = [];
    for (let i = daysCount - 1; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const dayName = d.toLocaleDateString('de-DE', { weekday: 'short', day: '2-digit', month: '2-digit' });
      
      // Target vs Simulated or actual intake
      const target = profile.dailyCalorieTarget || 2000;
      // Variance simulation for realistic analytics
      const variance = (i * 37) % 350 - 150;
      const consumed = Math.max(1200, Math.round(target + variance));
      const deficit = target - consumed;

      list.push({
        dateStr,
        dayName,
        target,
        consumed,
        deficit,
        isDeficit: deficit >= 0
      });
    }
    return list;
  };

  const daysData = generatePastDaysData(timeframe);
  const totalDeficit = daysData.reduce((sum, d) => sum + d.deficit, 0);
  const avgConsumed = Math.round(daysData.reduce((sum, d) => sum + d.consumed, 0) / daysData.length);
  const deficitDaysCount = daysData.filter(d => d.isDeficit).length;
  const estimatedFatLostKg = (totalDeficit / 7700).toFixed(2);

  const maxCalorieInChart = Math.max(...daysData.map(d => Math.max(d.consumed, d.target))) * 1.15;

  return (
    <div className="space-y-6">

      {/* Header & Timeframe Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-base font-bold text-slate-900">Fortschrittsanalyse & Kalorienbilanz</h2>
          <p className="text-xs text-slate-500">Detaillierter Überblick deiner Ergebnisse, Trends und Gewichtsverlauf</p>
        </div>

        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
          {[7, 14, 30].map((t) => (
            <button
              key={t}
              onClick={() => setTimeframe(t as any)}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition-colors ${
                timeframe === t ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              {t} Tage
            </button>
          ))}
        </div>
      </div>

      {/* Metric Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: Weight Loss */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase">Gewichtsänderung</span>
            <Scale className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-xl font-black text-slate-900">
            {weightChange <= 0 ? `${weightChange.toFixed(1)} kg` : `+${weightChange.toFixed(1)} kg`}
          </div>
          <p className="text-[11px] text-slate-500">
            Aktuell: <strong className="text-slate-800">{currentWeight} kg</strong> (Ziel: {targetWeight} kg)
          </p>
        </div>

        {/* Card 2: Accumulated Calorie Deficit */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase">Gesamt-Kaloriendefizit</span>
            <Flame className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-xl font-black text-emerald-700">
            {totalDeficit >= 0 ? `-${totalDeficit} kcal` : `+${Math.abs(totalDeficit)} kcal`}
          </div>
          <p className="text-[11px] text-slate-500">
            In den letzten {timeframe} Tagen aufgebaut
          </p>
        </div>

        {/* Card 3: Fat Loss Estimation */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase">Reines Fettabbau-Äquivalent</span>
            <Award className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-xl font-black text-slate-900">
            ~ {estimatedFatLostKg} kg
          </div>
          <p className="text-[11px] text-slate-500">
            Rechnerisch (1 kg Fett ≈ 7.700 kcal)
          </p>
        </div>

        {/* Card 4: Success Days */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase">Tage im Defizit</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-xl font-black text-slate-900">
            {deficitDaysCount} / {timeframe} Tage
          </div>
          <p className="text-[11px] text-slate-500">
            Erfolgsquote: {Math.round((deficitDaysCount / timeframe) * 100)}%
          </p>
        </div>

      </div>

      {/* Main Bar Chart: Daily Calorie Balance */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Tägliche Kalorienbilanz ({timeframe} Tage)</h3>
            <p className="text-xs text-slate-500">
              Vergleich von Soll-Ziellinie und aufgenommenen Kalorien pro Tag
            </p>
          </div>

          <div className="flex items-center gap-4 text-xs font-semibold">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-xs bg-emerald-500 inline-block"></span>
              <span className="text-slate-600">Im Defizit</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-xs bg-rose-500 inline-block"></span>
              <span className="text-slate-600">Überschuss</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-0.5 bg-slate-900 inline-block"></span>
              <span className="text-slate-600">Tagesziel</span>
            </div>
          </div>
        </div>

        {/* Visual Bar Chart (SVG / Pure CSS Flex Bars) */}
        <div className="pt-6 pb-2">
          <div className="h-56 flex items-end gap-2 border-b border-slate-200 pb-2 relative">
            
            {/* Target Line Indicator */}
            <div 
              className="absolute left-0 right-0 border-t-2 border-dashed border-slate-800 z-10 pointer-events-none"
              style={{ bottom: `${((profile.dailyCalorieTarget || 2000) / maxCalorieInChart) * 100}%` }}
            >
              <span className="absolute right-0 -top-3 text-[10px] font-bold text-slate-900 bg-white px-1">
                Ziel: {profile.dailyCalorieTarget} kcal
              </span>
            </div>

            {/* Bars */}
            {daysData.map((d, idx) => {
              const heightPercent = Math.min(100, Math.round((d.consumed / maxCalorieInChart) * 100));
              return (
                <div key={idx} className="flex-1 flex flex-col items-center gap-1 group relative h-full justify-end">
                  
                  {/* Tooltip on hover */}
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-10 bg-slate-900 text-white text-[10px] font-bold py-1 px-2 rounded-md pointer-events-none whitespace-nowrap z-20 shadow-md">
                    {d.dayName}: {d.consumed} kcal ({d.isDeficit ? `Defizit -${d.deficit}` : `+${Math.abs(d.deficit)}`})
                  </div>

                  <div 
                    className={`w-full rounded-t-md transition-all duration-300 ${
                      d.isDeficit ? 'bg-emerald-500 hover:bg-emerald-600' : 'bg-rose-500 hover:bg-rose-600'
                    }`}
                    style={{ height: `${heightPercent}%` }}
                  />

                  <span className="text-[10px] font-medium text-slate-500 truncate w-full text-center mt-1">
                    {d.dayName.split(',')[0]}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Weight Log & Tracker Section */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Gewichtsverlauf & Logbuch</h3>
            <p className="text-xs text-slate-500">Trage deine regelmäßigen Wiege-Ergebnisse ein</p>
          </div>

          <button
            onClick={() => setShowAddWeight(!showAddWeight)}
            className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1"
          >
            <Plus className="w-4 h-4" />
            <span>Gewicht wiegen</span>
          </button>
        </div>

        {/* Add Weight Form */}
        {showAddWeight && (
          <form onSubmit={handleSaveWeight} className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
            <h4 className="text-xs font-bold text-slate-800">Neues Wiege-Ergebnis hinzufügen</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">Gewicht (kg)</label>
                <input
                  type="number"
                  step={0.1}
                  required
                  value={newWeight}
                  onChange={(e) => setNewWeight(e.target.value)}
                  placeholder="z.B. 74.5"
                  className="w-full px-3 py-1.5 text-xs font-bold rounded-lg border border-slate-300"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">Notiz (Optional)</label>
                <input
                  type="text"
                  value={weightNote}
                  onChange={(e) => setWeightNote(e.target.value)}
                  placeholder="z.B. Nüchtern nach dem Aufstehen"
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setShowAddWeight(false)}
                className="px-3 py-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800"
              >
                Abbrechen
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 bg-emerald-600 text-white text-xs font-bold rounded-lg hover:bg-emerald-700"
              >
                Eintrag speichern
              </button>
            </div>
          </form>
        )}

        {/* Weight Entries History List */}
        {weightLogs.length === 0 ? (
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-center text-xs text-slate-500">
            Noch keine Wiege-Einträge vorhanden. Klicke oben auf "Gewicht wiegen".
          </div>
        ) : (
          <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden">
            {weightLogs.slice().reverse().map((log) => (
              <div key={log.id} className="p-3 flex items-center justify-between text-xs hover:bg-slate-50">
                <div className="flex items-center gap-2">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <span className="font-semibold text-slate-700">{log.date}</span>
                  {log.notes && <span className="text-slate-400 text-[11px]">({log.notes})</span>}
                </div>
                <span className="font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded-md">
                  {log.weightKg} kg
                </span>
              </div>
            ))}
          </div>
        )}

      </div>

    </div>
  );
};
