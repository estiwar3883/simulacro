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
    if (decoded.role === "EMPLOYEE") return NextResponse.json({ error: "Sin permisos" }, { status: 403 });

    const { id } = await params;
    const scheduleId = Number(id);
    const { title, startTime, endTime, userId } = await req.json();

    if (!title || !startTime || !endTime || !userId) {
      return NextResponse.json({ error: "Todos los campos son requeridos" }, { status: 400 });
    }

    const start = new Date(startTime);
    const end = new Date(endTime);

    if (start >= end) {
      return NextResponse.json({ error: "La hora de inicio debe ser anterior a la de fin" }, { status: 400 });
    }

    const conflict = await prisma.schedule.findFirst({
      where: {
        userId: Number(userId),
        status: "ACTIVE",
        id: { not: scheduleId },
        AND: [
          { startTime: { lt: end } },
          { endTime: { gt: start } },
        ],
      },
    });

    if (conflict) {
      return NextResponse.json(
        { error: `Conflicto con el horario "${conflict.title}"` },
        { status: 409 }
      );
    }

    const updated = await prisma.schedule.update({
      where: { id: scheduleId },
      data: { title, startTime: start, endTime: end, userId: Number(userId) },
      include: { user: { select: { name: true, email: true } } },
    });

    await prisma.auditLog.create({
      data: {
        action: "UPDATE_SCHEDULE",
        entityType: "Schedule",
        entityId: scheduleId,
        userId: decoded.userId,
        scheduleId,
        details: `Horario "${title}" actualizado`,
      },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error("[SCHEDULE PUT]", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const decoded = await getDecoded();
    if (!decoded) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    if (decoded.role === "EMPLOYEE") return NextResponse.json({ error: "Sin permisos" }, { status: 403 });

    const { id } = await params;
    const scheduleId = Number(id);

    const schedule = await prisma.schedule.findUnique({ where: { id: scheduleId } });
    if (!schedule) return NextResponse.json({ error: "Horario no encontrado" }, { status: 404 });

    // Soft delete
    await prisma.schedule.update({
      where: { id: scheduleId },
      data: { status: "CANCELLED" },
    });

    await prisma.auditLog.create({
      data: {
        action: "DELETE_SCHEDULE",
        entityType: "Schedule",
        entityId: scheduleId,
        userId: decoded.userId,
        scheduleId,
        details: `Horario "${schedule.title}" cancelado`,
      },
    });

    return NextResponse.json({ success: true, message: "Horario cancelado" });
  } catch (error) {
    console.error("[SCHEDULE DELETE]", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
