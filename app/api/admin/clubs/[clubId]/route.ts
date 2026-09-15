import { NextRequest, NextResponse } from "next/server";
import { verifySession } from "@/lib/auth/session";
import { getAdminDb } from "@/lib/firebase/admin";
import { clubSchema } from "@/lib/validation/schemas";
import { FieldValue } from "firebase-admin/firestore";

// PATCH /api/admin/clubs/[clubId] — update club
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ clubId: string }> }
) {
  const user = await verifySession("admin");
  if (!user) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const { clubId } = await params;

  try {
    const body = await request.json();

    // Partial update — only validate fields that are present
    const partial = clubSchema.partial().safeParse(body);
    if (!partial.success) {
      return NextResponse.json(
        { success: false, error: partial.error.errors[0]?.message },
        { status: 400 }
      );
    }

    const updateData: Record<string, unknown> = {
      ...partial.data,
      updatedAt: FieldValue.serverTimestamp(),
    };

    // Allow logoUrl updates separately (not in clubSchema to keep it clean)
    if (typeof body.logoUrl === "string") {
      updateData.logoUrl = body.logoUrl;
    }

    const db = getAdminDb();
    const ref = db.collection("clubs").doc(clubId);
    const snap = await ref.get();
    if (!snap.exists) {
      return NextResponse.json(
        { success: false, error: "Club not found" },
        { status: 404 }
      );
    }

    await ref.update(updateData);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[api/admin/clubs/[clubId] PATCH]", err);
    return NextResponse.json(
      { success: false, error: "Failed to update club" },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/clubs/[clubId] — deactivate (soft delete only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ clubId: string }> }
) {
  const user = await verifySession("admin");
  if (!user) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const { clubId } = await params;

  try {
    const db = getAdminDb();
    const ref = db.collection("clubs").doc(clubId);
    const snap = await ref.get();
    if (!snap.exists) {
      return NextResponse.json(
        { success: false, error: "Club not found" },
        { status: 404 }
      );
    }

    // Soft delete — set active: false. Never deletes historical registrations.
    await ref.update({
      active: false,
      updatedAt: FieldValue.serverTimestamp(),
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[api/admin/clubs/[clubId] DELETE]", err);
    return NextResponse.json(
      { success: false, error: "Failed to deactivate club" },
      { status: 500 }
    );
  }
}
