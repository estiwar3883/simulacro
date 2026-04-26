import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { ScheduleProvider } from "@/context/ScheduleContext";

export const metadata: Metadata = {
  title: "ClockHub — Gestión de Horarios",
  description: "Plataforma centralizada de gestión de horarios y calendarios para equipos",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>
        <AuthProvider>
          <ScheduleProvider>
            {children}
          </ScheduleProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
