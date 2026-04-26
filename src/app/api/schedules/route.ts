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

export async function GET() {
  try {
    const decoded = await getDecoded();
    if (!decoded) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

    const schedules =
      decoded.role === "EMPLOYEE"
        ? await prisma.schedule.findMany({
            where: { userId: decoded.userId, status: "ACTIVE" },
            include: { user: { select: { name: true, email: true } } },
            orderBy: { startTime: "asc" },
          })
        : await prisma.schedule.findMany({
            where: { status: "ACTIVE" },
            include: { user: { select: { name: true, email: true } } },
            orderBy: { startTime: "asc" },
          });

    return NextResponse.json({ success: true, data: schedules });
  } catch (error) {
    console.error("[SCHEDULES GET]", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const decoded = await getDecoded();
    if (!decoded) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

    if (decoded.role === "EMPLOYEE") {
      return NextResponse.json({ error: "Sin permisos para crear horarios" }, { status: 403 });
    }

    const { title, startTime, endTime, userId } = await req.json();

    if (!title || !startTime || !endTime || !userId) {
      return NextResponse.json({ error: "Todos los campos son requeridos" }, { status: 400 });
    }

    const start = new Date(startTime);
    const end = new Date(endTime);

    if (start >= end) {
      return NextResponse.json({ error: "La hora de inicio debe ser anterior a la de fin" }, { status: 400 });
    }

    // Validar conflicto de horario
    const conflict = await prisma.schedule.findFirst({
      where: {
        userId: Number(userId),
        status: "ACTIVE",
        AND: [
          { startTime: { lt: end } },
          { endTime: { gt: start } },
        ],
      },
    });

    if (conflict) {
      return NextResponse.json(
        { error: `Conflicto detectado con el horario "${conflict.title}"` },
        { status: 409 }
      );
    }

    const schedule = await prisma.schedule.create({
      data: {
        title,
        startTime: start,
        endTime: end,
        userId: Number(userId),
        createdById: decoded.userId,
      },
      include: { user: { select: { name: true, email: true } } },
    });

    await prisma.auditLog.create({
      data: {
        action: "CREATE_SCHEDULE",
        entityType: "Schedule",
        entityId: schedule.id,
        userId: decoded.userId,
        scheduleId: schedule.id,
        details: `Horario "${title}" creado para userId ${userId}`,
      },
    });

    return NextResponse.json({ success: true, data: schedule }, { status: 201 });
  } catch (error) {
    console.error("[SCHEDULES POST]", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
