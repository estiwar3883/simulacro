"use client";

import { useEffect, useState } from "react";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Schedule, AuditLog } from "@/types";

export default function DashboardPage() {
  const { user, loading: userLoading } = useCurrentUser();
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const [schedRes] = await Promise.all([
        fetch("/api/schedules"),
      ]);
      const schedData = await schedRes.json();
      if (schedData.success) setSchedules(schedData.data);

      if (user?.role === "ADMIN" || user?.role === "MANAGER") {
        const auditRes = await fetch("/api/audit");
        const auditData = await auditRes.json();
        if (auditData.success) setAuditLogs(auditData.data.slice(0, 5));
      }
      setLoading(false);
    }
    if (!userLoading) load();
  }, [user, userLoading]);

  const upcoming = schedules
    .filter((s) => new Date(s.startTime) > new Date())
    .slice(0, 5);

  const stats = [
    { label: "HORARIOS ACTIVOS", value: schedules.length, color: "text-sky-400" },
    { label: "PRÓXIMOS TURNOS", value: upcoming.length, color: "text-violet-400" },
    ...(user?.role === "ADMIN" || user?.role === "MANAGER"
      ? [{ label: "EVENTOS RECIENTES", value: auditLogs.length, color: "text-green-400" }]
      : []),
  ];

  if (loading || userLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#020617]">
        <div className="text-xs tracking-widest text-slate-500">CARGANDO...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#020617] p-8 font-mono">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-black tracking-widest text-white">DASHBOARD</h1>
        <p className="mt-1 text-sm text-slate-500">
          Bienvenido, <span className="text-sky-400">{user?.name || user?.email}</span>
        </p>
      </div>

      {/* Stats */}
      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <p className="text-xs tracking-widest text-slate-500">{stat.label}</p>
            <p className={`mt-2 text-4xl font-black ${stat.color}`}>{stat.value}</p>
          </Card>
        ))}
      </div>

      {/* Upcoming schedules */}
      <div className="mb-8">
        <h2 className="mb-4 text-xs font-bold tracking-widest text-slate-400">PRÓXIMOS HORARIOS</h2>
        {upcoming.length === 0 ? (
          <Card>
            <p className="text-center text-xs text-slate-600">No hay horarios próximos</p>
          </Card>
        ) : (
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {upcoming.map((s) => (
              <Card key={s.id} className="hover:border-slate-700 transition">
                <div className="flex items-start justify-between">
                  <h3 className="text-sm font-bold text-white">{s.title}</h3>
                  <Badge label={s.status} variant="success" />
                </div>
                {s.user && (
                  <p className="mt-1 text-xs text-slate-500">{s.user.name || s.user.email}</p>
                )}
                <div className="mt-3 space-y-1">
                  <p className="text-xs text-slate-500">
                    Inicio: <span className="text-slate-300">{new Date(s.startTime).toLocaleString("es-CO")}</span>
                  </p>
                  <p className="text-xs text-slate-500">
                    Fin: <span className="text-slate-300">{new Date(s.endTime).toLocaleString("es-CO")}</span>
                  </p>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Recent audit */}
      {(user?.role === "ADMIN" || user?.role === "MANAGER") && auditLogs.length > 0 && (
        <div>
          <h2 className="mb-4 text-xs font-bold tracking-widest text-slate-400">ACTIVIDAD RECIENTE</h2>
          <Card>
            <div className="space-y-3">
              {auditLogs.map((log) => (
                <div key={log.id} className="flex items-center justify-between border-b border-slate-800 pb-3 last:border-0 last:pb-0">
                  <div>
                    <span className="text-xs font-bold text-sky-400">{log.action}</span>
                    <p className="text-xs text-slate-500">{log.details}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-slate-600">{log.user.email}</p>
                    <p className="text-xs text-slate-700">{new Date(log.createdAt).toLocaleString("es-CO")}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
