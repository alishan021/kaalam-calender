import React from 'react';
import {
  toMalayalam, toHijriParts,
  findHijriMonthStart, findHijriMonthEnd,
  findMalayalamMonthStart, findMalayalamMonthEnd,
  getHijriMonthIndex, getHijriYear,
  navigateToHijri, navigateToMalayalam,
  ISLAMIC_MONTHS, MALAYALAM_MONTHS,
} from '@/lib/calendar';
import {
  format, isSameDay,
  startOfMonth, endOfMonth, startOfWeek, endOfWeek,
  startOfDay, endOfDay,
  addDays,
} from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export type CalendarMode = 'gregorian' | 'hijri' | 'malayalam';

const GREG_MONTHS = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December',
];

const GREG_YEARS: number[] = [];
for (let y = 1900; y <= 2100; y++) GREG_YEARS.push(y);

const HIJRI_YEARS: number[] = [];
for (let y = 1300; y <= 1600; y++) HIJRI_YEARS.push(y);

const MAL_YEARS: number[] = [];
for (let y = 1100; y <= 1300; y++) MAL_YEARS.push(y);

// ── helpers ──────────────────────────────────────────────────────────────────

function setGregMonth(d: Date, month: number) {
  const n = new Date(d); n.setMonth(month); return n;
}
function setGregYear(d: Date, year: number) {
  const n = new Date(d); n.setFullYear(year); return n;
}
function shiftDate(d: Date, days: number) {
  const n = new Date(d); n.setDate(n.getDate() + days); return n;
}

// ─────────────────────────────────────────────────────────────────────────────

interface CalendarGridProps {
  currentDate: Date;
  onDateSelect: (d: Date) => void;
  selectedDate: Date;
  mode: CalendarMode;
}

export function CalendarGrid({ currentDate, onDateSelect, selectedDate, mode }: CalendarGridProps) {
  const [viewDate, setViewDate] = React.useState(new Date(currentDate));

  // When the selected date changes externally (e.g. date picker), sync viewDate
  React.useEffect(() => {
    setViewDate(new Date(currentDate));
  }, [currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate()]);

  // ── Compute month bounds based on mode ───────────────────────────────────

  const monthStart = React.useMemo(() => {
    if (mode === 'hijri')     return startOfDay(findHijriMonthStart(viewDate));
    if (mode === 'malayalam') return startOfDay(findMalayalamMonthStart(viewDate));
    return startOfMonth(viewDate);
  }, [viewDate, mode]);

  const monthEnd = React.useMemo(() => {
    if (mode === 'hijri')     return endOfDay(findHijriMonthEnd(monthStart));
    if (mode === 'malayalam') return endOfDay(findMalayalamMonthEnd(monthStart));
    return endOfMonth(viewDate);
  }, [monthStart, viewDate, mode]);

  // ── Header label ─────────────────────────────────────────────────────────

  const headerLabel = React.useMemo(() => {
    if (mode === 'hijri') {
      const p = toHijriParts(monthStart);
      return { month: p.month ?? '', year: p.year ?? '' };
    }
    if (mode === 'malayalam') {
      const m = toMalayalam(monthStart);
      return { month: m.month, year: String(m.year) };
    }
    return { month: GREG_MONTHS[monthStart.getMonth()], year: String(monthStart.getFullYear()) };
  }, [monthStart, mode]);

  // ── Navigation ───────────────────────────────────────────────────────────

  const goPrev = () => {
    if (mode === 'hijri')     return setViewDate(shiftDate(monthStart, -1));
    if (mode === 'malayalam') return setViewDate(shiftDate(monthStart, -1));
    const d = new Date(viewDate); d.setMonth(d.getMonth() - 1); setViewDate(d);
  };

  const goNext = () => {
    if (mode === 'hijri')     return setViewDate(shiftDate(monthEnd, 1));
    if (mode === 'malayalam') return setViewDate(shiftDate(monthEnd, 1));
    const d = new Date(viewDate); d.setMonth(d.getMonth() + 1); setViewDate(d);
  };

  // ── Dropdown selectors ───────────────────────────────────────────────────

  const handleMonthChange = (idx: number) => {
    if (mode === 'hijri') {
      setViewDate(navigateToHijri(idx + 1, getHijriYear(viewDate), viewDate));
    } else if (mode === 'malayalam') {
      const cur = toMalayalam(viewDate);
      setViewDate(navigateToMalayalam(idx + 1, cur.year, viewDate));
    } else {
      setViewDate(setGregMonth(viewDate, idx));
    }
  };

  const handleYearChange = (year: number) => {
    if (mode === 'hijri') {
      setViewDate(navigateToHijri(getHijriMonthIndex(viewDate), year, viewDate));
    } else if (mode === 'malayalam') {
      const cur = toMalayalam(viewDate);
      setViewDate(navigateToMalayalam(cur.monthIndex, year, viewDate));
    } else {
      setViewDate(setGregYear(viewDate, year));
    }
  };

  const selectedMonthIdx = React.useMemo(() => {
    if (mode === 'hijri')     return getHijriMonthIndex(monthStart) - 1;
    if (mode === 'malayalam') return toMalayalam(monthStart).monthIndex - 1;
    return monthStart.getMonth();
  }, [monthStart, mode]);

  const selectedYear = React.useMemo(() => {
    if (mode === 'hijri')     return getHijriYear(monthStart);
    if (mode === 'malayalam') return toMalayalam(monthStart).year;
    return monthStart.getFullYear();
  }, [monthStart, mode]);

  const months   = mode === 'gregorian' ? GREG_MONTHS : mode === 'hijri' ? ISLAMIC_MONTHS : MALAYALAM_MONTHS;
  const years    = mode === 'gregorian' ? GREG_YEARS  : mode === 'hijri' ? HIJRI_YEARS    : MAL_YEARS;

  // ── Build grid ───────────────────────────────────────────────────────────

  const gridStart = startOfWeek(monthStart, { weekStartsOn: 0 });
  const gridEnd   = endOfWeek(monthEnd,   { weekStartsOn: 0 });

  const rows: React.ReactNode[] = [];
  let days: React.ReactNode[] = [];
  let day = gridStart;

  while (day <= gridEnd) {
    for (let i = 0; i < 7; i++) {
      const cloneDay = day;
      const isInMonth = day >= monthStart && day <= monthEnd;
      const isSelected = isSameDay(day, selectedDate);
      const isToday    = isSameDay(day, new Date());

      const mal = isInMonth ? toMalayalam(day)  : null;
      const hij = isInMonth ? toHijriParts(day) : null;

      let primary = '';
      let sub1    = '';
      let sub2    = '';

      if (mode === 'gregorian') {
        primary = format(day, 'd');
        sub1    = hij ? `${hij.day} ${(hij.month ?? '').slice(0, 3)}` : '';
        sub2    = mal ? `${mal.day} ${mal.month.slice(0, 4)}`        : '';
      } else if (mode === 'hijri') {
        primary = hij?.day ?? '';
        sub1    = format(day, 'd MMM');
        sub2    = mal ? `${mal.day} ${mal.month.slice(0, 4)}`        : '';
      } else {
        primary = mal ? String(mal.day) : '';
        sub1    = mal?.month.slice(0, 4) ?? '';
        sub2    = format(day, 'd MMM');
      }

      days.push(
        <div
          key={day.toString()}
          data-testid={`cell-${format(day, 'yyyy-MM-dd')}`}
          onClick={() => onDateSelect(cloneDay)}
          className={[
            'relative flex flex-col p-1 sm:p-2 border-b border-r cursor-pointer transition-colors select-none',
            'min-h-[52px] sm:min-h-[76px] md:min-h-[88px]',
            !isInMonth
              ? 'text-muted-foreground/30 bg-muted/5'
              : 'text-foreground bg-card hover:bg-muted/40 active:bg-muted/60',
            isSelected ? 'ring-2 ring-inset ring-primary bg-primary/8' : '',
            isToday && !isSelected ? 'bg-amber-50 dark:bg-amber-950/20' : '',
          ].filter(Boolean).join(' ')}
        >
          <span className={[
            'text-sm sm:text-base md:text-lg font-medium leading-tight',
            isSelected ? 'text-primary font-bold' : '',
            isToday && !isSelected ? 'text-amber-700 dark:text-amber-400 font-semibold' : '',
          ].filter(Boolean).join(' ')}>
            {isInMonth ? primary : format(day, 'd')}
          </span>

          {isInMonth && (
            <div className="flex flex-col gap-0 mt-0.5">
              {sub1 && (
                <span className="hidden sm:block text-[0.58rem] md:text-[0.63rem] text-blue-700/70 dark:text-blue-300/70 font-medium leading-tight truncate">
                  {sub1}
                </span>
              )}
              {sub2 && (
                <span className="hidden sm:block text-[0.58rem] md:text-[0.63rem] text-foreground/50 leading-tight truncate">
                  {sub2}
                </span>
              )}
            </div>
          )}
        </div>
      );
      day = addDays(day, 1);
    }
    rows.push(
      <div className="grid grid-cols-7" key={day.toString()}>
        {days}
      </div>
    );
    days = [];
  }

  // ── Render ───────────────────────────────────────────────────────────────

  const dropdownStyle: React.CSSProperties = {
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6'%3E%3Cpath d='M0 0l5 6 5-6z' fill='%23888'/%3E%3C/svg%3E")`,
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'right 2px center',
  };

  return (
    <div className="flex flex-col border rounded-xl overflow-hidden bg-card shadow-sm">

      {/* Header */}
      <div className="flex items-center justify-between gap-2 px-3 py-3 border-b bg-muted/20">
        <button
          data-testid="btn-prev-month"
          onClick={goPrev}
          className="p-1.5 hover:bg-muted rounded-full transition-colors flex-shrink-0"
          aria-label="Previous month"
        >
          <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>

        <div className="flex items-center gap-2 flex-1 justify-center">
          <select
            data-testid="select-month"
            value={selectedMonthIdx}
            onChange={(e) => handleMonthChange(Number(e.target.value))}
            className="bg-transparent font-serif font-semibold text-sm sm:text-base text-foreground border-0 outline-none cursor-pointer appearance-none pr-5 hover:text-primary transition-colors max-w-[150px] sm:max-w-none truncate"
            style={dropdownStyle}
          >
            {months.map((m, i) => (
              <option key={m} value={i}>{m}</option>
            ))}
          </select>

          <select
            data-testid="select-year"
            value={selectedYear}
            onChange={(e) => handleYearChange(Number(e.target.value))}
            className="bg-transparent font-serif font-semibold text-sm sm:text-base text-foreground border-0 outline-none cursor-pointer appearance-none pr-5 hover:text-primary transition-colors"
            style={dropdownStyle}
          >
            {years.map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>

        <button
          data-testid="btn-next-month"
          onClick={goNext}
          className="p-1.5 hover:bg-muted rounded-full transition-colors flex-shrink-0"
          aria-label="Next month"
        >
          <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>
      </div>

      {/* Day-of-week row */}
      <div className="grid grid-cols-7 border-b bg-muted/30 text-muted-foreground font-medium text-[0.6rem] sm:text-xs py-1.5 text-center uppercase tracking-wider">
        {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map((d) => (
          <div key={d}>{d}</div>
        ))}
      </div>

      <div className="flex-col flex">{rows}</div>

      {/* Legend */}
      <div className="hidden sm:flex items-center gap-4 px-3 py-2 border-t bg-muted/10 text-[0.6rem] text-muted-foreground">
        {mode === 'gregorian' && (<>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-500/50 inline-block" /> Hijri</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-foreground/30 inline-block" /> Kollavarsham</span>
        </>)}
        {mode === 'hijri' && (<>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-500/50 inline-block" /> Gregorian</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-foreground/30 inline-block" /> Kollavarsham</span>
        </>)}
        {mode === 'malayalam' && (<>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-500/50 inline-block" /> Month abbrev.</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-foreground/30 inline-block" /> Gregorian</span>
        </>)}
      </div>
    </div>
  );
}
