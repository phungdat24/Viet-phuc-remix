import { PrismaClient } from "@prisma/client";

// Next.js dev mode hot-reloads modules, nên nếu không cache lại instance
// thì mỗi lần reload sẽ mở thêm 1 connection Postgres mới -> hết pool.
// Xem: https://www.prisma.io/docs/orm/more/help-and-troubleshooting/help-articles/nextjs-prisma-client-dev-practices

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

export default prisma;
