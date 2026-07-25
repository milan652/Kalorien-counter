/**
 * Helper utilities for German date handling without timezone offset errors
 */

export function formatDateToYMD(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function parseYMDToDate(dateStr: string): Date {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day);
}

export function getTodayYMD(): string {
  return formatDateToYMD(new Date());
}

export function formatGermanFullDate(dateStr: string): string {
  const d = parseYMDToDate(dateStr);
  const today = getTodayYMD();
  
  const yesterdayDate = new Date();
  yesterdayDate.setDate(yesterdayDate.getDate() - 1);
  const yesterday = formatDateToYMD(yesterdayDate);

  const tomorrowDate = new Date();
  tomorrowDate.setDate(tomorrowDate.getDate() + 1);
  const tomorrow = formatDateToYMD(tomorrowDate);

  if (dateStr === today) return 'Heute';
  if (dateStr === yesterday) return 'Gestern';
  if (dateStr === tomorrow) return 'Morgen';

  return d.toLocaleDateString('de-DE', {
    weekday: 'short',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
}

export interface DayItem {
  dateStr: string;
  dayName: string;
  dayNumber: number;
  isToday: boolean;
  isSelected: boolean;
}

/**
 * Get 7 days for week view centered or starting on week of selected date
 */
export function getWeekDays(selectedDateStr: string): DayItem[] {
  const selectedDate = parseYMDToDate(selectedDateStr);
  const todayStr = getTodayYMD();

  // Find Monday of the current week containing selectedDate
  const dayOfWeek = selectedDate.getDay(); // 0 is Sunday, 1 is Monday...
  const distanceToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  
  const monday = new Date(selectedDate);
  monday.setDate(selectedDate.getDate() + distanceToMonday);

  const days: DayItem[] = [];
  const dayNames = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'];

  for (let i = 0; i < 7; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    const dateStr = formatDateToYMD(d);

    days.push({
      dateStr,
      dayName: dayNames[d.getDay()],
      dayNumber: d.getDate(),
      isToday: dateStr === todayStr,
      isSelected: dateStr === selectedDateStr
    });
  }

  return days;
}

export interface CalendarMonthCell {
  dateStr: string;
  dayNumber: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  isSelected: boolean;
}

/**
 * Generate full month matrix grid for calendar modal/popover
 */
export function getMonthGrid(year: number, month: number, selectedDateStr: string): CalendarMonthCell[] {
  const todayStr = getTodayYMD();
  const firstDayOfMonth = new Date(year, month, 1);
  
  // Find Monday preceding or being the first day
  let startDayOfWeek = firstDayOfMonth.getDay(); // 0 = Sun
  let mondayOffset = startDayOfWeek === 0 ? -6 : 1 - startDayOfWeek;

  const startDate = new Date(year, month, 1 + mondayOffset);
  const cells: CalendarMonthCell[] = [];

  // Generate 35 or 42 cells (5 or 6 weeks)
  for (let i = 0; i < 42; i++) {
    const d = new Date(startDate);
    d.setDate(startDate.getDate() + i);
    
    // Stop after 35 if we reached next month and finished week
    if (i >= 35 && d.getMonth() !== month && d.getDay() === 1) {
      break;
    }

    const dateStr = formatDateToYMD(d);

    cells.push({
      dateStr,
      dayNumber: d.getDate(),
      isCurrentMonth: d.getMonth() === month,
      isToday: dateStr === todayStr,
      isSelected: dateStr === selectedDateStr
    });
  }

  return cells;
}
