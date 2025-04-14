import { Prisma } from "@/lib/generated/prisma";
import { Address } from "viem";

export type Nft = {
    tokenId: bigint;
    price: bigint;
    owner: Address,
}

// look into prisma/schema.prisma
export type NftMeta = Prisma.NftGetPayload<false>;
