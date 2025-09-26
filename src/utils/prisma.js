import { PrismaClient } from '@prisma/client';

let prisma;

if (process.env.NODE_ENV === 'production') {
  prisma = new PrismaClient();
} else {
  if (!globalThis.prisma) {
    globalThis.prisma = new PrismaClient();
    globalThis.prisma.$connect(); // Conectar una vez en desarrollo
  }
  prisma = globalThis.prisma;
}

export default prisma;