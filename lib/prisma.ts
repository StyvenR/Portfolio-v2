import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import pkg from "pg";
const { Pool } = pkg;

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Créer le pool PostgreSQL
const connectionString = process.env.DATABASE_URL!;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);

// Configuration PrismaClient avec l'adapter PostgreSQL
const prismaClientOptions: ConstructorParameters<typeof PrismaClient>[0] = {
  adapter,
  log:
    process.env.NODE_ENV === "development"
      ? ["query", "error", "warn"]
      : ["error"],
};

export const prisma =
  globalForPrisma.prisma ?? new PrismaClient(prismaClientOptions);

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
