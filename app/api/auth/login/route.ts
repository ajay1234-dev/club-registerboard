import { NextRequest, NextResponse } from "next/server";
import { createSessionCookie } from "@/lib/auth/session";
import { loginSchema } from "@/lib/validation/schemas";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parse = loginSchema.safeParse(body);

    if (!parse.success) {
      return NextResponse.json(
        { success: false, error: "Invalid request" },
        { status: 400 }
      );
    }

    await createSessionCookie(parse.data.idToken);

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err: unknown) {
    const error = err as Error;
    console.error("[api/auth/login] Error:", error.message);

    // createSessionCookie throws if user has no role claim
    if (error.message.includes("role")) {
      return NextResponse.json(
        { success: false, error: "Access denied. Your account does not have permission to log in here." },
        { status: 403 }
      );
    }

    return NextResponse.json(
      { success: false, error: "Invalid credentials. Please try again." },
      { status: 401 }
    );
  }
}
