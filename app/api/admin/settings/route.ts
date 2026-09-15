import { NextRequest, NextResponse } from "next/server";
import { verifySession } from "@/lib/auth/session";
import { getAdminDb } from "@/lib/firebase/admin";
import { eventSettingsSchema, departmentSchema, sectionSchema } from "@/lib/validation/schemas";
import { FieldValue } from "firebase-admin/firestore";
import { v4 as uuidv4 } from "uuid";

// GET /api/admin/settings — get event settings
export async function GET(request: NextRequest) {
  const user = await verifySession("admin");
  if (!user) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const db = getAdminDb();
    const snap = await db.collection("settings").doc("event").get();
    if (!snap.exists) {
      return NextResponse.json({ success: false, error: "Settings not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: { id: snap.id, ...snap.data() } });
  } catch (err) {
    console.error("[api/admin/settings GET]", err);
    return NextResponse.json({ success: false, error: "Failed to load settings" }, { status: 500 });
  }
}

// PATCH /api/admin/settings — update event settings
export async function PATCH(request: NextRequest) {
  const user = await verifySession("admin");
  if (!user) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const action = body.action as string | undefined;

    const db = getAdminDb();
    const settingsRef = db.collection("settings").doc("event");

    // ── Department management ─────────────────────────────────────────────
    if (action === "add_department") {
      const parse = departmentSchema.safeParse(body.department);
      if (!parse.success) {
        return NextResponse.json({ success: false, error: parse.error.errors[0]?.message }, { status: 400 });
      }
      const newDept = { id: uuidv4(), ...parse.data };
      await settingsRef.set({
        departments: FieldValue.arrayUnion(newDept),
        updatedAt: FieldValue.serverTimestamp(),
      }, { merge: true });
      return NextResponse.json({ success: true, data: newDept });
    }

    if (action === "update_department") {
      const snap = await settingsRef.get();
      const data = snap.data();
      const departments = (data?.departments ?? []) as Array<{ id: string; name: string; active: boolean; displayOrder: number }>;
      const idx = departments.findIndex((d) => d.id === body.departmentId);
      if (idx === -1) return NextResponse.json({ success: false, error: "Department not found" }, { status: 404 });
      departments[idx] = { ...departments[idx], ...body.updates };
      await settingsRef.set({ departments, updatedAt: FieldValue.serverTimestamp() }, { merge: true });
      return NextResponse.json({ success: true });
    }

    if (action === "remove_department") {
      const snap = await settingsRef.get();
      const data = snap.data();
      const departments = ((data?.departments ?? []) as Array<{ id: string; active: boolean }>).map((d) =>
        d.id === body.departmentId ? { ...d, active: false } : d
      );
      await settingsRef.set({ departments, updatedAt: FieldValue.serverTimestamp() }, { merge: true });
      return NextResponse.json({ success: true });
    }

    // ── Section management ────────────────────────────────────────────────
    if (action === "add_section") {
      const parse = sectionSchema.safeParse(body.section);
      if (!parse.success) {
        return NextResponse.json({ success: false, error: parse.error.errors[0]?.message }, { status: 400 });
      }
      const newSec = { id: uuidv4(), ...parse.data };
      await settingsRef.set({
        sections: FieldValue.arrayUnion(newSec),
        updatedAt: FieldValue.serverTimestamp(),
      }, { merge: true });
      return NextResponse.json({ success: true, data: newSec });
    }

    if (action === "update_section") {
      const snap = await settingsRef.get();
      const data = snap.data();
      const sections = (data?.sections ?? []) as Array<{ id: string; name: string; active: boolean; displayOrder: number }>;
      const idx = sections.findIndex((s) => s.id === body.sectionId);
      if (idx === -1) return NextResponse.json({ success: false, error: "Section not found" }, { status: 404 });
      sections[idx] = { ...sections[idx], ...body.updates };
      await settingsRef.set({ sections, updatedAt: FieldValue.serverTimestamp() }, { merge: true });
      return NextResponse.json({ success: true });
    }

    if (action === "remove_section") {
      const snap = await settingsRef.get();
      const data = snap.data();
      const sections = ((data?.sections ?? []) as Array<{ id: string; active: boolean }>).map((s) =>
        s.id === body.sectionId ? { ...s, active: false } : s
      );
      await settingsRef.set({ sections, updatedAt: FieldValue.serverTimestamp() }, { merge: true });
      return NextResponse.json({ success: true });
    }

    // ── General settings update ───────────────────────────────────────────
    const parse = eventSettingsSchema.safeParse(body);
    if (!parse.success) {
      return NextResponse.json({ success: false, error: parse.error.errors[0]?.message }, { status: 400 });
    }

    const updateData: Record<string, unknown> = {
      updatedAt: FieldValue.serverTimestamp(),
    };
    if (parse.data.eventName !== undefined) updateData.eventName = parse.data.eventName;
    if (parse.data.registrationOpen !== undefined) updateData.registrationOpen = parse.data.registrationOpen;
    if (parse.data.totalExpectedStudents !== undefined) updateData.totalExpectedStudents = parse.data.totalExpectedStudents;

    await settingsRef.set(updateData, { merge: true });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[api/admin/settings PATCH]", err);
    return NextResponse.json({ success: false, error: "Failed to update settings" }, { status: 500 });
  }
}
