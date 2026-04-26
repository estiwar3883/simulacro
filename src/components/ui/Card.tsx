import { ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  className?: string;
}

export function Card({ children, className = "" }: CardProps) {
  return (
    <div className={`rounded-xl border border-slate-800 bg-slate-900/80 p-6 backdrop-blur ${className}`}>
      {children}
    </div>
  );
}
