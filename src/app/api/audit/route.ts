import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { prisma } from "@/app/lib/prisma";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("accessToken")?.value;
    if (!token) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: number; role: string };

    if (!["ADMIN", "MANAGER"].includes(decoded.role)) {
      return NextResponse.json({ error: "Sin permisos" }, { status: 403 });
    }

    const logs = await prisma.auditLog.findMany({
      orderBy: { createdAt: "desc" },
      take: 200,
      include: {
        user: { select: { email: true, name: true } },
      },
    });

    return NextResponse.json({ success: true, data: logs });
  } catch (error) {
    console.error("[AUDIT GET]", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
