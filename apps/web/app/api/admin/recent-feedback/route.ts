import { NextRequest, NextResponse } from "next/server";
import { CategoryFeedback } from "@/dbConnection/Schema/categoryFeedback";
import { connectDb } from "@/dbConnection/connect";
import jwt from 'jsonwebtoken';
import { cookies } from "next/headers";

const JWT_SECRET = process.env.JWT_SECRET_KEY || 'your-secret';

export async function GET(request: NextRequest) {
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

        const recentFeedback = await CategoryFeedback.find()
            .sort({ createdAt: -1 })
            .limit(10);

        return NextResponse.json({ success: true, recentFeedback, request: request.url }, { status: 200 });

    } catch (error) {
        return NextResponse.json({
            success: false,
            message: "Internal Server Error",
            error
        }, { status: 500 });
    }
}