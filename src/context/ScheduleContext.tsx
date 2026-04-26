"use client";

import { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { Schedule } from "@/types";

interface ScheduleContextType {
  schedules: Schedule[];
  setSchedules: (s: Schedule[]) => void;
  loading: boolean;
  fetchSchedules: () => Promise<void>;
  deleteSchedule: (id: number) => Promise<void>;
}

const ScheduleContext = createContext<ScheduleContextType | undefined>(undefined);

export function ScheduleProvider({ children }: { children: ReactNode }) {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchSchedules = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/schedules");
      const data = await res.json();
      if (data.success) setSchedules(data.data);
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteSchedule = useCallback(async (id: number) => {
    await fetch(`/api/schedules/${id}`, { method: "DELETE" });
    setSchedules((prev) => prev.filter((s) => s.id !== id));
  }, []);

  return (
    <ScheduleContext.Provider value={{ schedules, setSchedules, loading, fetchSchedules, deleteSchedule }}>
      {children}
    </ScheduleContext.Provider>
  );
}

export function useSchedules() {
  const context = useContext(ScheduleContext);
  if (!context) throw new Error("useSchedules debe usarse dentro de ScheduleProvider");
  return context;
}
