import Link from "next/link";

export default function Home() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-[#020617] via-[#050810] to-[#020617] font-mono">
      
      {/* Grid más sutil */}
      <div
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          backgroundImage:
            "linear-gradient(rgba(56,189,248,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(56,189,248,0.03) 1px, transparent 1px)",
          backgroundSize: "50px 50px",
        }}
      />

      {/* Glow PRO */}
      <div className="pointer-events-none absolute left-1/2 top-1/3 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-sky-500/10 blur-[140px]" />
      <div className="pointer-events-none absolute top-0 left-0 h-72 w-72 bg-violet-500/10 blur-[120px]" />
      <div className="pointer-events-none absolute bottom-0 right-0 h-72 w-72 bg-sky-500/10 blur-[120px]" />

      {/* Nav */}
      <nav className="relative z-10 flex items-center justify-between border-b border-sky-900/30 px-8 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-md border border-sky-500/50 bg-sky-500/10">
            <span className="text-xs font-bold text-sky-400">CH</span>
          </div>
          <span className="text-sm font-bold tracking-widest text-white">CLOCKHUB</span>
        </div>
        <div className="flex items-center gap-6">
          <Link href="/login" className="text-xs tracking-widest text-slate-400 transition hover:text-sky-400">
            INICIAR SESIÓN
          </Link>
          <Link
            href="/register"
            className="rounded border border-sky-500/50 bg-sky-500/10 px-4 py-2 text-xs font-bold tracking-widest text-sky-400 transition hover:bg-sky-500/20"
          >
            REGISTRARSE
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <main className="relative z-10 flex flex-col items-center justify-center px-8 py-32 text-center">
        <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-sky-500/30 bg-sky-500/5 px-4 py-2">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-green-400" />
          <span className="text-xs tracking-widest text-sky-400">
            SISTEMA ACTIVO — GESTIÓN DE HORARIOS
          </span>
        </div>

        <h1 className="mb-4 max-w-3xl text-5xl font-black leading-tight tracking-tight text-white md:text-7xl">
          Gestiona los{" "}
          <span className="bg-gradient-to-r from-sky-400 to-violet-400 bg-clip-text text-transparent">
            horarios
          </span>{" "}
          de tu equipo
        </h1>

        <p className="mb-4 text-lg text-slate-500 md:text-xl">
          de forma segura y centralizada
        </p>

        <p className="mb-12 max-w-xl text-sm leading-relaxed text-slate-500">
          ClockHub te permite organizar turnos, evitar conflictos de horarios y controlar accesos
          con roles como <span className="text-sky-400">Admin</span>,{" "}
          <span className="text-violet-400">Manager</span> y{" "}
          <span className="text-slate-300">Employee</span>.
        </p>

        <div className="flex flex-col gap-4 sm:flex-row">
          <Link
            href="/register"
            className="rounded-lg bg-sky-500 px-8 py-4 text-sm font-bold tracking-widest text-white shadow-lg shadow-sky-500/30 transition hover:bg-sky-400"
          >
            CREAR CUENTA →
          </Link>
          <Link
            href="/login"
            className="rounded-lg border border-slate-700 px-8 py-4 text-sm font-bold tracking-widest text-slate-400 transition hover:border-sky-500/50 hover:text-sky-400"
          >
            YA TENGO CUENTA
          </Link>
        </div>

        <div className="mt-24 grid max-w-4xl grid-cols-1 gap-4 md:grid-cols-3">
          {[
            {
              icon: "📅",
              title: "Gestión de Horarios",
              desc: "Crea, edita y organiza turnos sin conflictos de disponibilidad.",
            },
            {
              icon: "🔐",
              title: "Control de Acceso",
              desc: "Roles definidos para Admin, Manager y Employee con permisos seguros.",
            },
            {
              icon: "📊",
              title: "Auditoría y Control",
              desc: "Registra cambios y mantiene trazabilidad completa de acciones.",
            },
          ].map((f) => (
            <div
              key={f.title}
              className="rounded-xl border border-slate-800 bg-slate-900/50 p-6 text-left backdrop-blur"
            >
              <div className="mb-3 text-2xl">{f.icon}</div>
              <h3 className="mb-2 text-sm font-bold tracking-widest text-white">
                {f.title}
              </h3>
              <p className="text-xs leading-relaxed text-slate-500">
                {f.desc}
              </p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}