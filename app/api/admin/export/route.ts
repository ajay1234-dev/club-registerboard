import { NextRequest, NextResponse } from "next/server";
import { verifySession } from "@/lib/auth/session";
import { getAdminDb } from "@/lib/firebase/admin";
import * as xlsx from "xlsx";

export async function GET(request: NextRequest) {
  const user = await verifySession("admin");
  if (!user) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const db = getAdminDb();
    const snap = await db
      .collection("registrations")
      .orderBy("createdAt", "asc")
      .get();

    // Group by club
    const clubGroups: Record<string, any[]> = {};
    
    snap.docs.forEach((d) => {
      const data = d.data();
      const clubName = data.clubName || "Unassigned";
      if (!clubGroups[clubName]) {
        clubGroups[clubName] = [];
      }
      clubGroups[clubName].push({
        Name: data.name ?? "",
        Email: data.email ?? "",
        Phone: data.phone ?? "",
        Department: data.department ?? "",
        Section: data.section ?? "",
        "Registration Time": data.createdAt?.toDate?.()?.toISOString() ?? "",
      });
    });

    const wb = xlsx.utils.book_new();

    // Create a sheet for each club
    for (const [clubName, rows] of Object.entries(clubGroups)) {
      // Excel sheet names cannot exceed 31 chars and cannot contain certain characters
      const safeSheetName = clubName.replace(/[\\/*?:[\]]/g, "").substring(0, 31);
      const ws = xlsx.utils.json_to_sheet(rows);
      xlsx.utils.book_append_sheet(wb, ws, safeSheetName);
    }

    // If no registrations, create an empty sheet
    if (Object.keys(clubGroups).length === 0) {
       const ws = xlsx.utils.json_to_sheet([{ Message: "No registrations yet" }]);
       xlsx.utils.book_append_sheet(wb, ws, "Empty");
    }

    const excelBuffer = xlsx.write(wb, { type: "buffer", bookType: "xlsx" });
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);

    return new NextResponse(excelBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="registrations-${timestamp}.xlsx"`,
        "Cache-Control": "no-cache",
      },
    });
  } catch (err) {
    console.error("[api/admin/export GET]", err);
    return NextResponse.json(
      { success: false, error: "Failed to export registrations" },
      { status: 500 }
    );
  }
}
