"use client";

import { useEffect, useState } from "react";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useSchedules } from "@/context/ScheduleContext";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Schedule, User } from "@/types";

interface FormData {
  title: string;
  startTime: string;
  endTime: string;
  userId: string;
}

const EMPTY_FORM: FormData = { title: "", startTime: "", endTime: "", userId: "" };

export default function SchedulesPage() {
  const { user } = useCurrentUser();
  const { schedules, setSchedules, loading, fetchSchedules, deleteSchedule } = useSchedules();
  const [users, setUsers] = useState<User[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Schedule | null>(null);
  const [form, setForm] = useState<FormData>(EMPTY_FORM);
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchSchedules();
    if (user?.role === "ADMIN" || user?.role === "MANAGER") {
      fetch("/api/users")
        .then((r) => r.json())
        .then((d) => { if (d.success) setUsers(d.data); });
    }
  }, [user]);

  const openCreate = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setFormError("");
    setModalOpen(true);
  };

  const openEdit = (s: Schedule) => {
    setEditing(s);
    setForm({
      title: s.title,
      startTime: new Date(s.startTime).toISOString().slice(0, 16),
      endTime: new Date(s.endTime).toISOString().slice(0, 16),
      userId: String(s.userId),
    });
    setFormError("");
    setModalOpen(true);
  };

  const handleSubmit = async () => {
    if (!form.title || !form.startTime || !form.endTime || !form.userId) {
      setFormError("Todos los campos son requeridos");
      return;
    }
    setSubmitting(true);
    setFormError("");

    const url = editing ? `/api/schedules/${editing.id}` : "/api/schedules";
    const method = editing ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();

    if (!res.ok) {
      setFormError(data.error || "Error al guardar");
      setSubmitting(false);
      return;
    }

    await fetchSchedules();
    setModalOpen(false);
    setSubmitting(false);
  };

  const handleDelete = async (id: number, title: string) => {
    if (!confirm(`¿Cancelar el horario "${title}"?`)) return;
    await deleteSchedule(id);
  };

  const canEdit = user?.role === "ADMIN" || user?.role === "MANAGER";

  return (
    <div className="min-h-screen bg-[#020617] p-8 font-mono">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black tracking-widest text-white">HORARIOS</h1>
          <p className="mt-1 text-xs text-slate-500">{schedules.length} horario(s) activo(s)</p>
        </div>
        {canEdit && (
          <Button onClick={openCreate}>+ NUEVO HORARIO</Button>
        )}
      </div>

      {loading ? (
        <p className="text-xs text-slate-500">Cargando...</p>
      ) : schedules.length === 0 ? (
        <Card>
          <p className="text-center text-xs text-slate-600">No hay horarios activos</p>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {schedules.map((s) => (
            <Card key={s.id} className="hover:border-slate-700 transition">
              <div className="flex items-start justify-between">
                <h3 className="text-sm font-bold text-white">{s.title}</h3>
                <Badge label={s.status} variant="success" />
              </div>
              {s.user && (
                <p className="mt-1 text-xs text-sky-400">{s.user.name || s.user.email}</p>
              )}
              <div className="mt-3 space-y-1 border-t border-slate-800 pt-3">
                <p className="text-xs text-slate-500">
                  <span className="text-slate-600">INICIO </span>
                  {new Date(s.startTime).toLocaleString("es-CO")}
                </p>
                <p className="text-xs text-slate-500">
                  <span className="text-slate-600">FIN &nbsp;&nbsp;&nbsp;</span>
                  {new Date(s.endTime).toLocaleString("es-CO")}
                </p>
              </div>
              {canEdit && (
                <div className="mt-4 flex gap-2">
                  <Button variant="ghost" onClick={() => openEdit(s)} className="flex-1">EDITAR</Button>
                  <Button variant="danger" onClick={() => handleDelete(s.id, s.title)} className="flex-1">CANCELAR</Button>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}

      {/* Modal crear/editar */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? "EDITAR HORARIO" : "NUEVO HORARIO"}
      >
        <div className="space-y-4">
          <div>
            <label className="mb-1.5 block text-xs tracking-widest text-slate-500">TÍTULO</label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="Turno mañana"
              className="w-full rounded-lg border border-slate-700 bg-slate-800/50 px-4 py-2.5 text-sm text-white placeholder-slate-600 outline-none focus:border-sky-500/50 focus:ring-2 focus:ring-sky-500/20"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs tracking-widest text-slate-500">EMPLEADO</label>
            <select
              value={form.userId}
              onChange={(e) => setForm({ ...form, userId: e.target.value })}
              className="w-full rounded-lg border border-slate-700 bg-slate-800/50 px-4 py-2.5 text-sm text-white outline-none focus:border-sky-500/50"
            >
              <option value="">Seleccionar empleado...</option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name ? `${u.name} (${u.email})` : u.email}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-xs tracking-widest text-slate-500">INICIO</label>
            <input
              type="datetime-local"
              value={form.startTime}
              onChange={(e) => setForm({ ...form, startTime: e.target.value })}
              className="w-full rounded-lg border border-slate-700 bg-slate-800/50 px-4 py-2.5 text-sm text-white outline-none focus:border-sky-500/50 focus:ring-2 focus:ring-sky-500/20"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs tracking-widest text-slate-500">FIN</label>
            <input
              type="datetime-local"
              value={form.endTime}
              onChange={(e) => setForm({ ...form, endTime: e.target.value })}
              className="w-full rounded-lg border border-slate-700 bg-slate-800/50 px-4 py-2.5 text-sm text-white outline-none focus:border-sky-500/50 focus:ring-2 focus:ring-sky-500/20"
            />
          </div>

          {formError && (
            <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-2 text-xs text-red-400">
              {formError}
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <Button variant="ghost" onClick={() => setModalOpen(false)} className="flex-1">
              CANCELAR
            </Button>
            <Button onClick={handleSubmit} disabled={submitting} className="flex-1">
              {submitting ? "GUARDANDO..." : editing ? "ACTUALIZAR" : "CREAR"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
