import React, { useState } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon, 
  Clock 
} from 'lucide-react';
import { 
  getWeekDays, 
  formatGermanFullDate, 
  getTodayYMD, 
  parseYMDToDate, 
  formatDateToYMD 
} from '../utils/date';
import { CalendarModal } from './CalendarModal';

interface WeekCalendarStripProps {
  selectedDate: string;
  onSelectDate: (dateStr: string) => void;
}

export const WeekCalendarStrip: React.FC<WeekCalendarStripProps> = ({
  selectedDate,
  onSelectDate
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const weekDays = getWeekDays(selectedDate);
  const todayStr = getTodayYMD();
  const isToday = selectedDate === todayStr;

  const handlePrevWeek = () => {
    const d = parseYMDToDate(selectedDate);
    d.setDate(d.getDate() - 7);
    onSelectDate(formatDateToYMD(d));
  };

  const handleNextWeek = () => {
    const d = parseYMDToDate(selectedDate);
    d.setDate(d.getDate() + 7);
    onSelectDate(formatDateToYMD(d));
  };

  const handleTodayClick = () => {
    onSelectDate(todayStr);
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-3">
      
      {/* Top Controls Bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-colors shadow-xs"
          >
            <CalendarIcon className="w-3.5 h-3.5 text-emerald-400" />
            <span>{formatGermanFullDate(selectedDate)}</span>
          </button>

          {!isToday && (
            <button
              type="button"
              onClick={handleTodayClick}
              className="flex items-center gap-1 px-2.5 py-1.5 border border-slate-200 hover:bg-slate-100 rounded-xl text-xs font-bold text-slate-700 transition-colors"
            >
              <Clock className="w-3.5 h-3.5 text-slate-500" />
              <span>Heute</span>
            </button>
          )}
        </div>

        {/* Week Switcher Controls */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={handlePrevWeek}
            className="p-1.5 border border-slate-200 hover:bg-slate-100 rounded-lg text-slate-600 transition-colors"
            title="Vorherige Woche"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          
          <button
            type="button"
            onClick={handleNextWeek}
            className="p-1.5 border border-slate-200 hover:bg-slate-100 rounded-lg text-slate-600 transition-colors"
            title="Nächste Woche"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Week Day Pills Row */}
      <div className="grid grid-cols-7 gap-1.5 sm:gap-2 pt-1">
        {weekDays.map((day) => (
          <button
            key={day.dateStr}
            type="button"
            onClick={() => onSelectDate(day.dateStr)}
            className={`py-2 px-1 rounded-xl text-center flex flex-col items-center justify-center transition-all ${
              day.isSelected
                ? 'bg-slate-900 text-white shadow-xs font-black'
                : day.isToday
                ? 'border-2 border-emerald-600 bg-emerald-50 text-emerald-950 font-bold'
                : 'bg-slate-50 border border-slate-100 hover:bg-slate-100 text-slate-700 font-semibold'
            }`}
          >
            <span className={`text-[10px] uppercase tracking-wider ${day.isSelected ? 'text-emerald-400' : 'text-slate-500'}`}>
              {day.dayName}
            </span>
            <span className="text-sm sm:text-base leading-none mt-0.5">
              {day.dayNumber}
            </span>
          </button>
        ))}
      </div>

      {/* Calendar Modal */}
      <CalendarModal
        isOpen={isModalOpen}
        selectedDate={selectedDate}
        onSelectDate={onSelectDate}
        onClose={() => setIsModalOpen(false)}
      />

    </div>
  );
};
