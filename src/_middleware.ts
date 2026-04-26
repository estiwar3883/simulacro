import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose"; // Usamos jose en lugar de jsonwebtoken

export async function middleware(request: NextRequest) {
  const token = request.cookies.get("accessToken")?.value;
  const { pathname } = request.nextUrl;

  const isProtected = pathname.startsWith("/dashboard");
  const isAuthPage = pathname === "/login" || pathname === "/register";

  // Necesitamos convertir el SECRET a un formato que jose entienda
  const secret = new TextEncoder().encode(process.env.JWT_SECRET);

  if (!token && isProtected) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (token && isAuthPage) {
    try {
      await jwtVerify(token, secret);
      return NextResponse.redirect(new URL("/dashboard", request.url));
    } catch {
      // Token inválido o expirado, permitimos ir al login
    }
  }

  if (token && isProtected) {
    try {
      // Verificamos y decodificamos el token
      const { payload } = await jwtVerify(token, secret);
      const decoded = payload as { userId: number; role: string };

      // Control de Rol: Usuarios
      if (pathname.startsWith("/dashboard/users") && decoded.role !== "ADMIN") {
        return NextResponse.redirect(new URL("/unauthorized", request.url));
      }

      // Control de Rol: Auditoría
      if (
        pathname.startsWith("/dashboard/audit") &&
        !["ADMIN", "MANAGER"].includes(decoded.role)
      ) {
        return NextResponse.redirect(new URL("/unauthorized", request.url));
      }
    } catch (error) {
      // Si el token es falso o expiró, al login
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/login", "/register"],
};