interface BadgeProps {
  label: string;
  variant?: "success" | "warning" | "danger" | "info" | "neutral";
}

const styles: Record<string, string> = {
  success: "bg-green-500/10 text-green-400 border-green-500/30",
  warning: "bg-yellow-500/10 text-yellow-400 border-yellow-500/30",
  danger: "bg-red-500/10 text-red-400 border-red-500/30",
  info: "bg-sky-500/10 text-sky-400 border-sky-500/30",
  neutral: "bg-slate-700/50 text-slate-400 border-slate-600",
};

export function Badge({ label, variant = "info" }: BadgeProps) {
  return (
    <span className={`inline-block rounded-full border px-2.5 py-0.5 text-xs font-mono tracking-wider ${styles[variant]}`}>
      {label}
    </span>
  );
}
