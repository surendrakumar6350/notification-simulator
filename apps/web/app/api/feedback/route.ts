import { NextResponse } from "next/server";
import { connectDb } from "@/dbConnection/connect";
import { CategoryFeedback } from "@/dbConnection/Schema/categoryFeedback";
import { z } from "zod";
import { sendEmail } from "../../../utils/email";
import { rateLimit } from "@/lib/rateLimiter";
import { headers } from "next/headers";

const feedbackSchema = z.object({
    category: z.string().min(1, "Category is required").max(100, "Category is too long"),
    message: z.string().min(1, "Message is required").max(1000, "Message is too long"),
    rating: z.number().min(1).max(5),
});

const RATE_LIMIT = 6; // 6 requests
const WINDOW_SEC = 15; // 15 seconds

export async function POST(request: Request): Promise<NextResponse> {
    try {
        // Parse JSON body
        const body = await request.json();

        // Validate using zod
        const parsed = feedbackSchema.safeParse(body);
        if (!parsed.success) {
            return NextResponse.json(
                {
                    success: false,
                    message: parsed.error.errors[0].message,
                    errors: parsed.error.format(),
                },
                { status: 400 }
            );
        }

        const { category, message, rating } = parsed.data;

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

        const rateLimitKey = `RT_for_feedback:${ip}`;
        const allowed = await rateLimit(rateLimitKey, RATE_LIMIT, WINDOW_SEC);

        if (!allowed) {
            return NextResponse.json(
                { success: false, message: "Too many requests. Please try again later." },
                { status: 429 }
            );
        }

        // Connect to database
        await connectDb();

        // Store feedback
        const feedback = new CategoryFeedback({
            category,
            message,
            rating,
        });

        await feedback.save();

        try {
            await sendEmail(feedback.toString());
        } catch (emailError) {
            console.error("Failed to send email:", emailError);
        }

        return NextResponse.json({
            success: true,
            message: "Feedback submitted successfully",
        });
    } catch (error) {
        console.error("Feedback API error:", error);

        return NextResponse.json(
            {
                success: false,
                message: "An error occurred while submitting feedback",
                error,
            },
            { status: 500 }
        );
    }
}
