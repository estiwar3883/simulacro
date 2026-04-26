import { NextResponse } from "next/server";

export async function POST() {
  const response = NextResponse.json({ message: "Sesión cerrada" });

  // Borramos el Access Token
  response.cookies.set("accessToken", "", {
    path: "/",
    httpOnly: true,
    expires: new Date(0), // Fecha en 1970 para que muera YA
  });

  // Borramos el Refresh Token
  response.cookies.set("refreshToken", "", {
    path: "/",
    httpOnly: true,
    expires: new Date(0),
  });

  return response;
}