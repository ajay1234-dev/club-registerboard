import { NextRequest, NextResponse } from "next/server";
import { verifySession } from "@/lib/auth/session";
import { getAdminDb } from "@/lib/firebase/admin";

const PAGE_SIZE = 50;

// GET /api/admin/registrations?page=1&search=name&club=clubId&dept=dept&section=sec
export async function GET(request: NextRequest) {
  const user = await verifySession("admin");
  if (!user) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const clubFilter = searchParams.get("club");
    const deptFilter = searchParams.get("dept");
    const sectionFilter = searchParams.get("section");
    const search = searchParams.get("search")?.trim().toLowerCase();
    const pageStr = searchParams.get("page") ?? "1";
    const page = Math.max(1, parseInt(pageStr, 10) || 1);

    const db = getAdminDb();
    let q = db.collection("registrations").orderBy("createdAt", "desc");

    if (clubFilter) q = q.where("clubId", "==", clubFilter) as typeof q;
    if (deptFilter) q = q.where("department", "==", deptFilter) as typeof q;
    if (sectionFilter) q = q.where("section", "==", sectionFilter) as typeof q;

    // For search we fetch a larger set and filter in memory (Firestore has no full-text search)
    const fetchLimit = search ? 500 : PAGE_SIZE;
    let snap = await q.limit(fetchLimit).get();

    let registrations = snap.docs.map((d) => {
      const data = d.data();
      return {
        id: d.id,
        name: data.name,
        email: data.email,
        department: data.department,
        section: data.section,
        clubId: data.clubId,
        clubName: data.clubName,
        createdAt: data.createdAt?.toDate?.()?.toISOString() ?? new Date().toISOString(),
      };
    });

    if (search) {
      registrations = registrations.filter(
        (r) =>
          r.name.toLowerCase().includes(search) ||
          r.email.toLowerCase().includes(search) ||
          r.clubName?.toLowerCase().includes(search)
      );
    }

    const total = registrations.length;
    const paginated = registrations.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

    return NextResponse.json({
      success: true,
      data: {
        registrations: paginated,
        total,
        page,
        pageSize: PAGE_SIZE,
        totalPages: Math.ceil(total / PAGE_SIZE),
      },
    });
  } catch (err) {
    console.error("[api/admin/registrations GET]", err);
    return NextResponse.json(
      { success: false, error: "Failed to load registrations" },
      { status: 500 }
    );
  }
}
