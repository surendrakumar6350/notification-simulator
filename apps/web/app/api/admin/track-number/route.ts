import { NextRequest, NextResponse } from "next/server";
import { connectDb } from "@/dbConnection/connect";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { z } from "zod";
import { MobileTracking } from "@/dbConnection/Schema/mobileTracking";

// Mobile number validation (Indian numbers)
const mobileNumberSchema = z.string()
    .trim()
    .regex(/^[6-9]\d{9}$/, "Invalid mobile number. Must be 10 digits starting with 6-9");

const JWT_SECRET = process.env.JWT_SECRET_KEY || "your-secret";

type TrackingEntry = {
  ip: string;
  timestamp: Date;
};

/**
 * GET handler that returns tracking data for a validated Indian mobile number.
 *
 * Validates the `number` query parameter (10-digit, starts with 6–9), checks admin
 * authentication via the `ADMIN_AUTH_SMS_BOMBER` JWT cookie, then reads tracking
 * data for that mobile number from the database. Responds with the mobile number,
 * the total number of tracking entries, and up to the last 10 entries (each with
 * `ip` and `timestamp`) in most-recent-first order.
 *
 * Returns JSON responses with appropriate HTTP status codes:
 * - 200: success with `{ success: true, message, number, totalEntries, recentEntries }`
 * - 400: invalid `number` parameter (validation error message)
 * - 401: missing or invalid admin JWT cookie
 * - 404: mobile number not found
 * - 500: server error
 *
 * @returns A Promise that resolves to a NextResponse containing the JSON payload described above.
 */
export async function GET(req: NextRequest): Promise<NextResponse> {
    try {
        const { searchParams } = new URL(req.url);
        const numberParam = searchParams.get("number");

        // Validate mobile number
        const parseResult = mobileNumberSchema.safeParse(numberParam);
        if (!parseResult.success) {
            return NextResponse.json(
                { success: false, message: parseResult.error.errors[0].message },
                { status: 400 }
            );
        }

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
            jwt.verify(tokenCookie.value, JWT_SECRET);
        } catch (error) {
            return NextResponse.json(
                { success: false, message: "Unauthorized" },
                { status: 401 }
            );
        }

        await connectDb();

        const numberRawData = await MobileTracking.findOne(
            { mobileNumber: parseResult.data },
            { _id: 0, mobileNumber: 1, entries: { $slice: -10 } }
        );

        if (!numberRawData) {
            return NextResponse.json({
                success: false,
                message: "Mobile number not found",
            }, { status: 404 });
        }

        // Filter only ip and timestamp for each entry
        const recentEntries = numberRawData.entries.map((entry: TrackingEntry) => ({
            ip: entry.ip,
            timestamp: entry.timestamp
        }));

        // Count total entries
        const totalEntriesCount = await MobileTracking.aggregate([
            { $match: { mobileNumber: parseResult.data } },
            { $project: { totalEntries: { $size: "$entries" } } }
        ]);
        const totalCount = totalEntriesCount[0]?.totalEntries || 0;

        return NextResponse.json({
            success: true,
            message: "Mobile number data fetched",
            number: parseResult.data,
            totalEntries: totalCount,
            recentEntries: recentEntries.reverse()
        });
    } catch (err) {
        return NextResponse.json(
            { success: false, message: "Server error", error: err },
            { status: 500 }
        );
    }
}