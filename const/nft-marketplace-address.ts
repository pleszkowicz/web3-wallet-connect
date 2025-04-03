import invariant from "tiny-invariant";
import { Address } from "viem";

invariant(
    process.env.NEXT_PUBLIC_CUSTOM_NFT_MARKETPLACE_SMART_CONTRACT_ADDRESS,
    'NEXT_PUBLIC_CUSTOM_NFT_MARKETPLACE_SMART_CONTRACT_ADDRESS is required'
);

export const NFT_MARKETPLACE_ADDRESS = process.env.NEXT_PUBLIC_CUSTOM_NFT_MARKETPLACE_SMART_CONTRACT_ADDRESS as Address;
