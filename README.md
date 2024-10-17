This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).
It connects with injected web3 wallet from the browser and allows to:
- switch networks (chains)
- read balance
- send transaction

## Getting Started

This project utilizes next.js API routing to connect with Etherscan. THe key is stored locally in the `.env` file.
See `.env` for more details and how to obtain a key.

Create `.env.local` and add required key(s) to it.

First, run the development server:

```bash
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## App

Once the application is running, you should see the following login screen:

![login](https://github.com/pleszkowicz/web3-wallet-connect/blob/main/public/images/login.png?raw=true)

Then, use selected web3 wallet from the browser and allow read-only access to your account.

![balance](https://github.com/pleszkowicz/web3-wallet-connect/blob/main/public/images/balance.png?raw=true)

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
