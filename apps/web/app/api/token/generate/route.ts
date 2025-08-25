import { NextRequest, NextResponse } from "next/server";
import { validateTurnstileToken } from "next-turnstile";
import { v4 as uuidv4 } from "uuid";
import { rateLimit } from "@/lib/rateLimiter";
import { headers } from "next/headers";
import jwt from "jsonwebtoken";

const RATE_LIMIT = 6; // 6 requests
const WINDOW_SEC = 5; // 5 seconds

export async function POST(req: NextRequest) {
    try {
        const { token } = await req.json();

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

        const rateLimitKey = `rate_limit_For_Token:${ip}`;
        const allowed = await rateLimit(rateLimitKey, RATE_LIMIT, WINDOW_SEC);

        if (!allowed) {
            return NextResponse.json(
                { success: false, message: "Too many requests. Please try again later." },
                { status: 429 }
            );
        }

        // Step 1: Validate Turnstile token
        const validationResponse = await validateTurnstileToken({
            token,
            secretKey: process.env.TURNSTILE_SECRET_KEY!,
            idempotencyKey: uuidv4(),
        });

        if (!validationResponse.success) {
            return NextResponse.json({ message: "Invalid token" }, { status: 400 });
        }

        // Step 2: Create JWT (valid for 10 minutes)
        const jwtToken = jwt.sign(
            { verified: true },
            process.env.JWT_SECRET_KEY!,
            { expiresIn: "10m" }
        );

        // Step 3: Set token in HTTP-only cookie
        const response = NextResponse.json({ message: "Verification Successfull" });
        response.cookies.set("bot_token", jwtToken, {
            maxAge: 600, // 10 minutes in seconds
            sameSite: "strict",
            path: "/",
        });

        return response;
    } catch (error) {
        console.error("Error generating token:", error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}
