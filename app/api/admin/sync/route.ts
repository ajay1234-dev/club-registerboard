import { NextRequest, NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase/admin";
import { verifySession } from "@/lib/auth/session";

export async function POST(req: NextRequest) {
  try {
    const user = await verifySession("admin");
    if (!user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const db = getAdminDb();

    // 1. Get all actual registrations to calculate real counts
    const registrationsSnap = await db.collection("registrations").get();
    
    let totalCount = 0;
    const clubCounts: Record<string, number> = {};

    registrationsSnap.docs.forEach((doc) => {
      totalCount++;
      const clubId = doc.data().clubId;
      if (clubId) {
        clubCounts[clubId] = (clubCounts[clubId] || 0) + 1;
      }
    });

    // 2. Update settings
    await db.collection("settings").doc("event").set({
      totalRegistrationCount: totalCount,
      totalExpectedStudents: 1000, // Also update capacity to 1000
    }, { merge: true });

    // 3. Update all clubs
    const clubsSnap = await db.collection("clubs").get();
    const batch = db.batch();
    
    clubsSnap.docs.forEach((doc) => {
      const actualCount = clubCounts[doc.id] || 0;
      batch.update(doc.ref, { registrationCount: actualCount });
    });

    await batch.commit();

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[api/admin/sync POST] Error syncing:", err);
    return NextResponse.json({ success: false, error: "Failed to sync counters" }, { status: 500 });
  }
}
