'use server'
import { prisma } from "@/lib/prisma";

export async function getNftTokenUri(id: string) {
    try {
        const nftUri = await prisma.nft.findUnique({ where: { id } });

        return { success: true, nftUri }
    } catch (error) {
        return { error }
    }
}
