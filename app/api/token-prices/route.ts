import { tokens } from "@/const/tokens";
import { NextRequest } from "next/server";

const tokenSymbols = tokens.map((token) => token.symbol).join(',');

export const revalidate = 60; // seconds

// ensure every external fetch is cached too (defaults to 'auto')
export const fetchCache = 'force-cache';

export async function GET(_req: NextRequest) {
    try {
        const priceApiUrl = `https://api.coingecko.com/api/v3/simple/price?symbols=${tokenSymbols}&vs_currencies=usd`
        const res = await fetch(priceApiUrl);
        const json: Record<string, { usd: number }> = await res.json();
        // flatten to Record<string,number>
        const responseData = Object.fromEntries(Object.entries(json).map(([id, { usd }]) => [id, usd])) as Record<string, number>;
        return new Response(JSON.stringify(responseData));

    } catch (error) {
        console.error('Error fetching token:', error);

        return new Response(JSON.stringify({ error: (error as Error).message || 'Internal Server Error' }), { status: 500 });
    }
}
