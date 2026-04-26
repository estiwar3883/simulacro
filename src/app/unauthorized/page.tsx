import Link from "next/link";

export default function UnauthorizedPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#020617] font-mono">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-red-500/30 bg-red-500/10 mb-6">
        <span className="text-2xl">🔒</span>
      </div>
      <h1 className="text-xl font-black tracking-widest text-white">ACCESO DENEGADO</h1>
      <p className="mt-2 text-sm text-slate-500">No tienes permisos para ver esta página.</p>
      <Link
        href="/dashboard"
        className="mt-8 rounded-lg bg-sky-500 px-6 py-3 text-xs font-bold tracking-widest text-white transition hover:bg-sky-400"
      >
        ← VOLVER AL DASHBOARD
      </Link>
    </div>
  );
}
