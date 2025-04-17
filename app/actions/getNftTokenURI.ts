'use server'
import { Prisma, PrismaClient } from "@/lib/generated/prisma"
import { NftMeta } from "@/types/NFT";

const prisma = new PrismaClient();

export async function getNftTokenUri(id: string) {
    try {
        console.log('id', id)
        const nftUri = await prisma.nft.findUnique({ where: { id } });

        return { success: true, nftUri }
    } catch (error) {
        throw error
        return { error }
    }
}
