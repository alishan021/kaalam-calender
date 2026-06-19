import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";
import { Star } from "lucide-react";

interface NakshatraDisplayProps {
  name: string;
  lord: string;
  pada: number;
}

export function NakshatraDisplay({ name, lord, pada }: NakshatraDisplayProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="bg-secondary text-secondary-foreground overflow-hidden relative border-none">
        <div className="absolute right-[-20px] top-[-20px] opacity-10 pointer-events-none">
          <Star size={120} strokeWidth={1} />
        </div>
        <CardContent className="p-6 relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-secondary-foreground/70 text-xs font-semibold uppercase tracking-widest mb-1">Birth Star / Nakshatram</h3>
            <div className="text-3xl font-serif">{name}</div>
          </div>
          <div className="flex gap-6 items-center">
            <div className="flex flex-col">
              <span className="text-xs uppercase tracking-wider text-secondary-foreground/60 mb-1">Ruling Planet</span>
              <span className="font-medium text-lg">{lord}</span>
            </div>
            <div className="h-8 w-[1px] bg-secondary-foreground/20"></div>
            <div className="flex flex-col">
              <span className="text-xs uppercase tracking-wider text-secondary-foreground/60 mb-1">Paadham</span>
              <span className="font-medium text-lg">{pada}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
