import React, { useState } from 'react';
import { UserProfile } from '../types';
import { 
  Scale, 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  User, 
  LogOut, 
  LogIn, 
  Sparkles,
  Sliders
} from 'lucide-react';
import { formatGermanFullDate, parseYMDToDate, formatDateToYMD } from '../utils/date';
import { CalendarModal } from './CalendarModal';

interface HeaderProps {
  user: any;
  profile: UserProfile | null;
  selectedDate: string; // YYYY-MM-DD
  onDateChange: (newDate: string) => void;
  activeTab: 'daily' | 'coach' | 'profile';
  onTabChange: (tab: 'daily' | 'coach' | 'profile') => void;
  onOpenAuth: () => void;
  onLogout: () => void;
  onOpenOnboarding: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  user,
  profile,
  selectedDate,
  onDateChange,
  activeTab,
  onTabChange,
  onOpenAuth,
  onLogout,
  onOpenOnboarding
}) => {
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  const handlePrevDay = () => {
    const d = parseYMDToDate(selectedDate);
    d.setDate(d.getDate() - 1);
    onDateChange(formatDateToYMD(d));
  };

  const handleNextDay = () => {
    const d = parseYMDToDate(selectedDate);
    d.setDate(d.getDate() + 1);
    onDateChange(formatDateToYMD(d));
  };

  const handleToday = () => {
    onDateChange(new Date().toISOString().split('T')[0]);
  };

  const isToday = selectedDate === new Date().toISOString().split('T')[0];

  const formatDisplayDate = (dateStr: string) => {
    const d = new Date(dateStr);
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
    
    if (dateStr === today) return 'Heute';
    if (dateStr === yesterday) return 'Gestern';

    return d.toLocaleDateString('de-DE', { weekday: 'short', day: '2-digit', month: '2-digit' });
  };

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        
        {/* Brand Logo & Title */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold text-lg shadow-xs">
            <Scale className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <h1 className="text-base font-bold text-slate-900 leading-none">
              KalorienPlaner
            </h1>
            <p className="text-xs text-slate-500 font-medium">Abnehmen & KI-Scan</p>
          </div>
        </div>

        {/* Date Selector (for Daily View) */}
        {activeTab === 'daily' && (
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200">
            <button
              onClick={handlePrevDay}
              className="p-1.5 hover:bg-white rounded-md text-slate-600 transition-colors"
              title="Vorheriger Tag"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            
            <button
              onClick={() => setIsCalendarOpen(true)}
              className="px-3 py-1 text-xs font-bold text-slate-800 hover:text-slate-900 hover:bg-white rounded-md flex items-center gap-1.5 transition-colors"
              title="Kalender öffnen"
            >
              <CalendarIcon className="w-3.5 h-3.5 text-emerald-600" />
              <span>{formatGermanFullDate(selectedDate)}</span>
            </button>

            <button
              onClick={handleNextDay}
              className="p-1.5 hover:bg-white rounded-md text-slate-600 transition-colors"
              title="Nächster Tag"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* User Account State */}
        <div className="flex items-center gap-2">
          {user ? (
            <div className="flex items-center gap-2">
              <button
                onClick={() => onTabChange('profile')}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
              >
                <User className="w-4 h-4 text-slate-500" />
                <span className="hidden sm:inline">
                  {user.isAnonymous ? 'Gast-Konto' : (profile?.displayName || user.email?.split('@')[0] || 'Mein Konto')}
                </span>
              </button>

              <button
                onClick={onLogout}
                className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                title="Abmelden"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenAuth}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold transition-colors shadow-xs"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Anmelden</span>
            </button>
          )}
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-t border-slate-100 bg-slate-50">
        <div className="max-w-6xl mx-auto px-4 flex gap-1">
          <button
            onClick={() => onTabChange('daily')}
            className={`px-4 py-2.5 text-xs font-semibold border-b-2 flex items-center gap-2 transition-colors ${
              activeTab === 'daily'
                ? 'border-emerald-600 text-emerald-800 bg-white'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>Tagesübersicht</span>
          </button>

          <button
            onClick={() => onTabChange('coach')}
            className={`px-4 py-2.5 text-xs font-semibold border-b-2 flex items-center gap-2 transition-colors ${
              activeTab === 'coach'
                ? 'border-emerald-600 text-emerald-800 bg-white'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>KI-Coach</span>
          </button>

          <button
            onClick={() => onTabChange('profile')}
            className={`px-4 py-2.5 text-xs font-semibold border-b-2 flex items-center gap-2 transition-colors ${
              activeTab === 'profile'
                ? 'border-emerald-600 text-emerald-800 bg-white'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Sliders className="w-3.5 h-3.5 text-slate-400" />
            <span>Profil & Ziele</span>
          </button>
        </div>
      </div>

      {/* Calendar Modal */}
      <CalendarModal
        isOpen={isCalendarOpen}
        selectedDate={selectedDate}
        onSelectDate={onDateChange}
        onClose={() => setIsCalendarOpen(false)}
      />
    </header>
  );
};
