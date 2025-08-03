import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET_KEY || "undefined";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();
    const { password } = body;

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