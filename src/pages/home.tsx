import React from 'react';
import { CalendarGrid, CalendarMode } from "@/components/CalendarGrid";
import { CalendarCard } from "@/components/CalendarCard";
import { NakshatraDisplay } from "@/components/NakshatraDisplay";
import { toMalayalam, toHijri, toHijriArabic, getNakshatra } from "@/lib/calendar";
import { format } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import { RotateCcw } from "lucide-react";

const MODES: { key: CalendarMode; label: string }[] = [
  { key: 'gregorian', label: 'Gregorian' },
  { key: 'hijri',     label: 'Hijri' },
  { key: 'malayalam', label: 'Malayalam' },
];

export default function Home() {
  const today = new Date();
  const [selectedDate, setSelectedDate] = React.useState(today);
  const [calMode, setCalMode] = React.useState<CalendarMode>('gregorian');

  const malayalam  = toMalayalam(selectedDate);
  const hijri      = toHijri(selectedDate);
  const hijriAr    = toHijriArabic(selectedDate);
  const nakshatra  = getNakshatra(selectedDate);

  const isToday =
    selectedDate.getDate()     === today.getDate()    &&
    selectedDate.getMonth()    === today.getMonth()   &&
    selectedDate.getFullYear() === today.getFullYear();

  return (
    <div className="min-h-screen flex flex-col bg-background">

      {/* ── Header ─────────────────────────────────────────────── */}
      <header className="border-b bg-card sticky top-0 z-20">
        <div className="max-w-3xl mx-auto px-4 h-14 flex items-center justify-between">
          <span className="font-serif text-xl font-bold text-primary tracking-tight">Kaalam</span>

          {/* Calendar mode tabs */}
          <div className="flex items-center gap-0.5 bg-muted rounded-lg p-0.5">
            {MODES.map(({ key, label }) => (
              <button
                key={key}
                data-testid={`tab-${key}`}
                onClick={() => setCalMode(key)}
                className={[
                  'px-2.5 sm:px-3 py-1 rounded-md text-xs sm:text-sm font-medium transition-all',
                  calMode === key
                    ? 'bg-card text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground',
                ].join(' ')}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Reset to today */}
          <button
            data-testid="btn-today"
            onClick={() => setSelectedDate(new Date())}
            title="Go to today"
            className={[
              'p-2 rounded-full transition-colors',
              isToday
                ? 'text-muted-foreground/40 cursor-default'
                : 'hover:bg-muted text-muted-foreground hover:text-foreground',
            ].join(' ')}
            disabled={isToday}
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* ── Main content ───────────────────────────────────────── */}
      <main className="flex-1 max-w-3xl mx-auto w-full px-3 sm:px-6 py-5 sm:py-8 flex flex-col gap-6">

        {/* Calendar grid */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
          <CalendarGrid
            currentDate={selectedDate}
            onDateSelect={setSelectedDate}
            selectedDate={selectedDate}
            mode={calMode}
          />
        </motion.div>

        {/* Selected date label */}
        <div className="flex items-center justify-between">
          <h2 className="text-sm sm:text-base font-serif font-semibold text-foreground border-b border-dashed border-border pb-1">
            {format(selectedDate, "EEEE, MMMM d, yyyy")}
          </h2>
        </div>

        {/* ── Calendar info cards ─────────────────────────────── */}
        <AnimatePresence mode="wait">
          <motion.div
            key={selectedDate.toISOString()}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="grid grid-cols-1 sm:grid-cols-3 gap-3"
          >
            <CalendarCard
              title="Gregorian"
              primaryValue={format(selectedDate, "MMMM d")}
              secondaryValue={format(selectedDate, "yyyy")}
              delay={0}
            />
            <CalendarCard
              title="Islamic / Hijri"
              primaryValue={hijri}
              secondaryValue={hijriAr}
              delay={0.05}
            />
            <CalendarCard
              title="Kollavarsham"
              primaryValue={`${malayalam.day} ${malayalam.month}`}
              secondaryValue={`Year ${malayalam.year}`}
              delay={0.1}
            />
          </motion.div>
        </AnimatePresence>

        {/* ── Nakshatra ───────────────────────────────────────── */}
        <AnimatePresence mode="wait">
          <motion.div
            key={`nak-${selectedDate.toISOString()}`}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2, delay: 0.1 }}
          >
            <NakshatraDisplay name={nakshatra.name} lord={nakshatra.lord} pada={nakshatra.pada} />
          </motion.div>
        </AnimatePresence>

        {/* ── Divider ─────────────────────────────────────────── */}
        <div className="flex items-center gap-3 pt-2">
          <div className="flex-1 h-px bg-border" />
          <span className="text-xs text-muted-foreground uppercase tracking-widest font-medium">Find birth details</span>
          <div className="flex-1 h-px bg-border" />
        </div>

        {/* ── Date picker (converter) ─────────────────────────── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-card border rounded-xl p-5 sm:p-6 flex flex-col gap-4"
        >
          <p className="text-sm text-muted-foreground">
            Enter any date — including a birth date — to see it in all three calendar systems with its Nakshatram.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
            <label className="text-sm font-medium text-foreground whitespace-nowrap" htmlFor="birth-date-input">
              Select date
            </label>
            <input
              id="birth-date-input"
              data-testid="input-birth-date"
              type="date"
              value={format(selectedDate, 'yyyy-MM-dd')}
              onChange={(e) => {
                const parsed = new Date(e.target.value + 'T12:00:00');
                if (!isNaN(parsed.getTime())) setSelectedDate(parsed);
              }}
              className="flex-1 bg-background border border-input rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 transition-shadow"
            />
          </div>

          <p className="text-xs text-muted-foreground">
            The calendar above and all cards update instantly when you change this date.
          </p>
        </motion.div>

        <footer className="text-center text-xs text-muted-foreground font-serif pt-2 pb-4">
          A personal almanac for people who live between cultures.
        </footer>
      </main>
    </div>
  );
}
