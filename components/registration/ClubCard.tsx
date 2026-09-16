"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils/helpers";
import type { Club } from "@/types";

interface ClubCardProps {
  club: Club;
  isSelected: boolean;
  onSelect: (clubId: string) => void;
}

export default function ClubCard({ club, isSelected, onSelect }: ClubCardProps) {
  return (
    <motion.button
      type="button"
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      onClick={() => onSelect(club.id)}
      className={cn(
        "relative w-full text-left glass-card border transition-all duration-200 p-4 cursor-pointer group",
        isSelected
          ? "club-card-selected border-indigo-500"
          : "border-gray-800 hover:border-gray-600 hover:bg-white/5"
      )}
      role="radio"
      aria-checked={isSelected}
      aria-label={`Select ${club.name}`}
      id={`club-card-${club.id}`}
    >
      {/* Selected badge */}
      {isSelected && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute top-2 right-2 w-6 h-6 rounded-full bg-indigo-500 flex items-center justify-center shadow-lg"
        >
          <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />
        </motion.div>
      )}

      <div className="flex flex-col items-center text-center gap-3">
        {/* Club logo */}
        <div className={cn(
          "w-16 h-16 rounded-2xl overflow-hidden flex items-center justify-center bg-white flex-shrink-0 transition-all duration-200 border border-gray-800",
          isSelected && "ring-2 ring-indigo-500 border-indigo-500"
        )}>
          {club.logoUrl ? (
            <div className="w-full h-full flex items-center justify-center">
              <Image
                src={club.logoUrl}
                alt={club.name}
                width={64}
                height={64}
                className="w-full h-full object-contain p-1 rounded-xl"
              />
            </div>
          ) : (
            <div className="w-full h-full flex items-center justify-center text-2xl font-bold text-gray-500">
              {club.name.charAt(0)}
            </div>
          )}
        </div>

        {/* Club name */}
        <span className={cn(
          "font-semibold text-sm leading-tight transition-colors",
          isSelected ? "text-gray-50" : "text-gray-400 group-hover:text-gray-200"
        )}>
          {club.name}
        </span>

        {/* Description */}
        {club.description && (
          <p className="text-xs text-gray-500 dark:text-[#6b7280] leading-relaxed line-clamp-2">
            {club.description}
          </p>
        )}
      </div>
    </motion.button>
  );
}
