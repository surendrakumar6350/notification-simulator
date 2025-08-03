import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { cookies } from "next/headers";
import { connectDb } from '@/dbConnection/connect';
import { ProtectedNumber } from '@/dbConnection/Schema/protectedNumber';

const JWT_SECRET = process.env.JWT_SECRET_KEY || 'your-secret';

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
        } catch (error) {
            return NextResponse.json({
                success: false,
                message: "Unauthorized",
                error
            }, { status: 401 })
        }


        const { phoneNumber, reason } = await request.json();
        await connectDb();

        if (!phoneNumber || !reason) {

            return NextResponse.json({
                success: false,
                message: "phoneNumber and reason are required",
            }, { status: 400 })
        }

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
