import { NextResponse } from "next/server";
import { CategoryFeedback } from "@/dbConnection/Schema/categoryFeedback";
import { connectDb } from "@/dbConnection/connect";
import jwt from 'jsonwebtoken';
import { cookies } from "next/headers";

const JWT_SECRET = process.env.JWT_SECRET_KEY;

export async function GET() {
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
        } catch {
            return NextResponse.json({
                success: false,
                message: "Unauthorized"
            }, { status: 401 })
        }

        await connectDb();

        const recentFeedback = await CategoryFeedback.find()
            .sort({ createdAt: -1 })
            .limit(10);

        return NextResponse.json({ success: true, recentFeedback }, { status: 200 });

    } catch {
        return NextResponse.json({
            success: false,
            message: "Internal Server Error"
        }, { status: 500 });
    }
}