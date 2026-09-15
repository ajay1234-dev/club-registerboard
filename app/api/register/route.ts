import { NextRequest, NextResponse } from "next/server";
import { executeRegistrationTransaction } from "@/services/registration/transaction";
import type { RegistrationFormData } from "@/types";

export async function POST(request: NextRequest) {
  try {
    const body: RegistrationFormData = await request.json();

    // Basic presence check before hitting the transaction
    if (!body || typeof body !== "object") {
      return NextResponse.json(
        { success: false, error: "Invalid request body", code: "VALIDATION_ERROR" },
        { status: 400 }
      );
    }

    const result = await executeRegistrationTransaction({
      name: body.name ?? "",
      email: body.email ?? "",
      phone: body.phone ?? "",
      department: body.department ?? "",
      section: body.section ?? "",
      clubId: body.clubId ?? "",
      deviceId: body.deviceId ?? "",
    });

    if (!result.success) {
      // Map error codes to HTTP status codes
      const statusMap: Record<string, number> = {
        REGISTRATION_CLOSED: 403,
        DEVICE_ALREADY_REGISTERED: 409,
        EMAIL_ALREADY_REGISTERED: 409,
        CLUB_NOT_FOUND: 404,
        CLUB_INACTIVE: 404,
        VALIDATION_ERROR: 400,
        TRANSACTION_FAILED: 500,
        INTERNAL_ERROR: 500,
      };
      const status = statusMap[result.code ?? ""] ?? 500;
      return NextResponse.json(result, { status });
    }

    return NextResponse.json(result, { status: 201 });
  } catch (err) {
    console.error("[api/register] Unhandled error:", err);
    return NextResponse.json(
      {
        success: false,
        error: "An unexpected error occurred. Please try again.",
        code: "INTERNAL_ERROR",
      },
      { status: 500 }
    );
  }
}
