"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { LogOut, Users, Tent, TrendingUp, Settings } from "lucide-react";
import Button from "@/components/ui/Button";
import StatCard from "@/components/admin/StatCard";
import RegistrationsTable from "@/components/admin/RegistrationsTable";
import ClubManagement from "@/components/admin/ClubManagement";
import EventControls from "@/components/admin/EventControls";
import DepartmentSectionManager from "@/components/admin/DepartmentSectionManager";
import type { Club, EventSettings, LeaderboardEntry } from "@/types";

export default function AdminDashboardPage() {
  const router = useRouter();
  
  const [clubs, setClubs] = useState<Club[]>([]);
  const [settings, setSettings] = useState<EventSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [clubsRes, settingsRes] = await Promise.all([
        fetch("/api/admin/clubs"),
        fetch("/api/admin/settings")
      ]);
      
      const clubsData = await clubsRes.json();
      const settingsData = await settingsRes.json();

      if (clubsData.success) setClubs(clubsData.data);
      if (settingsData.success) setSettings(settingsData.data);
    } catch (err) {
      console.error("Failed to load admin data", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/admin/login");
  };

  const handleSync = async () => {
    if (!confirm("Are you sure you want to recalculate all counters? Use this only if data is out of sync.")) return;
    setIsLoading(true);
    try {
      await fetch("/api/admin/sync", { method: "POST" });
      await loadData();
    } catch (err) {
      console.error("Failed to sync", err);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="flex flex-col items-center gap-4 text-[#a1a1c7]">
          <span className="w-8 h-8 border-4 border-[#1e1e3f] border-t-cyan-500 rounded-full animate-spin" />
          <p>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const activeClubs = clubs.filter(c => c.active).length;
  const totalRegistrations = settings?.totalRegistrationCount ?? 0;
  const expected = settings?.totalExpectedStudents ?? 900;
  const percentFilled = expected > 0 ? Math.round((totalRegistrations / expected) * 100) : 0;

  return (
    <main className="min-h-screen bg-[#07070f] p-4 sm:p-6 lg:p-8 flex flex-col gap-6 max-w-[1920px] mx-auto">
      
      {/* Header */}
      <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 glass-card p-4 sm:px-6">
        <div>
          <h1 className="text-xl font-bold text-[#f0f0ff] flex items-center gap-2">
            <Settings className="w-5 h-5 text-cyan-400" />
            Admin Dashboard
          </h1>
          <p className="text-sm text-[#a1a1c7]">{settings?.eventName || "Freshers Day Event"}</p>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto flex-wrap justify-end">
           <Button variant="secondary" size="sm" onClick={handleSync}>
            Sync Counters
          </Button>
           <Button variant="secondary" size="sm" onClick={() => router.push("/live")}>
            View Live Leaderboard
          </Button>
          <Button variant="ghost" size="sm" onClick={handleLogout} className="text-red-400 hover:text-red-300 hover:bg-red-500/10">
            <LogOut className="w-4 h-4" />
            Sign Out
          </Button>
        </div>
      </header>

      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <StatCard
          title="Total Registrations"
          value={totalRegistrations}
          icon={<Users className="w-5 h-5" />}
          trend={{ value: percentFilled, label: "of expected capacity", isPositive: true }}
        />
        <StatCard
          title="Clubs Configured"
          value={clubs.length}
          icon={<Tent className="w-5 h-5" />}
          trend={{ value: activeClubs, label: "currently active", isPositive: activeClubs > 0 }}
        />
        <StatCard
          title="Registration Status"
          value={settings?.registrationOpen ? "OPEN" : "CLOSED"}
          className={settings?.registrationOpen ? "border-green-500/30" : "border-red-500/30"}
        />
        <StatCard
          title="Top Club"
          value={clubs.length > 0 ? [...clubs].sort((a,b) => b.registrationCount - a.registrationCount)[0]?.name || "N/A" : "N/A"}
          icon={<TrendingUp className="w-5 h-5" />}
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 min-h-[600px]">
        
        {/* Left Column (Clubs & Event Settings) */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          <div className="h-[400px]">
             <ClubManagement clubs={clubs} onUpdate={loadData} />
          </div>
          <EventControls registrationOpen={settings?.registrationOpen ?? false} onUpdate={loadData} />
          <DepartmentSectionManager 
            departments={settings?.departments ?? []} 
            sections={settings?.sections ?? []} 
            onUpdate={loadData} 
          />
        </div>

        {/* Right Column (Registrations Table) */}
        <div className="lg:col-span-8 flex flex-col">
          <RegistrationsTable 
            clubs={clubs} 
            departments={settings?.departments ?? []} 
            sections={settings?.sections ?? []} 
          />
        </div>
        
      </div>
    </main>
  );
}
