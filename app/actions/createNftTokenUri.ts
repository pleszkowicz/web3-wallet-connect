'use server'
import { Prisma } from "@/lib/generated/prisma"
import { prisma } from "@/lib/prisma";

export type CreateNftResponse = {
    success: boolean;
    nftUri?: {
        id: string;
        name: string;
        description: string;
        image: string;
    };
    error?: string;
};

export async function createNftTokenUri({ name, description, image }: Prisma.NftCreateInput): Promise<CreateNftResponse> {
    try {
        if (!name || !description || !image) {
            return { success: false, error: 'All fields are required.' };
        }

        const nft = await prisma.nft.create({ data: { name, description, image } });

        return {
            success: true,
            nftUri: {
                id: nft.id,
                name: nft.name,
                description: nft.description,
                image: nft.image,
            },
        }
    } catch (error) {
        const message = error instanceof Error ? error.message : "Unknown error";
        return { success: false, error: message };
    }
}
