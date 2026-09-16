import { NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase/admin";
import * as fs from "fs";
import * as path from "path";

export async function GET() {
  try {
    const db = getAdminDb();
    
    // Update Event Name
    const settingsRef = db.collection("settings").doc("event");
    await settingsRef.update({
      eventName: "First Year Club Enrollment"
    });

    // Update Club Logos
    const publicDir = path.join(process.cwd(), "public");
    const files = fs.readdirSync(publicDir);
    const jpegFiles = files.filter(f => f.endsWith(".jpeg") || f.endsWith(".jpg") || f.endsWith(".png"));

    const clubsSnap = await db.collection("clubs").get();
    
    let linked = 0;
    const logs = [];
    for (const doc of clubsSnap.docs) {
      const club = doc.data();
      const matchingFile = jpegFiles.find(f => f.toLowerCase().startsWith(club.name.toLowerCase()));
      
      if (matchingFile) {
         const logoUrl = `/${encodeURIComponent(matchingFile)}`; 
         await doc.ref.update({ logoUrl });
         linked++;
         logs.push(`Linked ${matchingFile} to ${club.name}`);
      }
    }

    return NextResponse.json({ success: true, linked, logs, updatedName: true });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
