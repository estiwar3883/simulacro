"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { Badge } from "@/components/ui/Badge";

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const { user } = useCurrentUser();

  const handleLogout = async () => {
  try {
      await fetch("/api/auth/logout", { method: "POST" });
      
      // ESTO es lo que evita que al volver atrás te deje entrar
      window.location.href = "/login"; 
    } catch (error) {
      console.error("Error al cerrar sesion", error);
    }
  };

    const roleBadgeVariant =
    user?.role === "ADMIN" ? "danger" : user?.role === "MANAGER" ? "warning" : "neutral";

  const navLinks = [
    { href: "/dashboard", label: "DASHBOARD" },
    { href: "/dashboard/schedules", label: "HORARIOS" },
    ...(user?.role === "ADMIN" ? [{ href: "/dashboard/users", label: "USUARIOS" }] : []),
    ...(user?.role === "ADMIN" || user?.role === "MANAGER"
      ? [{ href: "/dashboard/audit", label: "AUDITORIA" }]
      : []),
  ];

  return (
    <nav className="flex items-center justify-between border-b border-slate-800 bg-[#070c14] px-6 py-3">
      <Link href="/dashboard" className="flex items-center gap-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-md border border-sky-500/40 bg-sky-500/10">
          <span className="text-xs font-black text-sky-400">CH</span>
        </div>
        <span className="text-sm font-bold tracking-widest text-white">CLOCKHUB</span>
      </Link>

      <div className="flex items-center gap-1">
        {navLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={`rounded-md px-3 py-1.5 text-xs tracking-widest transition ${
              pathname === link.href
                ? "bg-sky-500/10 font-bold text-sky-400"
                : "text-slate-500 hover:bg-slate-800 hover:text-slate-300"
            }`}
          >
            {link.label}
          </Link>
        ))}
      </div>

      <div className="flex items-center gap-3">
        {user && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500">{user.name || user.email}</span>
            <Badge label={user.role} variant={roleBadgeVariant} />
          </div>
        )}
        <div className="h-4 w-px bg-slate-800" />
        <button
          onClick={handleLogout}
          className="rounded-md px-3 py-1.5 text-xs tracking-widest text-slate-600 transition hover:bg-red-500/10 hover:text-red-400"
        >
          SALIR
        </button>
      </div>
    </nav>
  );
}
