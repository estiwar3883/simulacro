import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
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

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const decoded = await getDecoded();
    if (!decoded) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    if (decoded.role !== "ADMIN") return NextResponse.json({ error: "Solo administradores" }, { status: 403 });

    const { id } = await params;
    const userId = Number(id);
    const { name, role, status } = await req.json();

    const before = await prisma.user.findUnique({ where: { id: userId } });
    if (!before) return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });

    const updated = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(name !== undefined && { name }),
        ...(role !== undefined && { role }),
        ...(status !== undefined && { status }),
      },
      select: { id: true, email: true, name: true, role: true, status: true, createdAt: true },
    });

    const changes = [];
    if (role && role !== before.role) changes.push(`rol: ${before.role} → ${role}`);
    if (status && status !== before.status) changes.push(`estado: ${before.status} → ${status}`);

    await prisma.auditLog.create({
      data: {
        action: role !== before.role ? "CHANGE_ROLE" : "UPDATE_USER",
        entityType: "User",
        entityId: userId,
        userId: decoded.userId,
        details: changes.length > 0 ? changes.join(", ") : `Usuario ${before.email} actualizado`,
      },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error("[USER PUT]", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const decoded = await getDecoded();
    if (!decoded) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    if (decoded.role !== "ADMIN") return NextResponse.json({ error: "Solo administradores" }, { status: 403 });

    const { id } = await params;
    const userId = Number(id);

    if (userId === decoded.userId) {
      return NextResponse.json({ error: "No puedes eliminar tu propio usuario" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });

    await prisma.user.update({
      where: { id: userId },
      data: { status: "INACTIVE" },
    });

    await prisma.auditLog.create({
      data: {
        action: "DELETE_USER",
        entityType: "User",
        entityId: userId,
        userId: decoded.userId,
        details: `Usuario ${user.email} desactivado`,
      },
    });

    return NextResponse.json({ success: true, message: "Usuario desactivado" });
  } catch (error) {
    console.error("[USER DELETE]", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
