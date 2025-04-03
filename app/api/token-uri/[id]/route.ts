'use server';
import invariant from "tiny-invariant";
import path from 'path';
import fs from "fs";
import { NextRequest } from "next/server";
import { Nft } from "@/types/NFT";

const filePath = path.join(process.cwd(), 'data', 'tokens.json');

const readTokens = async () => {
    const data = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(data);
}

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        invariant(typeof id === 'string', 'Invalid token ID');

        const tokens = await readTokens();
        const token = tokens.find((token: Nft) => token.tokenId.toString() === id);

        if (!token) {
            return new Response(JSON.stringify({ error: 'Token not found' }), { status: 404 });
        }

        return new Response(JSON.stringify(token));
    } catch (error) {
        console.error('Error fetching token:', error);

        return new Response(JSON.stringify({ error: (error as Error).message || 'Internal Server Error' }), { status: 500 });
    }
}
