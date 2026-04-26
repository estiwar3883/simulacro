import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { prisma } from "@/app/lib/prisma";

async function getDecoded() {
  const cookieStore = await cookies();
  const token = cookieStore.get("accessToken")?.value;
  if (!token) return null;
  try {
    return jwt.verify(token, process.env.JWT_SECRET!) as { userId: number; role: string };
  } catch {
    return null;
  }
}

export async function GET() {
  try {
    const decoded = await getDecoded();
    if (!decoded) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    if (decoded.role !== "ADMIN") return NextResponse.json({ error: "Solo administradores" }, { status: 403 });

    const users = await prisma.user.findMany({
      select: { id: true, email: true, name: true, role: true, status: true, createdAt: true },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, data: users });
  } catch (error) {
    console.error("[USERS GET]", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const decoded = await getDecoded();
    if (!decoded) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    if (decoded.role !== "ADMIN") return NextResponse.json({ error: "Solo administradores" }, { status: 403 });

    const { email, password, name, role } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Email y contraseña requeridos" }, { status: 400 });
    }
    if (password.length < 6) {
      return NextResponse.json({ error: "La contraseña debe tener al menos 6 caracteres" }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name: name || null,
        role: role || "EMPLOYEE",
      },
      select: { id: true, email: true, name: true, role: true, status: true, createdAt: true },
    });

    await prisma.auditLog.create({
      data: {
        action: "CREATE_USER",
        entityType: "User",
        entityId: user.id,
        userId: decoded.userId,
        details: `Usuario ${email} creado con rol ${role || "EMPLOYEE"}`,
      },
    });

    return NextResponse.json({ success: true, data: user }, { status: 201 });
  } catch (error: unknown) {
    if (typeof error === "object" && error !== null && "code" in error && (error as { code: string }).code === "P2002") {
      return NextResponse.json({ error: "Este email ya está registrado" }, { status: 400 });
    }
    console.error("[USERS POST]", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
