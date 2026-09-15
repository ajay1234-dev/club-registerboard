/**
 * Script to create the first Admin and Organizer users.
 * Sets the custom claim { role: "admin" } or { role: "organizer" }.
 */

import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID;
const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, "\n");

if (!projectId || !clientEmail || !privateKey) {
  console.error("Missing Firebase Admin credentials in .env.local");
  process.exit(1);
}

if (getApps().length === 0) {
  initializeApp({
    credential: cert({ projectId, clientEmail, privateKey }),
  });
}

const auth = getAuth();

async function createUser(email: string, password: string, role: "admin" | "organizer") {
  try {
    let user;
    try {
      user = await auth.getUserByEmail(email);
      console.log(`User ${email} already exists. Updating role...`);
    } catch (err: any) {
      if (err.code === "auth/user-not-found") {
        user = await auth.createUser({
          email,
          password,
          emailVerified: true,
        });
        console.log(`Created new user: ${email}`);
      } else {
        throw err;
      }
    }

    // Set custom claim
    await auth.setCustomUserClaims(user.uid, { role });
    console.log(`✅ Granted ${role} role to ${email}`);

  } catch (err) {
    console.error(`Error processing ${email}:`, err);
  }
}

async function run() {
  const args = process.argv.slice(2);
  
  if (args.length !== 3) {
    console.log("Usage: npm run create-admin <email> <password> <admin|organizer>");
    process.exit(1);
  }

  const [email, password, role] = args;
  
  if (role !== "admin" && role !== "organizer") {
    console.log("Role must be 'admin' or 'organizer'");
    process.exit(1);
  }

  await createUser(email, password, role);
  process.exit(0);
}

run().catch(console.error);
