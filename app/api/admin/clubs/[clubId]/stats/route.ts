import { NextRequest, NextResponse } from "next/server";
import { verifySession } from "@/lib/auth/session";
import { getAdminDb } from "@/lib/firebase/admin";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ clubId: string }> }
) {
  const user = await verifySession("admin");
  if (!user) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const { clubId } = await params;
  if (!clubId) {
    return NextResponse.json({ success: false, error: "Club ID is required" }, { status: 400 });
  }

  try {
    const db = getAdminDb();
    const snap = await db.collection("registrations").where("clubId", "==", clubId).get();

    const registrations = snap.docs.map((d) => {
      const data = d.data();
      return {
        id: d.id,
        name: data.name,
        email: data.email,
        phone: data.phone,
        department: data.department,
        section: data.section,
        createdAt: data.createdAt?.toDate?.()?.toISOString() ?? new Date().toISOString(),
      };
    });

    return NextResponse.json({
      success: true,
      data: registrations,
    });
  } catch (err) {
    console.error(`[api/admin/clubs/${clubId}/stats GET]`, err);
    return NextResponse.json(
      { success: false, error: "Failed to load club statistics" },
      { status: 500 }
    );
  }
}
