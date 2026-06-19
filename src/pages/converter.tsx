import React from 'react';
import { CalendarCard } from "@/components/CalendarCard";
import { NakshatraDisplay } from "@/components/NakshatraDisplay";
import { toMalayalam, toHijri, toHijriArabic, getNakshatra } from "@/lib/calendar";
import { format } from "date-fns";
import { motion } from "framer-motion";
import { Calendar as CalendarIcon } from "lucide-react";
import { format as formatD } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";

export default function Converter() {
  const [selectedDate, setSelectedDate] = React.useState<Date>(new Date());

  const malayalam = toMalayalam(selectedDate);
  const hijri = toHijri(selectedDate);
  const hijriArabic = toHijriArabic(selectedDate);
  const nakshatra = getNakshatra(selectedDate);

  return (
    <div className="max-w-3xl mx-auto px-4 py-16 flex flex-col gap-12 items-center">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-4 text-center"
      >
        <h1 className="text-4xl font-serif font-bold text-foreground">Find my birth details</h1>
        <p className="text-muted-foreground text-lg max-w-lg mx-auto">
          Select any date to instantly convert it across Gregorian, Hijri, and Malayalam calendar systems, and discover the astrological Nakshatra.
        </p>
      </motion.div>

      <motion.div 
        className="w-full max-w-md bg-card p-6 rounded-xl border shadow-sm flex flex-col items-center gap-4"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
      >
        <span className="text-sm font-semibold text-muted-foreground uppercase tracking-widest">Select a Date</span>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant={"outline"}
              className={`w-full justify-start text-left font-normal py-6 text-lg border-2 ${
                !selectedDate && "text-muted-foreground"
              }`}
            >
              <CalendarIcon className="mr-2 h-5 w-5" />
              {selectedDate ? formatD(selectedDate, "PPP") : <span>Pick a date</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="center">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(d) => d && setSelectedDate(d)}
              initialFocus
              defaultMonth={selectedDate}
            />
          </PopoverContent>
        </Popover>
      </motion.div>

      <div className="w-full space-y-8 mt-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <CalendarCard
            title="Gregorian"
            primaryValue={format(selectedDate, "MMMM do")}
            secondaryValue={format(selectedDate, "yyyy")}
            delay={0.2}
          />
          <CalendarCard
            title="Islamic / Hijri"
            primaryValue={hijri}
            secondaryValue={hijriArabic}
            delay={0.3}
          />
          <CalendarCard
            title="Kollavarsham"
            primaryValue={`${malayalam.day} ${malayalam.month}`}
            secondaryValue={`Year ${malayalam.year}`}
            delay={0.4}
          />
        </div>
        
        <NakshatraDisplay
          name={nakshatra.name}
          lord={nakshatra.lord}
          pada={nakshatra.pada}
        />
      </div>
    </div>
  );
}
