import { PrismaClient } from '@prisma/client'

const globalForPrisma = global as unknown as { prisma: PrismaClient }

export const prisma =
  globalForPrisma.prisma || new PrismaClient() // <-- Quita todo lo de adentro

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma