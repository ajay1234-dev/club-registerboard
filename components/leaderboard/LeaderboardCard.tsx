"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import CountUp from "./CountUp";
import { cn } from "@/lib/utils/helpers";
import type { LeaderboardEntry } from "@/types";

interface LeaderboardCardProps {
  entry: LeaderboardEntry;
  totalExpected: number;
  isLight?: boolean;
}

export default function LeaderboardCard({
  entry,
  isLight = false,
}: LeaderboardCardProps) {
  const isTopThree = entry.rank <= 3;

  return (
    <motion.div
      layout
      layoutId={`club-${entry.id}`}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className={cn(
        "flex items-center gap-6 px-6 py-5 border-b transition-colors",
        isLight 
          ? "border-gray-200 hover:bg-gray-100" 
          : "border-gray-800 hover:bg-gray-900/50"
      )}
    >
      {/* Rank */}
      <div className={cn(
        "w-12 flex-shrink-0 text-center font-bold text-2xl",
        isTopThree && !isLight ? "text-indigo-400" : (isLight ? "text-gray-500" : "text-gray-500")
      )}>
        {entry.rank}
      </div>

      {/* Logo */}
      <div className={cn(
        "w-16 h-16 rounded-full overflow-hidden flex-shrink-0 flex items-center justify-center border",
        isLight ? "bg-white border-gray-300" : "bg-white border-gray-700"
      )}>
        {entry.logoUrl ? (
          <Image
            src={entry.logoUrl}
            alt={entry.name}
            width={64}
            height={64}
            className="w-full h-full object-contain p-0.5"
          />
        ) : (
          <span className="text-xl font-bold text-gray-500">
            {entry.name.charAt(0)}
          </span>
        )}
      </div>

      {/* Club Name */}
      <div className={cn(
        "flex-1 font-semibold text-2xl truncate",
        isLight ? "text-gray-900" : "text-gray-100"
      )}>
        {entry.name}
      </div>

      {/* Count */}
      <div className={cn(
        "flex-shrink-0 text-right w-32 tabular-nums font-bold text-4xl",
        isLight ? "text-gray-900" : "text-gray-100"
      )}>
        <CountUp value={entry.registrationCount} />
      </div>
    </motion.div>
  );
}
