import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { jwtVerify } from 'jose';

const JWT_SECRET = process.env.JWT_SECRET_KEY || 'your_default_secret_key';
const secret = new TextEncoder().encode(JWT_SECRET);

async function verifyToken(token: string) {
    try {
        const { payload } = await jwtVerify(token, secret);
        return payload;
    } catch (err) {
        return null;
    }
}


export async function middleware(request: NextRequest) {
    const { method, url, headers } = request;

    const path = request.nextUrl.pathname;

    const adminToken = request.cookies.get('ADMIN_AUTH_SMS_BOMBER')?.value;

    const ip =
        headers.get("cf-connecting-ip") || // Cloudflare
        headers.get("x-forwarded-for")?.split(",")[0]?.trim() || // Vercel / proxies
        "unknown";

    const istTime = new Intl.DateTimeFormat('en-IN', {
        timeZone: 'Asia/Kolkata',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
    }).format(new Date());

    console.log(`[${istTime}] ${method} ${url} — IP: ${ip}`);

    // Protect admin dashboard
    if (path === '/admin') {
        const isValid = adminToken && await verifyToken(adminToken);
        if (!isValid) {
            return NextResponse.redirect(new URL('/admin/login', request.url));
        }
    }

    // Redirect authenticated admin away from admin login
    if (path === '/admin/login') {
        const isValid = adminToken && await verifyToken(adminToken);
        if (isValid) {
            return NextResponse.redirect(new URL('/admin', request.url));
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        '/((?!_next/static|_next/image|favicon.ico).*)',
    ],
};
