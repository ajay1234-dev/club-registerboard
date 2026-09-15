"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import {
  collection,
  doc,
  onSnapshot,
  query,
  orderBy,
  Unsubscribe,
} from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import type { LeaderboardState, LeaderboardEntry, Club, EventSettings } from "@/types";

const CLUBS_COLLECTION = "clubs";
const SETTINGS_DOC = "settings/event";

/**
 * Real-time leaderboard hook.
 *
 * Subscribes to:
 *  - All club documents (registrationCount, name, logoUrl, etc.)
 *  - settings/event (totalRegistrationCount, eventName, etc.)
 *
 * Never subscribes to the registrations collection.
 * Sorts by registrationCount DESC, ties broken by displayOrder ASC.
 */
export function useLeaderboard(): {
  state: LeaderboardState;
  isLoading: boolean;
  error: string | null;
} {
  const [state, setState] = useState<LeaderboardState>({
    entries: [],
    totalRegistrations: 0,
    totalExpected: 900,
    eventName: "Msiic Club Registration",
    registrationOpen: true,
    lastUpdated: null,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Keep latest clubs/settings in refs so each listener can merge with the other
  const clubsRef = useRef<Club[]>([]);
  const settingsRef = useRef<Partial<EventSettings>>({});

  const rebuildState = useCallback(() => {
    const clubs = clubsRef.current;
    const settings = settingsRef.current;

    const sorted: LeaderboardEntry[] = clubs
      .filter((c) => c.active)
      .sort((a, b) => {
        if (b.registrationCount !== a.registrationCount) {
          return b.registrationCount - a.registrationCount;
        }
        return a.displayOrder - b.displayOrder;
      })
      .map((club, index) => ({
        id: club.id,
        name: club.name,
        logoUrl: club.logoUrl,
        description: club.description,
        registrationCount: club.registrationCount,
        displayOrder: club.displayOrder,
        rank: index + 1,
        active: club.active,
      }));

    setState({
      entries: sorted,
      totalRegistrations: settings.totalRegistrationCount ?? 0,
      totalExpected: settings.totalExpectedStudents ?? 900,
      eventName: settings.eventName ?? "Msiic Club Registration",
      registrationOpen: settings.registrationOpen ?? true,
      lastUpdated: new Date(),
    });
  }, []);

  useEffect(() => {
    const unsubscribes: Unsubscribe[] = [];
    let clubsLoaded = false;
    let settingsLoaded = false;

    // Subscribe to clubs collection
    const clubsQuery = query(
      collection(db, CLUBS_COLLECTION),
      orderBy("displayOrder", "asc")
    );

    const unsubClubs = onSnapshot(
      clubsQuery,
      (snap) => {
        clubsRef.current = snap.docs.map((d) => ({
          id: d.id,
          ...(d.data() as Omit<Club, "id">),
        }));
        clubsLoaded = true;
        if (clubsLoaded && settingsLoaded) setIsLoading(false);
        rebuildState();
        setError(null);
      },
      (err) => {
        console.error("[leaderboard] clubs onSnapshot error:", err);
        setError("Failed to load leaderboard data. Please refresh.");
        setIsLoading(false);
      }
    );
    unsubscribes.push(unsubClubs);

    // Subscribe to settings document
    const settingsDocRef = doc(db, "settings", "event");
    const unsubSettings = onSnapshot(
      settingsDocRef,
      (snap) => {
        if (snap.exists()) {
          settingsRef.current = snap.data() as Partial<EventSettings>;
        }
        settingsLoaded = true;
        if (clubsLoaded && settingsLoaded) setIsLoading(false);
        rebuildState();
        setError(null);
      },
      (err) => {
        console.error("[leaderboard] settings onSnapshot error:", err);
        // Non-fatal: leaderboard can still show club data without settings
        settingsLoaded = true;
        if (clubsLoaded) setIsLoading(false);
      }
    );
    unsubscribes.push(unsubSettings);

    return () => {
      unsubscribes.forEach((u) => u());
    };
  }, [rebuildState]);

  return { state, isLoading, error };
}
