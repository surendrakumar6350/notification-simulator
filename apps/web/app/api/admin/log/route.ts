import { NextRequest, NextResponse } from "next/server";
import { connectDb } from "@/dbConnection/connect";
import { Log } from "@/dbConnection/Schema/logs";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

const JWT_SECRET = process.env.JWT_SECRET_KEY || "your-secret";

export async function GET(req: NextRequest): Promise<NextResponse> {
    try {
        const { searchParams } = new URL(req.url);
        const page = parseInt(searchParams.get("page") || "1", 10);
        const limit = parseInt(searchParams.get("limit") || "10", 10);

        if (page < 1 || limit < 1) {
            return NextResponse.json(
                { success: false, message: "Invalid page or limit" },
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
            jwt.verify(tokenCookie.value, JWT_SECRET!);
        } catch (error) {
            return NextResponse.json(
                { success: false, message: "Unauthorized", error },
                { status: 401 }
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