'use server'
import { prisma } from "@/lib/prisma";
import { NftMeta } from "@/types/NFT";

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
