import { PrismaClient } from "@prisma/client";

export const db = globalThis.prisma || new PrismaClient();
console.log(process.env.DATABASE_URL);
if (process.env.NODE_ENV !== "production") {
  globalThis.prisma = db;
}
