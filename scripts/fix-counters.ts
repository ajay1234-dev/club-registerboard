process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID;
const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, "\n");

if (getApps().length === 0) {
  initializeApp({
    credential: cert({ projectId, clientEmail, privateKey }),
  });
}

const db = getFirestore();

async function fix() {
  console.log("Fixing counters and settings...");
  
  // 1. Update settings
  await db.collection("settings").doc("event").update({
    totalRegistrationCount: 0,
    totalExpectedStudents: 1000,
  });
  console.log("Updated settings/event to 1000 capacity and 0 count.");

  // 2. Reset all club counts to 0
  const clubs = await db.collection("clubs").get();
  const batch = db.batch();
  clubs.docs.forEach(doc => {
    batch.update(doc.ref, { registrationCount: 0 });
  });
  await batch.commit();
  console.log("Reset all club registrationCounts to 0.");
  
  console.log("✅ Done!");
  process.exit(0);
}

fix().catch(console.error);
