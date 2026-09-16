"use client";

import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { useLeaderboard } from "@/services/leaderboard/useLeaderboard";
import LeaderboardCard from "@/components/leaderboard/LeaderboardCard";
import LivePulse from "@/components/leaderboard/LivePulse";
import { formatPercent } from "@/lib/utils/helpers";
import { LayoutGroup } from "framer-motion";

export default function LiveLeaderboardPage() {
  const { state, isLoading, error } = useLeaderboard();
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);

  const isLight = mounted && resolvedTheme === "light";

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-[#030712] text-gray-900 dark:text-[#f9fafb] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4 text-gray-500">
          <span className="w-12 h-12 border-4 border-gray-200 border-t-indigo-500 rounded-full animate-spin" />
          <p className="text-xl font-medium tracking-wide">Connecting to live feed...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-[#030712] flex items-center justify-center">
        <div className={`${isLight ? "glass-card-light" : "glass-card"} border-red-500/30 p-8 max-w-lg text-center space-y-4`}>
          <p className="text-red-500 text-xl font-bold">Connection Error</p>
          <p className="text-gray-700 dark:text-gray-400">{error}</p>
        </div>
      </div>
    );
  }

  const { entries, totalRegistrations, totalExpected, eventName } = state;
  const topThree = entries.slice(0, 3);
  const remaining = entries.slice(3);
  const filledStr = formatPercent(totalRegistrations, totalExpected);

  return (
    <main className="min-h-screen transition-colors duration-300 bg-gray-50 dark:bg-[#030712] text-gray-900 dark:text-[#f9fafb] overflow-hidden flex flex-col p-4 xl:p-6">
      <div className="relative z-10 flex-1 flex flex-col w-full max-w-[1920px] mx-auto gap-4 h-full max-h-screen pb-4">
        
        {/* Header Section */}
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-gray-200 dark:border-gray-800 pb-6 shrink-0">
          <div>
            <div className="flex items-center gap-4 mb-2">
              <LivePulse />
              <div className="flex items-center gap-2">

                <span className="text-sm font-semibold uppercase tracking-widest text-gray-600 dark:text-gray-400">
                  {eventName}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight">
                Club Spotlight
              </h1>
            </div>
          </div>

          <div className="text-left md:text-right">
            <p className="text-sm font-medium uppercase tracking-widest mb-1 text-gray-600 dark:text-gray-400">
              Total
            </p>
            <div className="flex items-baseline justify-start md:justify-end gap-2">
              <span className="text-6xl sm:text-7xl font-black tabular-nums">
                {totalRegistrations.toLocaleString("en-IN")}
              </span>
              <span className="text-3xl font-bold text-gray-600 dark:text-gray-400">
                / {totalExpected.toLocaleString("en-IN")}
              </span>
            </div>
            <div className="mt-2 h-1.5 w-full rounded-full overflow-hidden bg-gray-200 dark:bg-gray-800">
              <div 
                className="h-full bg-indigo-500 rounded-full transition-all duration-1000 ease-out" 
                style={{ width: filledStr }}
              />
            </div>
          </div>
        </header>

        {/* Table Layout */}
        <div className="flex-1 flex flex-col min-h-0 w-full max-w-[90%] 2xl:max-w-screen-2xl mx-auto mt-4">
          {/* Table Header */}
          <div className="flex items-center gap-6 px-6 py-4 border-b-2 text-sm md:text-base font-bold uppercase tracking-widest border-gray-300 dark:border-gray-700 text-gray-600 dark:text-gray-400">
            <div className="w-16 text-center">Rank</div>
            <div className="w-16"></div> {/* Logo spacer */}
            <div className="flex-1">Club</div>
            <div className="text-right">Registrations</div>
          </div>
          
          {/* Table Body */}
          <div className="flex-1 overflow-y-auto no-scrollbar pb-10">
            <LayoutGroup>
              {entries.map((entry) => (
                <LeaderboardCard key={entry.id} entry={entry} totalExpected={totalExpected} />
              ))}
            </LayoutGroup>
          </div>
        </div>
      </div>
    </main>
  );
}
