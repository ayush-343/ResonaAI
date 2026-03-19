import { PrismaClient } from "@/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { env } from "./env";
// We are using the PrismaPg adapter to connect to our PostgreSQL database, which allows us to use Prisma in environments where we can't use a traditional connection pool (e.g., serverless environments like Cloudflare Workers).
const adapter = new PrismaPg({
    connectionString: env.DATABASE_URL,
});
// This is to ensure that we only have one instance of PrismaClient in development
const globalForPrisma = global as unknown as { prisma: PrismaClient }; 

const prisma = globalForPrisma.prisma || new PrismaClient({adapter});


if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export default prisma;