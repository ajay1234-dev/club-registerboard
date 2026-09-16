import { Metadata } from "next";
import Link from "next/link";
import { Lock, Star } from "lucide-react";
import LiveHeroWrapper from "@/components/home/LiveHeroWrapper";

export const metadata: Metadata = {
  title: "First Year Club Enrollment",
  description: "Join one of 13 amazing clubs at First Year Club Enrollment. Register now and be part of the excitement!",
};

// Revalidate every 30 seconds to keep status fresh
export const revalidate = 30;

async function getEventStatus() {
  try {
    const response = await fetch(
      `https://firestore.googleapis.com/v1/projects/${process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID}/databases/(default)/documents/settings/event`,
      { next: { revalidate: 30 } }
    );
    if (!response.ok) return { registrationOpen: true, eventName: "First Year Club Enrollment", totalRegistrationCount: 0, totalExpectedStudents: 900 };
    const data = await response.json();
    const fields = data.fields ?? {};
    return {
      registrationOpen: fields.registrationOpen?.booleanValue ?? true,
      eventName: fields.eventName?.stringValue ?? "First Year Club Enrollment",
      totalRegistrationCount: parseInt(fields.totalRegistrationCount?.integerValue ?? "0"),
      totalExpectedStudents: parseInt(fields.totalExpectedStudents?.integerValue ?? "900"),
    };
  } catch {
    return { registrationOpen: true, eventName: "First Year Club Enrollment", totalRegistrationCount: 0, totalExpectedStudents: 900 };
  }
}

interface PageClub {
  name: string;
  logoUrl: string;
  active: boolean;
  displayOrder: number;
}

async function getClubs(): Promise<PageClub[]> {
  try {
    const response = await fetch(
      `https://firestore.googleapis.com/v1/projects/${process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID}/databases/(default)/documents/clubs`,
      { next: { revalidate: 30 } }
    );
    if (!response.ok) return [];
    const data = await response.json();
    return (data.documents || []).map((doc: any) => ({
      name: doc.fields.name?.stringValue ?? "",
      logoUrl: doc.fields.logoUrl?.stringValue ?? "",
      active: doc.fields.active?.booleanValue ?? false,
      displayOrder: parseInt(doc.fields.displayOrder?.integerValue ?? "0"),
    })).filter((c: PageClub) => c.active).sort((a: PageClub, b: PageClub) => a.displayOrder - b.displayOrder);
  } catch {
    return [];
  }
}

export default async function LandingPage() {
  const [status, clubs] = await Promise.all([getEventStatus(), getClubs()]);

  return (
    <main className="min-h-screen flex flex-col font-outfit">
      {/* Background hero gradient */}
      <div
        className="fixed inset-0 pointer-events-none"
        aria-hidden
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 50% -10%, rgba(79,70,229,0.15) 0%, transparent 70%)",
        }}
      />

      {/* Header */}
      <header className="relative z-10 flex items-center justify-between px-6 py-4 max-w-5xl mx-auto w-full">
        <div className="flex items-center gap-3 text-sm font-semibold text-gray-700 dark:text-gray-400">
          <span><span className="rainbow-text">First Year</span> Club Enrollment</span>
        </div>
        <div className="flex items-center gap-2 sm:gap-4">
          <Link
            href="/admin/login"
            className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-500 hover:text-gray-900 dark:hover:text-gray-300 transition-colors px-3 py-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-white/5"
            aria-label="Admin Login"
          >
            <Lock className="w-3 h-3" />
            <span className="hidden sm:inline">Admin</span>
          </Link>
          <Link
            href="/live/login"
            className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-500 hover:text-gray-900 dark:hover:text-gray-300 transition-colors px-3 py-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-white/5"
            aria-label="Live dashboard login for organizers"
          >
            <Lock className="w-3 h-3" />
            <span>Live Dashboard</span>
          </Link>
        </div>
      </header>

      <LiveHeroWrapper initialStatus={status} />
      
      {/* Participating Clubs / Logos */}
      {clubs.length > 0 && (
        <section className="relative z-10 pb-12 px-6">
          <div className="max-w-4xl mx-auto text-center">
            <p className="text-xs font-bold text-gray-500 dark:text-gray-600 uppercase tracking-widest mb-8">Participating Clubs</p>
            <div className="flex flex-wrap justify-center gap-4 sm:gap-6">
              {clubs.map((club: PageClub, idx: number) => (
                <div key={idx} className="flex flex-col items-center gap-2 group">
                  <div className="w-20 h-20 sm:w-28 sm:h-28 rounded-full border border-gray-200 dark:border-gray-800 bg-white flex items-center justify-center group-hover:border-indigo-500 group-hover:shadow-[0_0_15px_rgba(79,70,229,0.3)] transition-all duration-300 relative overflow-hidden">
                    {club.logoUrl ? (
                      <img src={club.logoUrl} alt={club.name} className="w-[90%] h-[90%] object-contain rounded-full" />
                    ) : (
                      <span className="text-3xl font-bold text-gray-400 group-hover:text-indigo-400 transition-colors">{club.name.charAt(0)}</span>
                    )}
                  </div>
                  <span className="text-sm text-gray-700 dark:text-gray-500 font-medium w-28 sm:w-32 text-center leading-tight group-hover:text-gray-900 dark:group-hover:text-gray-300 transition-colors" title={club.name}>
                    {club.name}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Feature pills */}
      <section className="relative z-10 pb-12 px-6">
        <div className="flex flex-wrap items-center justify-center gap-3 max-w-2xl mx-auto">
          {["13 Clubs", "Takes ~60 seconds", "Instant confirmation", "Live leaderboard"].map((pill) => (
            <span
              key={pill}
              className="px-3 py-1.5 rounded-full bg-gray-100 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-xs text-gray-700 dark:text-gray-500"
            >
              {pill}
            </span>
          ))}
        </div>
      </section>
    </main>
  );
}
