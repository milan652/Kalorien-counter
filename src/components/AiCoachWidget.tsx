import React, { useState } from 'react';
import { UserProfile, MealEntry } from '../types';
import { Sparkles, RefreshCw, CheckCircle2, Flame, Info } from 'lucide-react';

interface AiCoachWidgetProps {
  profile: UserProfile;
  meals: MealEntry[];
}

export const AiCoachWidget: React.FC<AiCoachWidgetProps> = ({ profile, meals }) => {
  const [advice, setAdvice] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const totalCalories = meals.reduce((s, m) => s + (m.calories || 0), 0);
  const totalProtein = meals.reduce((s, m) => s + (m.proteinG || 0), 0);
  const remainingCalories = (profile.dailyCalorieTarget || 2000) - totalCalories;

  const handleFetchAdvice = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/nutrition-advice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          remainingCalories,
          targetCalories: profile.dailyCalorieTarget,
          consumedProtein: totalProtein,
          targetProtein: profile.targetProteinG,
          goal: profile.weeklyGoalKg < 0 ? 'Abnehmen / Fettabbau' : 'Gewicht halten'
        })
      });

      if (!response.ok) {
        throw new Error('Konnte keine Ratschläge laden.');
      }

      const data = await response.json();
      setAdvice(data.advice);
    } catch (err: any) {
      console.error(err);
      setError('Der KI-Ernährungsberater konnte gerade keine Antwort generieren.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-5 max-w-3xl mx-auto">
      
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
            <Sparkles className="w-5 h-5 text-amber-600" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">KI Ernährungsberater</h2>
            <p className="text-xs text-slate-500">Persönliches Feedback zu deinen heutigen Nährwerten</p>
          </div>
        </div>

        <button
          onClick={handleFetchAdvice}
          disabled={loading}
          className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 shadow-xs"
        >
          {loading ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Analysiere...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Analyse anfordern</span>
            </>
          )}
        </button>
      </div>

      {/* Overview Snapshot */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
          <span className="text-[10px] font-bold text-slate-400 uppercase block">Verbleibende Kalorien</span>
          <span className="text-sm font-bold text-slate-800">{remainingCalories} kcal</span>
        </div>

        <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
          <span className="text-[10px] font-bold text-slate-400 uppercase block">Protein Lücke</span>
          <span className="text-sm font-bold text-indigo-700">
            {Math.max(0, (profile.targetProteinG || 150) - totalProtein)}g fehlen
          </span>
        </div>

        <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
          <span className="text-[10px] font-bold text-slate-400 uppercase block">Ernährungsziel</span>
          <span className="text-sm font-bold text-emerald-800">
            {profile.weeklyGoalKg < 0 ? `${profile.weeklyGoalKg} kg / Woche` : 'Gewicht halten'}
          </span>
        </div>
      </div>

      {/* Result Display */}
      {error && (
        <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs font-semibold text-rose-700">
          {error}
        </div>
      )}

      {advice ? (
        <div className="p-4 bg-emerald-50/60 border border-emerald-200 rounded-2xl text-xs font-medium text-slate-800 whitespace-pre-line leading-relaxed">
          {advice}
        </div>
      ) : (
        <div className="p-6 text-center border-2 border-dashed border-slate-200 rounded-2xl space-y-2">
          <p className="text-xs font-semibold text-slate-700">
            Klicke oben auf "Analyse anfordern" für ein maßgeschneidertes KI-Feedback.
          </p>
          <p className="text-[11px] text-slate-400">
            Gemini bewertet deine verbleibenden Kalorien und empfiehlt dir passendes Essen für den Abend.
          </p>
        </div>
      )}

    </div>
  );
};
