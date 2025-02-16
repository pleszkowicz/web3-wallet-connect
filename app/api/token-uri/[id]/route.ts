'use server';
import { NextApiRequest } from "next";
import invariant from "tiny-invariant";
import path from 'path';
import fs from "fs";
import { NFT } from "@/types/NFT";

const filePath = path.join(process.cwd(), 'data', 'tokens.json');

const readTokens = async () => {
    const data = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(data);
}

export async function GET(_req: NextApiRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        invariant(typeof id === 'string', 'Invalid token ID');

        const tokens = await readTokens();
        const token = tokens.find((token: NFT) => token.tokenId === id);

        if (!token) {
            return Response.json({ error: 'Token not found' }, { status: 404 });
        }

        return Response.json(token);
    } catch (error: unknown) {
        console.error('Error fetching token:', error);

        return Response.json({ error: (error as Error).message || 'Internal Server Error' }, { status: 500 });
    }
}
