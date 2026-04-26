import { ReactNode } from "react";

interface ButtonProps {
  children: ReactNode;
  onClick?: () => void;
  type?: "button" | "submit";
  variant?: "primary" | "danger" | "ghost" | "success";
  disabled?: boolean;
  className?: string;
}

const styles: Record<string, string> = {
  primary: "bg-sky-500 hover:bg-sky-400 text-white shadow-lg shadow-sky-500/20",
  danger: "bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30",
  ghost: "bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700",
  success: "bg-green-500/10 hover:bg-green-500/20 text-green-400 border border-green-500/30",
};

export function Button({ children, onClick, type = "button", variant = "primary", disabled, className = "" }: ButtonProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`rounded-lg px-4 py-2 text-xs font-bold tracking-widest transition disabled:cursor-not-allowed disabled:opacity-50 ${styles[variant]} ${className}`}
    >
      {children}
    </button>
  );
}
