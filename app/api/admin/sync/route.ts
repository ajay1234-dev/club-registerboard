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

    // 1. Get all clubs
    const clubsSnap = await db.collection("clubs").get();
    
    let totalCount = 0;
    const batch = db.batch();

    // 2. Count registrations per club using aggregation query
    // This avoids fetching all registration documents and exhausting quota
    for (const doc of clubsSnap.docs) {
      const clubId = doc.id;
      const countSnap = await db.collection("registrations").where("clubId", "==", clubId).count().get();
      const actualCount = countSnap.data().count;
      totalCount += actualCount;
      batch.update(doc.ref, { registrationCount: actualCount });
    }

    // 3. Update settings
    await db.collection("settings").doc("event").set({
      totalExpectedStudents: 856, // Keep capacity at 856
    }, { merge: true });

    // 4. Commit all updates
    await batch.commit();

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[api/admin/sync POST] Error syncing:", err);
    return NextResponse.json({ success: false, error: "Failed to sync counters" }, { status: 500 });
  }
}
