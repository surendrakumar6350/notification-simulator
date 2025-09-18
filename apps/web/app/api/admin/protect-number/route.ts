import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { cookies } from "next/headers";
import { connectDb } from '@/dbConnection/connect';
import { ProtectedNumber } from '@/dbConnection/Schema/protectedNumber';
import { rateLimit } from '@/lib/rateLimiter';
import { headers } from 'next/headers';
import { ProtectedNumberSchema } from "@repo/types/zod";

const RATE_LIMIT = 6; // 6 requests
const WINDOW_SEC = 5; // 5 seconds

const JWT_SECRET = process.env.JWT_SECRET_KEY;

export async function POST(request: NextRequest): Promise<NextResponse> {
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


        const body = await request.json();
        const parsed = ProtectedNumberSchema.safeParse(body);

        if (!parsed.success) {
            return NextResponse.json({
                success: false,
                message: parsed.error.errors[0].message,
                errors: parsed.error.errors,
            }, { status: 400 });
        }

        const { phoneNumber, reason } = parsed.data;

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

        const rateLimitKey = `RT_ADMIN_PN:${ip}`;
        const allowed = await rateLimit(rateLimitKey, RATE_LIMIT, WINDOW_SEC);

        if (!allowed) {
            return NextResponse.json(
                { success: false, message: "Too many requests. Please try again later." },
                { status: 429 }
            );
        }

        await connectDb();

        // 2. Save to current list
        const exists = await ProtectedNumber.findOne({ phoneNumber });
        if (exists) {
            return NextResponse.json({
                success: false,
                message: "Number already exists",
            }, { status: 409 })
        }

        await ProtectedNumber.create({
            phoneNumber,
            reason,
        });

        return NextResponse.json({
            success: false,
            message: "Number added successfully",
        })

    } catch (error) {
        console.error('[ADD_PROTECTED_NUMBER_ERROR]', error);

        return NextResponse.json({
            success: false,
            message: "Server error",
        }, { status: 500 });
    }
}
