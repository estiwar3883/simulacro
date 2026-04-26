"use client";

import { useEffect, useState } from "react";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { User } from "@/types";

type EditForm = { name: string; role: string; status: string };

export default function UsersPage() {
  const { user: currentUser } = useCurrentUser();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [form, setForm] = useState<EditForm>({ name: "", role: "EMPLOYEE", status: "ACTIVE" });
  const [createMode, setCreateMode] = useState(false);
  const [createForm, setCreateForm] = useState({ email: "", password: "", name: "", role: "EMPLOYEE" });
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    const res = await fetch("/api/users");
    const data = await res.json();
    if (data.success) setUsers(data.data);
    setLoading(false);
  };

  useEffect(() => { fetchUsers(); }, []);

  const openEdit = (u: User) => {
    setEditingUser(u);
    setForm({ name: u.name || "", role: u.role, status: u.status });
    setFormError("");
    setCreateMode(false);
    setModalOpen(true);
  };

  const openCreate = () => {
    setCreateMode(true);
    setEditingUser(null);
    setCreateForm({ email: "", password: "", name: "", role: "EMPLOYEE" });
    setFormError("");
    setModalOpen(true);
  };

  const handleEdit = async () => {
    if (!editingUser) return;
    setSubmitting(true);
    const res = await fetch(`/api/users/${editingUser.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    if (!res.ok) { setFormError(data.error); setSubmitting(false); return; }
    await fetchUsers();
    setModalOpen(false);
    setSubmitting(false);
  };

  const handleCreate = async () => {
    if (!createForm.email || !createForm.password) {
      setFormError("Email y contraseña son requeridos");
      return;
    }
    setSubmitting(true);
    const res = await fetch("/api/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(createForm),
    });
    const data = await res.json();
    if (!res.ok) { setFormError(data.error); setSubmitting(false); return; }
    await fetchUsers();
    setModalOpen(false);
    setSubmitting(false);
  };

  const handleDelete = async (u: User) => {
    if (!confirm(`¿Desactivar al usuario "${u.email}"?`)) return;
    await fetch(`/api/users/${u.id}`, { method: "DELETE" });
    await fetchUsers();
  };

  const roleVariant = (role: string) =>
    role === "ADMIN" ? "danger" : role === "MANAGER" ? "warning" : "neutral";

  const statusVariant = (s: string) =>
    s === "ACTIVE" ? "success" : s === "SUSPENDED" ? "warning" : "neutral";

  return (
    <div className="min-h-screen bg-[#020617] p-8 font-mono">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black tracking-widest text-white">USUARIOS</h1>
          <p className="mt-1 text-xs text-slate-500">{users.length} usuario(s) registrado(s)</p>
        </div>
        <Button onClick={openCreate}>+ NUEVO USUARIO</Button>
      </div>

      {loading ? (
        <p className="text-xs text-slate-500">Cargando...</p>
      ) : (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-left text-slate-500 tracking-widest">
                  <th className="pb-3 pr-6">NOMBRE / EMAIL</th>
                  <th className="pb-3 pr-6">ROL</th>
                  <th className="pb-3 pr-6">ESTADO</th>
                  <th className="pb-3 pr-6">CREADO</th>
                  <th className="pb-3">ACCIONES</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} className="border-b border-slate-800/50 last:border-0">
                    <td className="py-3 pr-6">
                      <p className="font-bold text-white">{u.name || "—"}</p>
                      <p className="text-slate-500">{u.email}</p>
                    </td>
                    <td className="py-3 pr-6">
                      <Badge label={u.role} variant={roleVariant(u.role)} />
                    </td>
                    <td className="py-3 pr-6">
                      <Badge label={u.status} variant={statusVariant(u.status)} />
                    </td>
                    <td className="py-3 pr-6 text-slate-500">
                      {new Date(u.createdAt).toLocaleDateString("es-CO")}
                    </td>
                    <td className="py-3">
                      <div className="flex gap-2">
                        <Button variant="ghost" onClick={() => openEdit(u)}>EDITAR</Button>
                        {u.id !== currentUser?.id && (
                          <Button variant="danger" onClick={() => handleDelete(u)}>DESACTIVAR</Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Modal */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={createMode ? "NUEVO USUARIO" : "EDITAR USUARIO"}
      >
        <div className="space-y-4">
          {createMode ? (
            <>
              <div>
                <label className="mb-1.5 block text-xs tracking-widest text-slate-500">EMAIL</label>
                <input
                  type="email"
                  value={createForm.email}
                  onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
                  className="w-full rounded-lg border border-slate-700 bg-slate-800/50 px-4 py-2.5 text-sm text-white outline-none focus:border-sky-500/50"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs tracking-widest text-slate-500">NOMBRE</label>
                <input
                  type="text"
                  value={createForm.name}
                  onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                  className="w-full rounded-lg border border-slate-700 bg-slate-800/50 px-4 py-2.5 text-sm text-white outline-none focus:border-sky-500/50"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs tracking-widest text-slate-500">CONTRASEÑA</label>
                <input
                  type="password"
                  value={createForm.password}
                  onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })}
                  className="w-full rounded-lg border border-slate-700 bg-slate-800/50 px-4 py-2.5 text-sm text-white outline-none focus:border-sky-500/50"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs tracking-widest text-slate-500">ROL</label>
                <select
                  value={createForm.role}
                  onChange={(e) => setCreateForm({ ...createForm, role: e.target.value })}
                  className="w-full rounded-lg border border-slate-700 bg-slate-800/50 px-4 py-2.5 text-sm text-white outline-none"
                >
                  <option value="EMPLOYEE">EMPLOYEE</option>
                  <option value="MANAGER">MANAGER</option>
                  <option value="ADMIN">ADMIN</option>
                </select>
              </div>
            </>
          ) : (
            <>
              <div>
                <label className="mb-1.5 block text-xs tracking-widest text-slate-500">NOMBRE</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full rounded-lg border border-slate-700 bg-slate-800/50 px-4 py-2.5 text-sm text-white outline-none focus:border-sky-500/50"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs tracking-widest text-slate-500">ROL</label>
                <select
                  value={form.role}
                  onChange={(e) => setForm({ ...form, role: e.target.value })}
                  className="w-full rounded-lg border border-slate-700 bg-slate-800/50 px-4 py-2.5 text-sm text-white outline-none"
                >
                  <option value="EMPLOYEE">EMPLOYEE</option>
                  <option value="MANAGER">MANAGER</option>
                  <option value="ADMIN">ADMIN</option>
                </select>
              </div>
              <div>
                <label className="mb-1.5 block text-xs tracking-widest text-slate-500">ESTADO</label>
                <select
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value })}
                  className="w-full rounded-lg border border-slate-700 bg-slate-800/50 px-4 py-2.5 text-sm text-white outline-none"
                >
                  <option value="ACTIVE">ACTIVE</option>
                  <option value="INACTIVE">INACTIVE</option>
                  <option value="SUSPENDED">SUSPENDED</option>
                </select>
              </div>
            </>
          )}

          {formError && (
            <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-2 text-xs text-red-400">
              {formError}
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <Button variant="ghost" onClick={() => setModalOpen(false)} className="flex-1">CANCELAR</Button>
            <Button
              onClick={createMode ? handleCreate : handleEdit}
              disabled={submitting}
              className="flex-1"
            >
              {submitting ? "GUARDANDO..." : createMode ? "CREAR" : "GUARDAR"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
