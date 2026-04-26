import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "@/app/lib/prisma";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    // 1. Validar datos
    if (!email || !password) {
      return NextResponse.json(
        { error: "Email y contraseña requeridos" },
        { status: 400 }
      );
    }

    // 2. Buscar usuario
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Credenciales inválidas" },
        { status: 401 }
      );
    }

    // 3. Comparar contraseña
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return NextResponse.json(
        { error: "Credenciales inválidas" },
        { status: 401 }
      );
    }

    // 4. Crear Access Token (15 min)
    const accessToken = jwt.sign(
      {
        userId: user.id,
        role: user.role,
      },
      process.env.JWT_SECRET!,
      { expiresIn: "15m" }
    );

    // 5. Crear Refresh Token (7 días)
    const refreshToken = jwt.sign(
      {
        userId: user.id,
        role: user.role,
      },
      process.env.JWT_REFRESH_SECRET!,
      { expiresIn: "7d" }
    );

    // 6. Crear respuesta
    const response = NextResponse.json({
      message: "Login exitoso",
      user: {
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });

    // 7. Guardar Access Token en cookie HttpOnly
    response.cookies.set("accessToken", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 15, // 15 minutos
      path: "/",
    });

    // 8. Guardar Refresh Token en cookie HttpOnly
    response.cookies.set("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax", // "lax" es el estándar para Next.js que permite redirecciones
      maxAge: 60 * 60 * 24 * 7, // 7 días
      path: "/",
    });

    return response;

  } catch (error) {
    console.error("[LOGIN ERROR]", error);

    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}