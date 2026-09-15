import { cookies } from "next/headers";
import { getAdminAuth } from "@/lib/firebase/admin";
import type { AuthenticatedUser, UserRole, SessionPayload } from "@/types";

const SESSION_COOKIE_NAME = "session";
const SESSION_DURATION_MS = 60 * 60 * 5 * 1000; // 5 hours

// ── Create session cookie ─────────────────────────────────────────────────────

/**
 * Creates a Firebase session cookie from an ID token and sets it as an
 * httpOnly cookie. Called after successful Firebase client-side sign-in.
 */
export async function createSessionCookie(idToken: string): Promise<void> {
  const auth = getAdminAuth();

  // Verify the ID token first to make sure it's genuine
  const decoded = await auth.verifyIdToken(idToken);

  // Create a session cookie that Firebase Auth can verify server-side
  const sessionCookie = await auth.createSessionCookie(idToken, {
    expiresIn: SESSION_DURATION_MS,
  });

  // Build the payload we'll store alongside (for role without re-verifying every request)
  const role = (decoded.role as UserRole) || null;
  if (!role) {
    throw new Error("User does not have a role claim. Access denied.");
  }

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, sessionCookie, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_DURATION_MS / 1000,
  });

  // Store role separately so middleware can check without async Admin SDK call
  cookieStore.set("session_role", role, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_DURATION_MS / 1000,
  });
}

// ── Verify session cookie ─────────────────────────────────────────────────────

/**
 * Verifies the session cookie server-side using Firebase Admin Auth.
 * Returns the authenticated user or null if invalid/expired.
 */
export async function verifySession(
  requiredRole?: UserRole
): Promise<AuthenticatedUser | null> {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME)?.value;

    if (!sessionCookie) return null;

    const auth = getAdminAuth();
    const decoded = await auth.verifySessionCookie(sessionCookie, true);

    const role = decoded.role as UserRole;

    if (!role) return null;

    // Role-based access check
    if (requiredRole) {
      if (requiredRole === "admin" && role !== "admin") return null;
      // organizer can access organizer routes; admin can access both
      if (requiredRole === "organizer" && role !== "organizer" && role !== "admin")
        return null;
    }

    return {
      uid: decoded.uid,
      email: decoded.email ?? null,
      role,
    };
  } catch {
    // Token expired, revoked, or invalid
    return null;
  }
}

// ── Clear session cookie ──────────────────────────────────────────────────────

export async function clearSessionCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
  cookieStore.delete("session_role");
}

// ── Get session payload for middleware ────────────────────────────────────────

export function getSessionPayloadFromCookies(cookieHeader: string): SessionPayload | null {
  // Used in middleware where we can't call async Admin SDK
  // We trust the httpOnly cookie role for routing decisions only;
  // actual data mutations are re-verified server-side in Route Handlers.
  try {
    const pairs = cookieHeader.split(";").map((c) => c.trim().split("="));
    const cookieMap = Object.fromEntries(pairs);
    const role = cookieMap["session_role"] as UserRole | undefined;
    const session = cookieMap[SESSION_COOKIE_NAME];
    if (!session || !role) return null;
    return { uid: "", email: null, role, expiresAt: 0 };
  } catch {
    return null;
  }
}
