import { NextRequest, NextResponse } from "next/server";
import { connectDb } from "@/dbConnection/connect";
import { MobileProtectionRequest } from "@/dbConnection/Schema/mobileProtectionRequest";
import jwt from 'jsonwebtoken';
import { cookies } from "next/headers";
import { paginationSchema } from "@repo/types/zod";

const JWT_SECRET = process.env.JWT_SECRET_KEY;

function validatePagination(searchParams: URLSearchParams) {
    const page = Number(searchParams.get("page") || "1");
    const limit = Number(searchParams.get("limit") || "10");

    return paginationSchema.safeParse({ page, limit });
}

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
        } catch {
            return NextResponse.json({
                success: false,
                message: "Unauthorized"
            }, { status: 401 })
        }

        await connectDb();

        // Fetch records with pagination
        const skip = (page - 1) * limit;
        const recentRequests = await MobileProtectionRequest.find()
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .select("-_id -__v")
            .lean();

        const totalRequests = await MobileProtectionRequest.countDocuments();

        return NextResponse.json({
            success: true,
            data: recentRequests,
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(totalRequests / limit),
                totalRequests,
            },
        });
    } catch (error) {
        console.error("Error fetching recent mobile protection requests:", error);
        return NextResponse.json(
            {
                success: false,
                message: "Failed to fetch recent mobile protection requests",
            },
            { status: 500 }
        );
    }
}
