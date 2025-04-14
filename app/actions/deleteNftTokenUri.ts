'use server'
import { PrismaClient } from "@/lib/generated/prisma"
import { NftMeta } from "@/types/NFT";

const prisma = new PrismaClient();

export async function deleteNftTokenUri({ id }: Pick<NftMeta, 'id'>) {
    try {
        if (!id) {
            return { error: 'No token ID specified.' };
        }

        const nft = await prisma.nft.delete({ where: { id } });

        return { success: true, nft }
    } catch (error) {
        return { error }
    }
}
