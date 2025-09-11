import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { headers } from "next/headers";
import { rateLimit } from "@/lib/rateLimiter";
import { safePasswordSchema } from "@repo/types/zod";

const JWT_SECRET = process.env.JWT_SECRET_KEY || "undefined";

const RATE_LIMIT = 6; // 6 requests
const WINDOW_SEC = 5; // 5 seconds

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {

    if (!process.env.ADMIN_PANNEL_PASSWORD || !process.env.JWT_SECRET_KEY) {
      return NextResponse.json(
        { success: false, message: "Server not configured properly" },
        { status: 500 }
      );
    }

    const headersList = await headers();
    const ip =
      headersList.get("cf-connecting-ip") || // Used if behind Cloudflare
      headersList.get("x-forwarded-for")?.split(",")[0]?.trim() || // Fallback
      "unknown";

    if (ip === "unknown") {
      return NextResponse.json(
        { success: false, message: "Unable to determine IP address." },
        { status: 400 }
      );
    }

    const rateLimitKey = `RT_ADMIN_LOGIN:${ip}`;
    const allowed = await rateLimit(rateLimitKey, RATE_LIMIT, WINDOW_SEC);

    if (!allowed) {
      return NextResponse.json(
        { success: false, message: "Too many requests. Please try again later." },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { password } = body;

    const parseResult = safePasswordSchema.safeParse(password);
    if (!parseResult.success) {
      return NextResponse.json(
        { success: false, message: parseResult.error.errors[0].message },
        { status: 400 }
      );
    }

    if (password === process.env.ADMIN_PANNEL_PASSWORD) {
      const token = jwt.sign({ username: "admin" }, JWT_SECRET, { expiresIn: "1h" });

      const response = NextResponse.json({
        success: true,
        message: "Logged in successfully",
      });


      response.cookies.set("ADMIN_AUTH_SMS_BOMBER", token, {
        httpOnly: true,
        path: "/",
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60,
      });

      return response;
    }

    return NextResponse.json(
      { success: false, message: "Invalid credentials" },
      { status: 401 }
    );
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { success: false, message: "Server Error" },
      { status: 500 }
    );
  }
}