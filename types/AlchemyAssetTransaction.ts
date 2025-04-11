export type AlchemyAssetTransaction = {
    blockNum: string; // hex string
    hash: string;
    from: string;
    to: string;
    value: number | null; // often in ETH or token units
    asset: string | null; // ETH, DAI, NFT name, etc.
    category: 'external' | 'internal' | 'erc20' | 'erc721' | 'erc1155' | 'specialnft';
    rawContract: {
        value: string;
        address: string;
        decimal?: string;
    };
    metadata: {
        blockTimestamp: string; // e.g. "2023-11-15T12:34:56.000Z"
    };
}
