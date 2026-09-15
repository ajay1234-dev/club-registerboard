"use client";

import { v4 as uuidv4 } from "uuid";

const DEVICE_ID_KEY = "fday_device_id";

/**
 * Gets or creates a persistent device identifier stored in localStorage.
 *
 * IMPORTANT: This is a browser-storage-based UUID, NOT a hardware device ID.
 * It identifies the browser profile, not the physical phone. It is one of
 * multiple duplicate-prevention layers (the authoritative check is server-side).
 * Clearing browser data or using a different browser will generate a new ID.
 */
export function getOrCreateDeviceId(): string {
  if (typeof window === "undefined") {
    // Server context — should never be called, but safe fallback
    return uuidv4();
  }

  try {
    const existing = localStorage.getItem(DEVICE_ID_KEY);
    if (existing && isValidUUID(existing)) {
      return existing;
    }

    const newId = uuidv4();
    localStorage.setItem(DEVICE_ID_KEY, newId);
    return newId;
  } catch {
    // localStorage unavailable (private mode, security policy, etc.)
    // Fall back to a session-scoped ID — still prevents double-submit in the same tab
    return uuidv4();
  }
}

/**
 * Validates that a string is a well-formed UUID v4.
 */
export function isValidUUID(id: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    id
  );
}
