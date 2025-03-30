# Web3 Wallet Connect

A [Next.js](https://nextjs.org) application designed to interact with **EVM-compatible blockchains**, showcasing advanced Web3 development skills. This project demonstrates the ability to integrate **wallets**, **smart contracts**, and **blockchain interactions** using modern tools and frameworks.

This project heavily utilizes [wagmi](https://wagmi.sh/react/getting-started) to interact with the **wallet**, **chains**, and **smart contracts**. The purpose of this project is to develop skills in the **EVM** world.

When it comes to functionalities, it allows you to:

- Read current wallet balance
- Switch between networks
- Send transactions
- Create NFTs on the localhost Hardhat network (requires [pleszkowicz/hardhat-smart-contract](https://github.com/pleszkowicz/hardhat-smart-contract) to clone and run locally)
- View NFT collections
- Perform cross-chain crypto exchanges (mocked functionality)
- View transaction history

Supported networks:

- Mainnet
- Sepolia
- Localhost Hardhat network (transaction history not available due to limitations)

## Getting Started

This project utilizes Next.js API routing to connect with Etherscan. The `ETHERSCAN_API_KEY` should be stored locally in the `.env` file. See `.env` for more details and how to obtain a key.

For local development purposes, create `.env.local` and add the required key(s) to it.

First, run the development server:

```bash
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the results.

## App Features

### Login Screen

Once the application is running, you should see the following login screen:

![login](https://github.com/pleszkowicz/web3-wallet-connect/blob/main/public/images/login.png?raw=true)

### Wallet Dashboard

After connecting your wallet, you can view your wallet balance, NFT collections, and transaction history. You can also perform actions like sending transactions or creating NFTs.

![balance](https://github.com/pleszkowicz/web3-wallet-connect/blob/main/public/images/balance.png?raw=true)

### NFT Creation

Easily create NFTs on the Sepolia or localhost Hardhat network using the built-in NFT creation form.

### Cross-Chain Crypto Exchange

Swap cryptocurrencies across different blockchains (mocked functionality for demonstration purposes).

## Contributing

Contributions are welcome! Feel free to fork this repository and submit pull requests to improve the project.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
