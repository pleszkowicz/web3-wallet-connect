'use server'
import { Prisma } from "@/lib/generated/prisma"
import { prisma } from "@/lib/prisma";

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
