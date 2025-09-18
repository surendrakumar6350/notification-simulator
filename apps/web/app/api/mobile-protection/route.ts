import { NextResponse } from "next/server";
import { sendEmail } from "../../../utils/email";
import { connectDb } from "@/dbConnection/connect";
import { MobileProtectionRequest } from "@/dbConnection/Schema/mobileProtectionRequest";
import { rateLimit } from "@/lib/rateLimiter";
import { headers } from "next/headers";
import { mobileProtectionSchema } from "@repo/types/zod";

const RATE_LIMIT = 5; // 5 requests
const WINDOW_SEC = 30; // 30 seconds

export async function POST(request: Request): Promise<NextResponse> {
    try {
        const body = await request.json();

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

        const rateLimitKey = `RT_for_protection:${ip}`;
        const allowed = await rateLimit(rateLimitKey, RATE_LIMIT, WINDOW_SEC);

        if (!allowed) {
            return NextResponse.json(
                { success: false, message: "Too many requests. Please try again later." },
                { status: 429 }
            );
        }

        const parsed = mobileProtectionSchema.safeParse(body);
        if (!parsed.success) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Validation failed",
                    errors: parsed.error.format(),
                },
                { status: 400 }
            );
        }

        const { mobileNumber, message, screenshot } = parsed.data;

        await connectDb();
        const protectionEntry = new MobileProtectionRequest({
            mobileNumber,
            message,
            screenshot,
        });
        await protectionEntry.save();

        const emailContent = `
      Mobile Protection Request Received:

      📱 Mobile Number: ${mobileNumber}
      📝 Message: ${message}
    `;

        try {
            await sendEmail(emailContent);
        } catch (emailError) {
            console.error("Failed to send email:", emailError);
        }

        return NextResponse.json({
            success: true,
            message: "Mobile protection request submitted successfully",
        });
    } catch (error) {
        console.error("Mobile Protection API error:", error);
        return NextResponse.json(
            {
                success: false,
                message: "An error occurred while submitting the request",
            },
            { status: 500 }
        );
    }
}
