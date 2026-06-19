import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";

interface CalendarCardProps {
  title: string;
  primaryValue: string;
  secondaryValue?: string;
  tertiaryValue?: string;
  className?: string;
  delay?: number;
}

export function CalendarCard({ title, primaryValue, secondaryValue, tertiaryValue, className = "", delay = 0 }: CalendarCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
    >
      <Card className={`overflow-hidden h-full ${className}`}>
        <CardContent className="p-6 flex flex-col h-full justify-between gap-4">
          <h3 className="text-sm font-semibold tracking-wider text-muted-foreground uppercase">{title}</h3>
          <div>
            <div className="text-2xl font-serif text-foreground mb-1">{primaryValue}</div>
            {secondaryValue && (
              <div className="text-lg text-foreground/80 font-medium font-serif mt-2">{secondaryValue}</div>
            )}
            {tertiaryValue && (
              <div className="text-sm text-muted-foreground mt-1">{tertiaryValue}</div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
