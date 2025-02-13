'use server';
import { NextApiRequest } from "next";
import path from 'path';
import fs from "fs";
import crypto from 'crypto';
import { NFT } from "@/types/NFT";

const filePath = path.join(process.cwd(), 'data', 'tokens.json');
console.log('filePath', filePath)

const readTokens = async () => {
    const data = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(data);
}

export async function POST(req: NextApiRequest) {
    const { name, description, image }: NFT = await new Response(req.body).json();

    if (!name || !description || !image) {
        return Response.json({ error: "All fields are required." }, { status: 400 });
    }

    const tokens: NFT[] = await readTokens();
    const tokenId = crypto.randomUUID();

    const newToken = {
        tokenId,
        name,
        description,
        image,
    };

    tokens.push(newToken);
    fs.writeFileSync(filePath, JSON.stringify(tokens, null, 2));

    return Response.json(newToken, { status: 201 });
}

export async function GET() {
    const tokens = await readTokens();

    return Response.json(tokens);
}
