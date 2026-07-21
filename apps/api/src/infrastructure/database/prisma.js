import { PrismaClient } from '@prisma/client';
import { env } from '../../config/env.js';

let prisma;

function createPrismaClient() {
  const client = new PrismaClient({
    log: env.NODE_ENV === 'development'
      ? ['query', 'warn', 'error']
      : ['warn', 'error'],
  });

  return client;
}

export function getPrisma() {
  if (!prisma) {
    prisma = createPrismaClient();
  }
  return prisma;
}

export async function disconnectPrisma() {
  if (prisma) {
    await prisma.$disconnect();
    prisma = null;
  }
}
