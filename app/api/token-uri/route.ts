'use server';
import { NftMeta } from "@/types/NFT";
import { NextRequest } from "next/server";
import { PrismaClient } from '@/lib/generated/prisma';

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
    const { name, description, image }: NftMeta = await new Response(req.body).json();

    if (!name || !description || !image) {
        return new Response(JSON.stringify({ error: "All fields are required." }), { status: 400, });
    }

    const newToken = await prisma.nft.create({ data: { name, description, image } });

    return new Response(JSON.stringify(newToken), {
        status: 201
    });
}

export async function GET() {
    const tokens = await prisma.nft.findMany();

    return new Response(JSON.stringify(tokens), {
        headers: {
            'Content-Type': 'application/json',
        },
    });
}
