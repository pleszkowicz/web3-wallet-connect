# Web3 Wallet Connect

A [Next.js](https://nextjs.org) decentralized application (**dApp**) built to interact with **EVM-compatible blockchains**. Demonstrates advanced skills in **wallet integration**, **smart contracts**, and **blockchain interactions** using modern, efficient technologies.

Leveraging [wagmi](https://wagmi.sh/react/getting-started), this project showcases expertise in frontend blockchain development and the Ethereum Virtual Machine (**EVM**) ecosystem integration.

## 🚀 Core Functionalities

The dApp allows users to:

- **Connect wallets** and view balances.
- **Switch blockchain networks** effortlessly.
- **Manage NFTs lifecycle**:
  - Mint NFTs.
  - List NFTs for sale, edit prices, execute sales.
  - Securely manage NFT ownership through **smart-contract approval** (fully documented and tested [here](https://github.com/pleszkowicz/hardhat-smart-contract)).
  - Store NFT metadata in PostgreSQL for demo purposes (production version ideally uses IPFS).
- **Send transactions** and monitor transaction history.
- Utilize integrated **blockchain explorer** links.

Real-time blockchain communication via **web sockets** ensures smooth responsiveness and user experience.

## 🌐 Supported Networks

- **Sepolia Testnet**
- **Localhost (Hardhat)** with detailed transaction history.

## 🛠 Tech Stack

- **Frontend:** Next.js, Tailwind CSS, Shadcn UI
- **Blockchain:** wagmi, Alchemy provider
- **Backend:** Prisma ORM, PostgreSQL (hosted on [Neon](https://neon.tech))
- **Smart Contracts:** Solidity, Hardhat

## ⚡ Quick Setup

```bash
git clone https://github.com/pleszkowicz/web3-wallet-connect
```

> ⚠️ **Important:**  
> This project requires running the [hardhat-smart-contract](https://github.com/pleszkowicz/hardhat-smart-contract) locally to enable full functionality.

### Configure environment

Copy and fill the environment variables:

```bash
cp .env.example .env
```

Update `.env` by obtaining required API keys as instructed in the file`.

### Run the development server

```bash
pnpm install
pnpm dev
```

Visit [http://localhost:3000](http://localhost:3000) in your browser

## 🙌 Contributing

Contributions are welcome! Feel free to fork this repository and submit pull requests to improve the project.

## 📖 Documentation & Useful Links

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [wagmi](https://wagmi.sh/react/getting-started)
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## 🚢 Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
