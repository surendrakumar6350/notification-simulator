import { NextRequest, NextResponse } from "next/server";
import { connectDb } from "@/dbConnection/connect";
import { Log } from "@/dbConnection/Schema/logs";
import { Redis } from "ioredis";
import { ProtectedNumber } from "@/dbConnection/Schema/protectedNumber";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET_KEY || 'your-secret';


let redis: Redis | null = null;
function getRedis(): Redis {
    if (!redis) {
        redis = new Redis(process.env.REDIS_URL as string);
    }
    return redis;
}

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
        const redisClient = getRedis();

        const now = new Date();
        const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);

        // DB counts
        const totalRequests = await Log.countDocuments({});
        const last24hRequests = await Log.countDocuments({
            timestamp: { $gte: last24h, $lte: now },
        });
        const totalProtectedNumbers = await ProtectedNumber.countDocuments({});

        // Sliding window stats from Redis
        const window = await redisClient.lrange("worker:sliding", 0, -1);
        const total = window.length;
        const successes = window.filter(v => v === "1").length;
        const failures = total - successes;
        const successPercent = total > 0 ? (successes / total) * 100 : 0;

        return NextResponse.json(
            {
                success: true,
                message: "Stats fetched successfully",
                request: request.url,
                data: {
                    totalRequests,
                    last24hRequests,
                    totalProtectedNumbers,
                    slidingWindow: {
                        totalRequests: total,
                        successes,
                        failures,
                        successPercent: parseFloat(successPercent.toFixed(2)),
                    },
                },
            },
            { status: 200 }
        );
    } catch (error) {
        console.error("Error in stats API:", error);
        return NextResponse.json(
            { success: false, message: "Internal server error" },
            { status: 500 }
        );
    }
}
