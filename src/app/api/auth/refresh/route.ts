import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

export async function POST(req: Request) {
    try {
        const cookieStore = await cookies();
        const refreshToken = cookieStore.get("refreshToken")?.value;

        if (!refreshToken) {
            return NextResponse.json(
                { error: "No refresh token" },
                { status: 401 }
            );
        }

        const decoded = jwt.verify(
            refreshToken,
            process.env.JWT_REFRESH_SECRET!
        ) as { userId: number; role: string };

        const newAccessToken = jwt.sign(
            {
                userId: decoded.userId,
                role: decoded.role,
            },
            process.env.JWT_SECRET!,
            { expiresIn: "15m" }
        );

        const response = NextResponse.json({
            message: "Token renovado",
        });

        response.cookies.set("accessToken", newAccessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 60 * 15,
            path: "/",
        });

        return response;

    } catch (error) {
        return NextResponse.json(
            { error: "Refresh token inválido" },
            { status: 403 }
        );
    }
}