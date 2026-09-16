/**
 * ATOMIC REGISTRATION TRANSACTION
 *
 * This is the authoritative, server-side registration handler.
 * It runs as a single Firestore transaction — all-or-nothing.
 *
 * Steps (all inside one transaction):
 *  1. Confirm registration is open
 *  2. Validate all fields server-side
 *  3. Normalise email
 *  4. Check deviceRegistrations/{deviceId} — reject if exists
 *  5. Check emailRegistrations/{normalizedEmail} — reject if exists
 *  6. Confirm the club exists and is active
 *  7. Create registration document
 *  8. Create deviceRegistration record
 *  9. Create emailRegistration record
 * 10. Atomically increment club.registrationCount
 * 11. Atomically increment settings/event.totalRegistrationCount
 * 12. Commit — failure anywhere rolls back everything
 */

import { FieldValue } from "firebase-admin/firestore";
import { getAdminDb } from "@/lib/firebase/admin";
import { registrationSchema } from "@/lib/validation/schemas";
import { normalizeEmail } from "@/lib/utils/helpers";
import type {
  ApiResponse,
  RegistrationErrorCode,
} from "@/types";

interface TransactionInput {
  name: string;
  email: string;
  phone: string;
  department: string;
  section: string;
  clubId: string;
  deviceId: string;
}

interface TransactionSuccess {
  registrationId: string;
  clubName: string;
  clubLogoUrl: string;
}

export async function executeRegistrationTransaction(
  input: TransactionInput
): Promise<ApiResponse<TransactionSuccess>> {
  const db = getAdminDb();

  // ── Step 1: Server-side validation ───────────────────────────────────────
  const parseResult = registrationSchema.safeParse(input);
  if (!parseResult.success) {
    const firstError = parseResult.error.errors[0]?.message ?? "Validation failed";
    return {
      success: false,
      error: firstError,
      code: "VALIDATION_ERROR" as RegistrationErrorCode,
    };
  }

  const validated = parseResult.data;
  const normalizedEmailAddr = normalizeEmail(validated.email);

  // ── Document references ───────────────────────────────────────────────────
  const settingsRef = db.collection("settings").doc("event");
  const clubRef = db.collection("clubs").doc(validated.clubId);
  const deviceRef = db.collection("deviceRegistrations").doc(validated.deviceId);
  const emailRef = db
    .collection("emailRegistrations")
    .doc(encodeURIComponent(normalizedEmailAddr));
  const phoneRef = db.collection("phoneRegistrations").doc(validated.phone);
  const registrationRef = db.collection("registrations").doc();

  // ── Run atomic transaction ────────────────────────────────────────────────
  try {
    const result = await db.runTransaction(async (tx) => {
      // Step 2: Read all docs inside the transaction (reads before writes)
      const [settingsSnap, clubSnap, deviceSnap, emailSnap, phoneSnap] = await Promise.all(
        [
          tx.get(settingsRef),
          tx.get(clubRef),
          tx.get(deviceRef),
          tx.get(emailRef),
          tx.get(phoneRef),
        ]
      );

      // Step 3: Check registration is open
      const settings = settingsSnap.data();
      if (!settings?.registrationOpen) {
        throw Object.assign(
          new Error("Registration is currently closed. Thank you for your interest!"),
          { code: "REGISTRATION_CLOSED" as RegistrationErrorCode }
        );
      }

      // Step 4: Check department and section exist in settings
      const departments: Array<{ id: string; name: string; active: boolean }> =
        settings?.departments ?? [];
      const sections: Array<{ id: string; name: string; active: boolean }> =
        settings?.sections ?? [];

      const deptValid = departments.some(
        (d) => d.name === validated.department && d.active
      );
      const secValid = sections.some(
        (s) => s.name === validated.section && s.active
      );

      if (!deptValid) {
        throw Object.assign(new Error("Invalid department selected."), {
          code: "VALIDATION_ERROR" as RegistrationErrorCode,
        });
      }
      if (!secValid) {
        throw Object.assign(new Error("Invalid section selected."), {
          code: "VALIDATION_ERROR" as RegistrationErrorCode,
        });
      }

      // Step 5: Device duplicate check
      if (deviceSnap.exists) {
        throw Object.assign(
          new Error(
            "Whoa there, eager beaver! 🦫 This device has already claimed a spot. Remember, it's strictly one club per student. Let's give others a chance to join!"
          ),
          { code: "DEVICE_ALREADY_REGISTERED" as RegistrationErrorCode }
        );
      }

      // Step 6: Email duplicate check
      if (emailSnap.exists) {
        throw Object.assign(
          new Error(
            "Hold your horses! 🐴 This email is already registered. You can only pledge allegiance to one club at a time!"
          ),
          { code: "EMAIL_ALREADY_REGISTERED" as RegistrationErrorCode }
        );
      }

      // Step 6.5: Phone duplicate check
      if (phoneSnap.exists) {
        throw Object.assign(
          new Error(
            "Nice try, mastermind! 🧠 This phone number is already registered to another club. strictly one club per student!"
          ),
          { code: "PHONE_ALREADY_REGISTERED" as RegistrationErrorCode }
        );
      }

      // Step 7: Validate club
      const club = clubSnap.data();
      if (!clubSnap.exists || !club) {
        throw Object.assign(new Error("Selected club not found."), {
          code: "CLUB_NOT_FOUND" as RegistrationErrorCode,
        });
      }
      if (!club.active) {
        throw Object.assign(
          new Error("The selected club is not currently accepting registrations."),
          { code: "CLUB_INACTIVE" as RegistrationErrorCode }
        );
      }

      const now = FieldValue.serverTimestamp();

      // Step 8: Create registration document
      tx.create(registrationRef, {
        name: validated.name,
        email: validated.email,
        phone: validated.phone,
        normalizedEmail: normalizedEmailAddr,
        department: validated.department,
        section: validated.section,
        clubId: validated.clubId,
        clubName: club.name,
        deviceId: validated.deviceId,
        createdAt: now,
      });

      // Step 9: Create device registration record
      tx.create(deviceRef, {
        registrationId: registrationRef.id,
        clubId: validated.clubId,
        createdAt: now,
      });

      // Step 10: Create email registration record
      tx.create(emailRef, {
        registrationId: registrationRef.id,
        clubId: validated.clubId,
        createdAt: now,
      });

      // Step 10.5: Create phone registration record
      tx.create(phoneRef, {
        registrationId: registrationRef.id,
        clubId: validated.clubId,
        createdAt: now,
      });

      // Step 11: Atomically increment club count
      tx.update(clubRef, {
        registrationCount: FieldValue.increment(1),
        updatedAt: now,
      });

      // Step 12: Atomically increment total count
      tx.update(settingsRef, {
        totalRegistrationCount: FieldValue.increment(1),
        updatedAt: now,
      });

      return {
        registrationId: registrationRef.id,
        clubName: club.name as string,
        clubLogoUrl: (club.logoUrl as string) || "",
      };
    });

    return { success: true, data: result };
  } catch (err: unknown) {
    const error = err as Error & { code?: string };
    const knownCodes: string[] = [
      "REGISTRATION_CLOSED",
      "DEVICE_ALREADY_REGISTERED",
      "EMAIL_ALREADY_REGISTERED",
      "PHONE_ALREADY_REGISTERED",
      "CLUB_NOT_FOUND",
      "CLUB_INACTIVE",
      "VALIDATION_ERROR",
    ];

    if (error.code && knownCodes.includes(error.code)) {
      return {
        success: false,
        error: error.message,
        code: error.code as RegistrationErrorCode,
      };
    }

    // Unexpected error — log server-side, return generic message to client
    console.error("[registration/transaction] Unexpected error:", error);
    return {
      success: false,
      error:
        "Registration failed due to a server error. Please try again in a moment.",
      code: "TRANSACTION_FAILED",
    };
  }
}
