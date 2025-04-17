'use server'
import { Prisma, PrismaClient } from '@/lib/generated/prisma/edge'

const prisma = new PrismaClient();

export async function createNftTokenUri({ name, description, image }: Prisma.NftCreateInput) {
    try {
        if (!name || !description || !image) {
            return { error: 'All fields are required.' };
        }

        const nftUri = await prisma.nft.create({ data: { name, description, image } });

        return { success: true, nftUri }
    } catch (error) {
        return { error }
    }
}
