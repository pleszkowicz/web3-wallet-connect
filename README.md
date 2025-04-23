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

## Configure API keys

For development purposes, create `.env.local` file in the root project directory. Then copy and fill required keys from [.env](https://github.com/pleszkowicz/web3-wallet-connect/blob/main/.env.example) file. Also, `.env.example` contains instructions how to obtain API keys.

## Getting Started

This project utilizes Next.js API routing and connects with blockchain by Alchemy provider.

To run smoothly in production mode, I decided to utilize prisma with PostgreSQL hosted on Neon.

### Next step

Install and run the development server:

```bash
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the results.

## App Features

### Welcome Screen

Once the application is running, depending on available web3 wallets, you should see a Welcome screen.

### Wallet Dashboard

After connecting your [wallet](https://github.com/ethereumbook/ethereumbook/blob/develop/05wallets.asciidoc), you can view your balance, mint, trade NFTs, check transaction history, and more...

![balance](https://github.com/pleszkowicz/web3-wallet-connect/blob/main/public/images/balance.png?raw=true)

### NFT Minting

Create NFTs on Sepolia or localhost Hardhat network using the built-in NFT creation form.

### NFT price updates

NFT owners are eligible to update the price in ETH tokens.

### NFT Sell and Buy

In order to sell NFT, smart-contract requires to set `approval`, which is  permission granting for smart contract address to manage or transfer NFT ownership on behalf of the owner. If approval is performed, other web app users are allowed to buy NFT at price specified by owner.

Also, an owner can withdraw `approval` at any point of time, allowing other users to view only. Whole logic is well docummented and tested on [hardhat-smart-contract](https://github.com/pleszkowicz/hardhat-smart-contract).

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
