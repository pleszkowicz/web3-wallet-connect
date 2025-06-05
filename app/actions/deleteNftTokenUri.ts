'use server';
import { prisma } from '@/lib/prisma';

export type DeleteNftResponse = {
    success: boolean;
    nftDeleted?: {
        id: string;
        name: string;
        description: string;
        image: string;
    };
    error?: string;
};

export async function deleteNftTokenUri({ id }: { id: string }): Promise<DeleteNftResponse> {
    try {
        if (!id) {
            return { success: false, error: 'No token ID specified.' };
        }

        const deleted = await prisma.nft.delete({
            where: { id },
        });

        // return POJO with the deleted NFT details
        return {
            success: true,
            nftDeleted: {
                id: deleted.id,
                name: deleted.name,
                description: deleted.description,
                image: deleted.image,
            },
        };
    } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        return { success: false, error: message };
    }
}
