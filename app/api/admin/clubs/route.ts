import { NextRequest, NextResponse } from "next/server";
import { verifySession } from "@/lib/auth/session";
import { getAdminDb } from "@/lib/firebase/admin";
import { clubSchema } from "@/lib/validation/schemas";
import { FieldValue } from "firebase-admin/firestore";

// GET /api/admin/clubs — list all clubs (admin only)
export async function GET(request: NextRequest) {
  const user = await verifySession("admin");
  if (!user) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const db = getAdminDb();
    const snap = await db
      .collection("clubs")
      .orderBy("displayOrder", "asc")
      .get();

    const clubs = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    return NextResponse.json({ success: true, data: clubs });
  } catch (err) {
    console.error("[api/admin/clubs GET]", err);
    return NextResponse.json(
      { success: false, error: "Failed to load clubs" },
      { status: 500 }
    );
  }
}

// POST /api/admin/clubs — create a new club
export async function POST(request: NextRequest) {
  const user = await verifySession("admin");
  if (!user) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const parse = clubSchema.safeParse(body);
    if (!parse.success) {
      return NextResponse.json(
        { success: false, error: parse.error.errors[0]?.message },
        { status: 400 }
      );
    }

    const db = getAdminDb();
    const now = FieldValue.serverTimestamp();
    const ref = await db.collection("clubs").add({
      ...parse.data,
      logoUrl: body.logoUrl ?? "",
      registrationCount: 0,
      createdAt: now,
      updatedAt: now,
    });

    return NextResponse.json(
      { success: true, data: { id: ref.id } },
      { status: 201 }
    );
  } catch (err) {
    console.error("[api/admin/clubs POST]", err);
    return NextResponse.json(
      { success: false, error: "Failed to create club" },
      { status: 500 }
    );
  }
}
