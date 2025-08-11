import { NextResponse } from "next/server";
import { connectDb } from "@/dbConnection/connect";
import { MobileProtectionRequest } from "@/dbConnection/Schema/mobileProtectionRequest";
import jwt from 'jsonwebtoken';
import { cookies } from "next/headers";

const JWT_SECRET = process.env.JWT_SECRET_KEY || 'your-secret';

export async function GET(): Promise<NextResponse> {
    try {
        const cookieStore = await cookies();
        const tokenCookie = cookieStore.get('ADMIN_AUTH_SMS_BOMBER');

        if (!tokenCookie?.value) {
            return NextResponse.json({
                success: false,
                message: "Unauthorized",
            }, { status: 401 });
        }
        try {
            const token = tokenCookie.value;
            jwt.verify(token, JWT_SECRET!);
        } catch (error) {
            return NextResponse.json({
                success: false,
                message: "Unauthorized",
                error
            }, { status: 401 })
        }

        await connectDb();

        // Fetch the most recent 10 records, sorted by creation date
        const recentRequests = await MobileProtectionRequest.find()
            .sort({ createdAt: -1 })
            .limit(10)
            .lean();

        return NextResponse.json({
            success: true,
            data: recentRequests,
        });
    } catch (error) {
        console.error("Error fetching recent mobile protection requests:", error);
        return NextResponse.json(
            {
                success: false,
                message: "Failed to fetch recent mobile protection requests",
                error,
            },
            { status: 500 }
        );
    }
}
