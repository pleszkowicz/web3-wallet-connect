// import { PrismaClient } from "@/lib/generated/prisma/edge"

import { PrismaNeon } from '@prisma/adapter-neon'
import dotenv from 'dotenv'
import { PrismaClient } from './generated/prisma'

dotenv.config()
const connectionString = `${process.env.DATABASE_URL}`

const adapter = new PrismaNeon({ connectionString })

export const prisma = new PrismaClient({ adapter })

// const globalForPrisma = global as unknown as { prisma: PrismaClient };

// export const prisma =
//     globalForPrisma.prisma || new PrismaClient();

// if (process.env.NODE_ENV !== "production") {
//     globalForPrisma.prisma = prisma;
// }
