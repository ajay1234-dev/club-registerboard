"use client";

import { useState } from "react";
import { useLeaderboard } from "@/services/leaderboard/useLeaderboard";
import LeaderboardCard from "@/components/leaderboard/LeaderboardCard";
import LivePulse from "@/components/leaderboard/LivePulse";
import { formatPercent } from "@/lib/utils/helpers";
import { LayoutGroup } from "framer-motion";
import { Sun, Moon } from "lucide-react";

export default function LiveLeaderboardPage() {
  const { state, isLoading, error } = useLeaderboard();
  const [isLight, setIsLight] = useState(false);

  if (isLoading) {
    return (
      <div className={`min-h-screen ${isLight ? "bg-[#f9fafb] text-[#111827]" : "bg-[#030712] text-[#f9fafb]"} flex items-center justify-center`}>
        <div className="flex flex-col items-center gap-4 text-gray-500">
          <span className="w-12 h-12 border-4 border-gray-200 border-t-indigo-500 rounded-full animate-spin" />
          <p className="text-xl font-medium tracking-wide">Connecting to live feed...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`min-h-screen ${isLight ? "bg-[#f9fafb]" : "bg-[#030712]"} flex items-center justify-center`}>
        <div className={`${isLight ? "glass-card-light" : "glass-card"} border-red-500/30 p-8 max-w-lg text-center space-y-4`}>
          <p className="text-red-500 text-xl font-bold">Connection Error</p>
          <p className={isLight ? "text-gray-700" : "text-gray-400"}>{error}</p>
        </div>
      </div>
    );
  }

  const { entries, totalRegistrations, totalExpected, eventName } = state;
  const topThree = entries.slice(0, 3);
  const remaining = entries.slice(3);
  const filledStr = formatPercent(totalRegistrations, totalExpected);

  return (
    <main className={`min-h-screen transition-colors duration-300 ${isLight ? "bg-[#f9fafb] text-[#111827]" : "bg-[#030712] text-[#f9fafb]"} overflow-hidden flex flex-col p-6 sm:p-8 xl:p-12`}>
      <div className="relative z-10 flex-1 flex flex-col w-full max-w-[1920px] mx-auto gap-8 h-full max-h-screen pb-4">
        
        {/* Header Section */}
        <header className={`flex flex-col md:flex-row md:items-end justify-between gap-6 border-b ${isLight ? "border-gray-200" : "border-gray-800"} pb-6 shrink-0`}>
          <div>
            <div className="flex items-center gap-4 mb-2">
              <LivePulse />
              <div className="flex items-center gap-2">
                <img src="/msiic-logo.jpg" alt="Msiic Logo" className="h-8 w-auto object-contain bg-white rounded-md p-1" />
                <span className={`text-sm font-semibold uppercase tracking-widest ${isLight ? "text-gray-600" : "text-gray-400"}`}>
                  {eventName}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight">
                Leaderboard
              </h1>
              <button
                onClick={() => setIsLight(!isLight)}
                className={`p-2 rounded-lg transition-colors ${isLight ? "hover:bg-gray-200 text-gray-700" : "hover:bg-gray-800 text-gray-300"}`}
                aria-label="Toggle theme"
              >
                {isLight ? <Moon className="w-6 h-6" /> : <Sun className="w-6 h-6" />}
              </button>
            </div>
          </div>

          <div className="text-left md:text-right">
            <p className={`text-sm font-medium uppercase tracking-widest mb-1 ${isLight ? "text-gray-500" : "text-gray-400"}`}>
              Total Registered
            </p>
            <div className="flex items-baseline justify-start md:justify-end gap-2">
              <span className="text-4xl sm:text-5xl font-black tabular-nums">
                {totalRegistrations.toLocaleString("en-IN")}
              </span>
              <span className={`text-xl font-medium ${isLight ? "text-gray-500" : "text-gray-400"}`}>
                / {totalExpected.toLocaleString("en-IN")}
              </span>
            </div>
            <div className={`mt-2 h-1.5 w-full rounded-full overflow-hidden flex justify-end ${isLight ? "bg-gray-200" : "bg-gray-800"}`}>
              <div 
                className="h-full bg-indigo-500 rounded-full transition-all duration-1000 ease-out" 
                style={{ width: filledStr }}
              />
            </div>
          </div>
        </header>

        {/* Table Layout */}
        <div className="flex-1 flex flex-col min-h-0 w-full max-w-5xl mx-auto">
          {/* Table Header */}
          <div className={`flex items-center gap-4 px-4 py-3 border-b-2 text-xs font-bold uppercase tracking-widest ${isLight ? "border-gray-300 text-gray-500" : "border-gray-700 text-gray-400"}`}>
            <div className="w-8 text-center">#</div>
            <div className="w-10"></div> {/* Logo spacer */}
            <div className="flex-1">Club Name</div>
            <div className="text-right">Reg Members</div>
          </div>
          
          {/* Table Body */}
          <div className="flex-1 overflow-y-auto no-scrollbar pb-10">
            <LayoutGroup>
              {entries.map((entry) => (
                <LeaderboardCard key={entry.id} entry={entry} totalExpected={totalExpected} isLight={isLight} />
              ))}
            </LayoutGroup>
          </div>
        </div>
      </div>
    </main>
  );
}
