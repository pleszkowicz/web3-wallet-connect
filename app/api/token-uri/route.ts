'use server'
import { Prisma, PrismaClient } from "@/lib/generated/prisma"

const prisma = new PrismaClient();

export async function POST({ name, description, image }: Prisma.NftCreateInput) {
    try {
        return {
            a: 'test'
        }
        if (!name || !description || !image) {
            return { error: 'All fields are required.' };
        }

        const nftUri = await prisma.nft.create({ data: { name, description, image } });

        return { success: true, nftUri }
    } catch (error) {
        return { error }
    }
}
