import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import * as fs from "fs";
import * as path from "path";
const dotenv = require("dotenv");
dotenv.config({ path: ".env.local" });

const serviceAccountStr = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
if (!serviceAccountStr) {
  throw new Error("Missing FIREBASE_SERVICE_ACCOUNT_KEY in .env.local");
}

let app;
if (getApps().length === 0) {
  app = initializeApp({
    credential: cert(JSON.parse(serviceAccountStr)),
  });
} else {
  app = getApps()[0];
}

const db = getFirestore(app);

async function linkLogos() {
  console.log("Starting logo linking...");

  // Update Event Name
  const settingsRef = db.collection("settings").doc("event");
  await settingsRef.update({
    eventName: "Msiic Club Registration"
  });
  console.log("Updated eventName to 'Msiic Club Registration'");

  // Update Club Logos
  const publicDir = path.join(process.cwd(), "public");
  const files = fs.readdirSync(publicDir);
  const jpegFiles = files.filter(f => f.endsWith(".jpeg") || f.endsWith(".jpg") || f.endsWith(".png"));

  const clubsSnap = await db.collection("clubs").get();
  
  for (const doc of clubsSnap.docs) {
    const club = doc.data();
    // Match based on filename starting with club name (case-insensitive)
    const matchingFile = jpegFiles.find(f => f.toLowerCase().startsWith(club.name.toLowerCase()));
    
    if (matchingFile) {
       // encode the URI so spaces in filename don't break the src attribute
       const logoUrl = `/${encodeURIComponent(matchingFile)}`; 
       await doc.ref.update({ logoUrl });
       console.log(`Linked ${matchingFile} to club ${club.name}`);
    } else {
       console.log(`No matching logo found for club ${club.name}`);
    }
  }

  console.log("Done!");
}

linkLogos().catch(console.error);
