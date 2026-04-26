export type Role = "ADMIN" | "MANAGER" | "EMPLOYEE";
export type UserStatus = "ACTIVE" | "INACTIVE" | "SUSPENDED";
export type ScheduleStatus = "ACTIVE" | "CANCELLED";

export interface AuthUser {
  id: number;
  email: string;
  name?: string;
  role: Role;
}

export interface User {
  id: number;
  email: string;
  name?: string;
  role: Role;
  status: UserStatus;
  createdAt: string;
}

export interface Schedule {
  id: number;
  title: string;
  startTime: string;
  endTime: string;
  status: ScheduleStatus;
  userId: number;
  createdById: number;
  createdAt: string;
  user?: { name?: string; email: string };
}

export interface AuditLog {
  id: number;
  action: string;
  entityType: string;
  entityId?: number;
  userId: number;
  details?: string;
  createdAt: string;
  user: { email: string; name?: string };
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}
