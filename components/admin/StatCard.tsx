"use client";

import { ReactNode } from "react";
import { cn } from "@/lib/utils/helpers";

interface StatCardProps {
  title: string;
  value: string | number;
  icon?: ReactNode;
  trend?: {
    value: number;
    label: string;
    isPositive: boolean;
  };
  className?: string;
}

export default function StatCard({ title, value, icon, trend, className }: StatCardProps) {
  return (
    <div className={cn("glass-card p-5 flex flex-col", className)}>
      <div className="flex items-start justify-between mb-2">
        <h3 className="text-sm font-medium text-gray-600 dark:text-[#a1a1c7]">{title}</h3>
        {icon && <div className="text-gray-500 dark:text-[#6b7280]">{icon}</div>}
      </div>
      
      <div className="flex items-baseline gap-2 mt-auto">
        <span className="text-3xl font-bold text-gray-900 dark:text-[#f0f0ff]">
          {typeof value === "number" ? value.toLocaleString("en-IN") : value}
        </span>
      </div>

      {trend && (
        <div className="mt-2 flex items-center gap-1.5 text-xs">
          <span
            className={cn(
              "font-medium",
              trend.isPositive ? "text-green-400" : "text-red-400"
            )}
          >
            {trend.isPositive ? "+" : ""}
            {trend.value}%
          </span>
          <span className="text-gray-500 dark:text-[#6b7280]">{trend.label}</span>
        </div>
      )}
    </div>
  );
}
