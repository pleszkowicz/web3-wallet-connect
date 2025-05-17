// ChainLink Token contract:
// https://sepolia.etherscan.io/token/0x779877a7b0d9e8603169ddbd7836e478b4624789#code

import { Address } from "viem";

export const DOG_TOKEN_ABI = [{ "inputs": [{ "internalType": "address", "name": "implementation", "type": "address" }, { "internalType": "bytes", "name": "_data", "type": "bytes" }], "stateMutability": "payable", "type": "constructor" }, { "inputs": [{ "internalType": "address", "name": "target", "type": "address" }], "name": "AddressEmptyCode", "type": "error" }, { "inputs": [{ "internalType": "address", "name": "implementation", "type": "address" }], "name": "ERC1967InvalidImplementation", "type": "error" }, { "inputs": [], "name": "ERC1967NonPayable", "type": "error" }, { "inputs": [], "name": "FailedCall", "type": "error" }, { "anonymous": false, "inputs": [{ "indexed": true, "internalType": "address", "name": "implementation", "type": "address" }], "name": "Upgraded", "type": "event" }, { "stateMutability": "payable", "type": "fallback" }] as const;
