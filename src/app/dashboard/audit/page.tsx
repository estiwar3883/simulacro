"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { AuditLog } from "@/types";

const ACTION_VARIANTS: Record<string, "success" | "danger" | "warning" | "info" | "neutral"> = {
  CREATE_SCHEDULE: "success",
  UPDATE_SCHEDULE: "info",
  DELETE_SCHEDULE: "danger",
  CREATE_USER: "success",
  UPDATE_USER: "info",
  DELETE_USER: "danger",
  CHANGE_ROLE: "warning",
  LOGIN: "neutral",
  LOGOUT: "neutral",
};

export default function AuditPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");

  useEffect(() => {
    fetch("/api/audit")
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setLogs(d.data);
        setLoading(false);
      });
  }, []);

  const filtered = filter
    ? logs.filter(
        (l) =>
          l.action.includes(filter.toUpperCase()) ||
          l.user.email.includes(filter) ||
          l.entityType.includes(filter.toUpperCase()) ||
          (l.details && l.details.toLowerCase().includes(filter.toLowerCase()))
      )
    : logs;

  return (
    <div className="min-h-screen bg-[#020617] p-8 font-mono">
      <div className="mb-6">
        <h1 className="text-2xl font-black tracking-widest text-white">AUDITORÍA</h1>
        <p className="mt-1 text-xs text-slate-500">{logs.length} evento(s) registrado(s)</p>
      </div>

      <div className="mb-6">
        <input
          type="text"
          placeholder="Filtrar por acción, usuario, entidad..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="w-full max-w-md rounded-lg border border-slate-700 bg-slate-800/50 px-4 py-2.5 text-sm text-white placeholder-slate-600 outline-none focus:border-sky-500/50 focus:ring-2 focus:ring-sky-500/20"
        />
      </div>

      {loading ? (
        <p className="text-xs text-slate-500">Cargando...</p>
      ) : (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-left text-slate-500 tracking-widest">
                  <th className="pb-3 pr-6">ACCIÓN</th>
                  <th className="pb-3 pr-6">ENTIDAD</th>
                  <th className="pb-3 pr-6">DETALLES</th>
                  <th className="pb-3 pr-6">USUARIO</th>
                  <th className="pb-3">FECHA</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((log) => (
                  <tr key={log.id} className="border-b border-slate-800/50 last:border-0">
                    <td className="py-3 pr-6">
                      <Badge
                        label={log.action}
                        variant={ACTION_VARIANTS[log.action] || "neutral"}
                      />
                    </td>
                    <td className="py-3 pr-6 text-slate-400">
                      {log.entityType}
                      {log.entityId && <span className="text-slate-600"> #{log.entityId}</span>}
                    </td>
                    <td className="py-3 pr-6 max-w-xs text-slate-500 truncate">
                      {log.details || "—"}
                    </td>
                    <td className="py-3 pr-6">
                      <p className="text-white">{log.user.name || "—"}</p>
                      <p className="text-slate-500">{log.user.email}</p>
                    </td>
                    <td className="py-3 text-slate-500">
                      {new Date(log.createdAt).toLocaleString("es-CO")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filtered.length === 0 && (
              <p className="py-8 text-center text-slate-600">Sin resultados</p>
            )}
          </div>
        </Card>
      )}
    </div>
  );
}
