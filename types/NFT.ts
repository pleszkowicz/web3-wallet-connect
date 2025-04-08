import { Address } from "viem";

export type Nft = {
    tokenId: bigint;
    price: bigint;
    owner: Address,
}

export type NftMeta = {
    tokenId: `${string}-${string}-${string}-${string}-${string}`;
    name: string;
    description: string;
    image: string;
}
