import { NextRequest, NextResponse } from "next/server";
import { connectDb } from "@/dbConnection/connect";
import { Log } from "@/dbConnection/Schema/logs";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { headers } from "next/headers";
import { rateLimit } from "@/lib/rateLimiter";
import { paginationSchema }  from "@repo/types/zod";

const RATE_LIMIT = 20; // 20 requests
const WINDOW_SEC = 5; // 5 seconds

function validatePagination(searchParams: URLSearchParams) {
    const page = Number(searchParams.get("page") || "1");
    const limit = Number(searchParams.get("limit") || "10");

    return paginationSchema.safeParse({ page, limit });
}

const JWT_SECRET = process.env.JWT_SECRET_KEY || "your-secret";

export async function GET(req: NextRequest): Promise<NextResponse> {
    try {
        const { searchParams } = new URL(req.url);
        const result = validatePagination(searchParams);
        if (!result.success) {
            return NextResponse.json(
                { success: false, message: result.error.errors[0].message },
                { status: 400 }
            );
        }

        const { page, limit } = result.data;

        // --- Auth Check ---
        const cookieStore = await cookies();
        const tokenCookie = cookieStore.get("ADMIN_AUTH_SMS_BOMBER");
        if (!tokenCookie?.value) {
            return NextResponse.json(
                { success: false, message: "Unauthorized" },
                { status: 401 }
            );
        }

        try {
            jwt.verify(tokenCookie.value, JWT_SECRET!);
        } catch (error) {
            return NextResponse.json(
                { success: false, message: "Unauthorized", error },
                { status: 401 }
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
        const rateLimitKey = `RT_ADMIN_LOG:${ip}`;
        const allowed = await rateLimit(rateLimitKey, RATE_LIMIT, WINDOW_SEC);

        if (!allowed) {
            return NextResponse.json(
                { success: false, message: "Too many requests. Please try again later." },
                { status: 429 }
            );
        }

        await connectDb();

        // Fetch logs with pagination
        const skip = (page - 1) * limit;
        const logs = await Log.find()
            .sort({ timestamp: -1 })
            .skip(skip)
            .limit(limit)
            .lean();


        const totalLogs = await Log.countDocuments();

        return NextResponse.json({
            success: true,
            data: logs,
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(totalLogs / limit),
                totalLogs,
            },
        });
    } catch (error) {
        console.error("Error fetching logs:", error);
        return NextResponse.json(
            { success: false, message: "Failed to fetch logs", error },
            { status: 500 }
        );
    }
}