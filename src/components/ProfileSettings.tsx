import React, { useState } from 'react';
import { UserProfile } from '../types';
import { OnboardingWizard } from './OnboardingWizard';
import { Sliders, User, ShieldCheck, LogOut } from 'lucide-react';

interface ProfileSettingsProps {
  user: any;
  profile: UserProfile | null;
  onSaveProfile: (profile: Omit<UserProfile, 'uid'>) => void;
  onOpenAuth: () => void;
  onLogout: () => void;
}

export const ProfileSettings: React.FC<ProfileSettingsProps> = ({
  user,
  profile,
  onSaveProfile,
  onOpenAuth,
  onLogout
}) => {
  const [isEditing, setIsEditing] = useState(false);

  if (isEditing) {
    return (
      <OnboardingWizard
        initialProfile={profile}
        isEditing={true}
        onSave={(updated) => {
          onSaveProfile(updated);
          setIsEditing(false);
        }}
        onCancel={() => setIsEditing(false)}
      />
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6 max-w-3xl mx-auto">
      
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold">
            <User className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">Profil & Ernährungsziele</h2>
            <p className="text-xs text-slate-500">Körperdaten, Kalorienziel und App-Einstellungen</p>
          </div>
        </div>

        <button
          onClick={() => setIsEditing(true)}
          className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 shadow-xs"
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>Daten anpassen</span>
        </button>
      </div>

      {/* Account Info Box */}
      <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between">
        <div className="flex items-center gap-3">
          <ShieldCheck className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          <div>
            <div className="text-xs font-bold text-slate-900">
              {user ? (user.isAnonymous ? 'Gast-Zugang' : user.email) : 'Nicht angemeldet'}
            </div>
            <div className="text-[11px] text-slate-500">
              {user?.isAnonymous 
                ? 'Du nutzt zurzeit ein temporäres Gast-Konto. Melde dich an, um deine Daten dauerhaft zu sichern.'
                : 'Deine Kalorien- und Wiegedaten werden sicher in Firebase Cloud gespeichert.'}
            </div>
          </div>
        </div>

        {user?.isAnonymous ? (
          <button
            onClick={onOpenAuth}
            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg transition-colors flex-shrink-0"
          >
            Konto verknüpfen
          </button>
        ) : (
          <button
            onClick={onLogout}
            className="px-3 py-1.5 border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-bold rounded-lg transition-colors flex-shrink-0 flex items-center gap-1"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Abmelden</span>
          </button>
        )}
      </div>

      {/* Target Parameters Breakdown */}
      {profile && (
        <div className="space-y-4">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
            Aktuell konfigurierte Zielwerte
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
              <span className="text-[10px] font-bold text-slate-400 uppercase block">Körpergewicht</span>
              <span className="text-sm font-black text-slate-800">{profile.currentWeightKg} kg</span>
              <span className="text-[10px] text-slate-500 block">Ziel: {profile.targetWeightKg} kg</span>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
              <span className="text-[10px] font-bold text-slate-400 uppercase block">Tagesziel Kalorien</span>
              <span className="text-sm font-black text-emerald-700">{profile.dailyCalorieTarget} kcal</span>
              <span className="text-[10px] text-slate-500 block">
                {profile.weeklyGoalKg < 0 ? `${profile.weeklyGoalKg} kg / Woche` : 'Halten'}
              </span>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
              <span className="text-[10px] font-bold text-indigo-700 uppercase block">Protein Ziel</span>
              <span className="text-sm font-black text-indigo-900">{profile.targetProteinG} g</span>
              <span className="text-[10px] text-slate-400 block">{profile.targetProteinG * 4} kcal</span>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
              <span className="text-[10px] font-bold text-emerald-800 uppercase block">Max. Zucker</span>
              <span className="text-sm font-black text-emerald-900">{profile.targetSugarG || 35} g</span>
              <span className="text-[10px] text-slate-500 block">Tageslimit</span>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
              <span className="text-[10px] font-bold text-slate-400 uppercase block">Trinkziel Wasser</span>
              <span className="text-sm font-black text-blue-800">{profile.targetWaterMl} ml</span>
              <span className="text-[10px] text-slate-500 block">Pro Tag</span>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
