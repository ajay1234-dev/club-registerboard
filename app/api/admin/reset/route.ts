import { NextRequest, NextResponse } from "next/server";
import { verifySession } from "@/lib/auth/session";
import { getAdminDb } from "@/lib/firebase/admin";

/**
 * DEV-ONLY DATA RESET
 *
 * Returns 403 in production.
 * Requires typed confirmation in request body.
 * Deletes all registrations, device records, email records,
 * resets club counts to 0, and resets event total count.
 *
 * NEVER accessible to students or organizers (admin role required).
 */
export async function POST(request: NextRequest) {
  // Hard block in production
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json(
      { success: false, error: "Reset is disabled in production." },
      { status: 403 }
    );
  }

  const user = await verifySession("admin");
  if (!user) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    if (body.confirmation !== "RESET ALL DATA") {
      return NextResponse.json(
        {
          success: false,
          error: 'Confirmation text must be exactly "RESET ALL DATA"',
        },
        { status: 400 }
      );
    }

    const db = getAdminDb();
    const BATCH_SIZE = 400;

    async function deleteCollection(collectionName: string) {
      let deleted = 0;
      let snap = await db.collection(collectionName).limit(BATCH_SIZE).get();
      while (!snap.empty) {
        const batch = db.batch();
        snap.docs.forEach((d) => batch.delete(d.ref));
        await batch.commit();
        deleted += snap.docs.length;
        snap = await db.collection(collectionName).limit(BATCH_SIZE).get();
      }
      return deleted;
    }

    // Delete all records
    await Promise.all([
      deleteCollection("registrations"),
      deleteCollection("deviceRegistrations"),
      deleteCollection("emailRegistrations"),
    ]);

    // Reset club counts
    const clubsSnap = await db.collection("clubs").get();
    if (!clubsSnap.empty) {
      const batch = db.batch();
      clubsSnap.docs.forEach((d) => {
        batch.update(d.ref, { registrationCount: 0 });
      });
      await batch.commit();
    }

    // Reset total count
    await db.collection("settings").doc("event").update({
      totalRegistrationCount: 0,
    });

    return NextResponse.json({
      success: true,
      data: { message: "All registration data has been reset." },
    });
  } catch (err) {
    console.error("[api/admin/reset POST]", err);
    return NextResponse.json(
      { success: false, error: "Reset failed" },
      { status: 500 }
    );
  }
}
