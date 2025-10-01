import { NextRequest, NextResponse } from "next/server";
import { CategoryFeedback } from "@/dbConnection/Schema/categoryFeedback";
import { connectDb } from "@/dbConnection/connect";
import jwt from 'jsonwebtoken';
import { cookies } from "next/headers";
import { paginationSchema } from "@repo/types/zod";

const JWT_SECRET = process.env.JWT_SECRET_KEY;

function validatePagination(searchParams: URLSearchParams) {
    const page = Number(searchParams.get("page") || "1");
    const limit = Number(searchParams.get("limit") || "10");

    return paginationSchema.safeParse({ page, limit });
}

export async function GET(req: NextRequest) {
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

        // Fetch feedbacks with pagination
        const skip = (page - 1) * limit;
        const recentFeedback = await CategoryFeedback.find()
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const totalFeedbacks = await CategoryFeedback.countDocuments();

        return NextResponse.json({
            success: true,
            recentFeedback,
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(totalFeedbacks / limit),
                totalFeedbacks,
            },
        }, { status: 200 });

    } catch {
        return NextResponse.json({
            success: false,
            message: "Internal Server Error"
        }, { status: 500 });
    }
}