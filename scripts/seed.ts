/**
 * Seed script for Freshers Day 2026.
 * Creates the initial settings document and 13 placeholder clubs.
 * Guarded against running in production.
 */

import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

if (process.env.NODE_ENV === "production" || process.env.NEXT_PUBLIC_APP_URL?.includes("vercel.app")) {
  console.error("FATAL: Do not run seed script in production!");
  process.exit(1);
}

const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID;
const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, "\n");

if (!projectId || !clientEmail || !privateKey) {
  console.error("Missing Firebase Admin credentials in .env.local");
  process.exit(1);
}

if (getApps().length === 0) {
  initializeApp({
    credential: cert({ projectId, clientEmail, privateKey }),
  });
}

const db = getFirestore();

const MOCK_CLUBS = Array.from({ length: 13 }).map((_, i) => ({
  name: `Club ${i + 1}`,
  description: "A placeholder description for this club. Replace via admin panel.",
  logoUrl: "", // Admin can upload actual logos
  registrationCount: 0,
  displayOrder: i + 1,
  active: true,
}));

const INITIAL_SETTINGS = {
  eventName: "Msiic Club Registration",
  registrationOpen: true,
  totalExpectedStudents: 900,
  totalRegistrationCount: 0,
  departments: [
    { id: "dept-1", name: "IT", active: true, displayOrder: 1 },
    { id: "dept-2", name: "AIDS", active: true, displayOrder: 2 },
    { id: "dept-3", name: "CSE", active: true, displayOrder: 3 },
    { id: "dept-4", name: "ECE", active: true, displayOrder: 4 },
    { id: "dept-5", name: "EEE", active: true, displayOrder: 5 },
    { id: "dept-6", name: "CIVIL", active: true, displayOrder: 6 },
    { id: "dept-7", name: "MECH", active: true, displayOrder: 7 },
    { id: "dept-8", name: "AIML", active: true, displayOrder: 8 },
    { id: "dept-9", name: "CYBER SECURITY", active: true, displayOrder: 9 },
  ],
  sections: [
    { id: "sec-a", name: "A", active: true, displayOrder: 1 },
    { id: "sec-b", name: "B", active: true, displayOrder: 2 },
    { id: "sec-c", name: "C", active: true, displayOrder: 3 },
    { id: "sec-na", name: "Not available", active: true, displayOrder: 4 },
  ]
};

async function seed() {
  console.log("Seeding database...");
  const now = new Date();

  // 1. Settings
  console.log("Setting up event config...");
  await db.collection("settings").doc("event").set({
    ...INITIAL_SETTINGS,
    createdAt: now,
    updatedAt: now,
  });

  // 2. Clubs
  console.log("Creating 13 clubs...");
  const clubsRef = db.collection("clubs");
  
  // Clear existing clubs for dev seed
  const existing = await clubsRef.get();
  if (!existing.empty) {
    console.log("Clearing existing clubs...");
    const batch = db.batch();
    existing.docs.forEach((doc) => batch.delete(doc.ref));
    await batch.commit();
  }

  const batch = db.batch();
  MOCK_CLUBS.forEach((club) => {
    const ref = clubsRef.doc();
    batch.set(ref, {
      ...club,
      createdAt: now,
      updatedAt: now,
    });
  });

  await batch.commit();
  console.log("✅ Seeding complete.");
  process.exit(0);
}

seed().catch(console.error);
