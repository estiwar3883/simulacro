# ClockHub — Gestión de Horarios

Plataforma full-stack para gestión de horarios y equipos con autenticación JWT segura, RBAC y auditoría completa.

## Stack

- **Frontend**: Next.js 16, React 19, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Base de datos**: PostgreSQL + Prisma ORM
- **Auth**: JWT + Refresh Tokens en HttpOnly Cookies
- **Seguridad**: bcryptjs, middleware de protección de rutas

## Configuración inicial

### 1. Instalar dependencias
```bash
npm install
```

### 2. Variables de entorno
Crea un archivo `.env` en la raíz del proyecto:
```env
DATABASE_URL="postgresql://usuario:password@host:5432/clockhub"
JWT_SECRET="tu_secreto_jwt_super_seguro_aqui"
JWT_REFRESH_SECRET="tu_secreto_refresh_diferente_aqui"
```

### 3. Migrar la base de datos
```bash
npx prisma migrate dev --name init
```

### 4. Ejecutar en desarrollo
```bash
npm run dev
```

Abre http://localhost:3000

---

## Estructura de carpetas

```
src/
├── app/
│   ├── api/
│   │   ├── auth/         login, register, logout, refresh, me
│   │   ├── schedules/    CRUD de horarios + [id]
│   │   ├── users/        CRUD de usuarios (Admin) + [id]
│   │   └── audit/        logs de auditoria
│   ├── dashboard/
│   │   ├── page.tsx      Dashboard principal
│   │   ├── schedules/    Gestión de horarios
│   │   ├── users/        Gestión de usuarios (Admin)
│   │   └── audit/        Logs de auditoria
│   ├── login/
│   ├── register/
│   └── unauthorized/
├── components/ui/        Button, Badge, Card, Modal
├── context/              AuthContext, ScheduleContext
├── hooks/                useCurrentUser
├── types/                Types TypeScript globales
└── middleware.ts         Protección de rutas + RBAC
```

## Roles y permisos

| Permiso              | ADMIN | MANAGER | EMPLOYEE       |
|----------------------|-------|---------|----------------|
| Ver todos horarios   | ✅    | ✅      | solo los suyos |
| Crear horarios       | ✅    | ✅      | ❌             |
| Editar horarios      | ✅    | ✅      | ❌             |
| Cancelar horarios    | ✅    | ✅      | ❌             |
| Gestionar usuarios   | ✅    | ❌      | ❌             |
| Cambiar roles        | ✅    | ❌      | ❌             |
| Ver auditoria        | ✅    | ✅      | ❌             |

## Endpoints API

### Auth
- POST /api/auth/register
- POST /api/auth/login
- POST /api/auth/logout
- POST /api/auth/refresh
- GET  /api/auth/me

### Schedules
- GET    /api/schedules
- POST   /api/schedules
- PUT    /api/schedules/:id
- DELETE /api/schedules/:id  (soft delete → CANCELLED)

### Users (Admin only)
- GET    /api/users
- POST   /api/users
- PUT    /api/users/:id
- DELETE /api/users/:id  (soft delete → INACTIVE)

### Audit (Admin + Manager)
- GET /api/audit
