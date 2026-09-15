import type { UserRole, SessionPayload } from "@/types";

const SESSION_COOKIE_NAME = "session";

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
