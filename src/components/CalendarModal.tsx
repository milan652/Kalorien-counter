import React, { useState } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon, 
  X, 
  Check, 
  Clock 
} from 'lucide-react';
import { 
  getMonthGrid, 
  getTodayYMD, 
  parseYMDToDate, 
  formatDateToYMD, 
  formatGermanFullDate 
} from '../utils/date';

interface CalendarModalProps {
  isOpen: boolean;
  selectedDate: string; // YYYY-MM-DD
  onSelectDate: (dateStr: string) => void;
  onClose: () => void;
}

export const CalendarModal: React.FC<CalendarModalProps> = ({
  isOpen,
  selectedDate,
  onSelectDate,
  onClose
}) => {
  if (!isOpen) return null;

  const initialDate = parseYMDToDate(selectedDate);
  const [currentYear, setCurrentYear] = useState<number>(initialDate.getFullYear());
  const [currentMonth, setCurrentMonth] = useState<number>(initialDate.getMonth()); // 0-11

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const handleTodayClick = () => {
    const today = getTodayYMD();
    const todayObj = parseYMDToDate(today);
    setCurrentYear(todayObj.getFullYear());
    setCurrentMonth(todayObj.getMonth());
    onSelectDate(today);
    onClose();
  };

  const handleSelectDay = (dateStr: string) => {
    onSelectDate(dateStr);
    onClose();
  };

  const monthGrid = getMonthGrid(currentYear, currentMonth, selectedDate);

  const monthNames = [
    'Januar', 'Februar', 'März', 'April', 'Mai', 'Juni',
    'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'
  ];

  const weekDayHeaders = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'];

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full border border-slate-200 overflow-hidden shadow-xl animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-slate-900 text-emerald-400 rounded-xl">
              <CalendarIcon className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Datum auswählen</h3>
              <p className="text-xs text-slate-500">Ausgewählt: {formatGermanFullDate(selectedDate)}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-800 rounded-lg hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Calendar Body */}
        <div className="p-5 space-y-4">

          {/* Month Navigation & Quick Today Button */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={handlePrevMonth}
                className="p-1.5 border border-slate-200 hover:bg-slate-100 rounded-lg text-slate-700 transition-colors"
                title="Vorheriger Monat"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <span className="text-sm font-bold text-slate-900 px-2 min-w-[130px] text-center">
                {monthNames[currentMonth]} {currentYear}
              </span>

              <button
                type="button"
                onClick={handleNextMonth}
                className="p-1.5 border border-slate-200 hover:bg-slate-100 rounded-lg text-slate-700 transition-colors"
                title="Nächster Monat"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <button
              type="button"
              onClick={handleTodayClick}
              className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5"
            >
              <Clock className="w-3.5 h-3.5 text-emerald-400" />
              <span>Heute</span>
            </button>
          </div>

          {/* Days Grid */}
          <div className="space-y-1.5">
            {/* Weekday headers */}
            <div className="grid grid-cols-7 gap-1 text-center border-b border-slate-100 pb-2">
              {weekDayHeaders.map((header) => (
                <span key={header} className="text-[11px] font-bold text-slate-400 uppercase">
                  {header}
                </span>
              ))}
            </div>

            {/* Day Cells */}
            <div className="grid grid-cols-7 gap-1">
              {monthGrid.map((cell) => {
                return (
                  <button
                    key={cell.dateStr}
                    type="button"
                    onClick={() => handleSelectDay(cell.dateStr)}
                    className={`h-9 w-full rounded-xl text-xs font-bold flex flex-col items-center justify-center transition-all relative ${
                      cell.isSelected
                        ? 'bg-slate-900 text-white shadow-xs'
                        : cell.isToday
                        ? 'border-2 border-emerald-600 bg-emerald-50 text-emerald-950'
                        : cell.isCurrentMonth
                        ? 'hover:bg-slate-100 text-slate-800'
                        : 'text-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <span>{cell.dayNumber}</span>
                    {cell.isToday && !cell.isSelected && (
                      <span className="w-1 h-1 bg-emerald-600 rounded-full absolute bottom-1" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Native Date Picker Fallback / Quick Input */}
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500 font-medium">Direktes Datum eingeben:</span>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => {
                if (e.target.value) {
                  handleSelectDay(e.target.value);
                }
              }}
              className="px-3 py-1.5 border border-slate-300 rounded-lg text-slate-900 font-bold bg-white focus:outline-none focus:ring-2 focus:ring-slate-800 text-xs"
            />
          </div>

        </div>

      </div>
    </div>
  );
};
