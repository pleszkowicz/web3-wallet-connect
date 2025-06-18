import invariant from "tiny-invariant";
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

export const revalidate = 60; // seconds

export const fetchCache = 'force-cache';

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        invariant(typeof id === 'string', 'Invalid token ID');

        const token = await prisma.nft.findUnique({ where: { id } })

        if (!token) {
            return new Response(JSON.stringify({ error: 'Token not found' }), { status: 404 });
        }

        return new Response(JSON.stringify(token));
    } catch (error) {
        console.error('Error fetching token:', error);

        return new Response(JSON.stringify({ error: (error as Error).message || 'Internal Server Error' }), { status: 500 });
    }
}
