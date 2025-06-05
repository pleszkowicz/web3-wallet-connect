'use server'
import { prisma } from "@/lib/prisma";

export type GetNftResponse = {
    success: boolean;
    nftUri?: {
        id: string;
        name: string;
        description: string;
        image: string;
    } | null;
    error?: string;
};

export async function getNftTokenUri(id: string): Promise<GetNftResponse> {
    try {
        if (!id) {
            return { success: false, nftUri: null, error: "No token ID provided." };
        }

        const nft = await prisma.nft.findUnique({
            where: { id },
        });

        if (!nft) {
            return { success: true, nftUri: null }; // obsługujemy “not found”
        }

        return {
            success: true,
            nftUri: {
                id: nft.id,
                name: nft.name,
                description: nft.description,
                image: nft.image,
            },
        };
    } catch (err) {
        const message = err instanceof Error ? err.message : "Unknown error";
        return { success: false, nftUri: null, error: message };
    }
}