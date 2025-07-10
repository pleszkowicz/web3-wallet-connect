'use client';
import { ContentLayout } from '@/components/ContentLayout';
import { HomePageSlider } from '@/components/home-page/Slider';
import { NftListItem } from '@/components/nft/NftListItem';
import { Button } from '@/components/ui/button';
import { DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ConnectWallet } from '@/components/wallet/ConnectWallet';
import { NFT_MARKET_CONTRACT_ABI } from '@/const/nft-marketplace/nft-marketplace-abi';
import { NFT_MARKETPLACE_ADDRESS } from '@/const/nft-marketplace/nft-marketplace-address';
import { useMounted } from '@/hooks/useMounted';
import { Dialog } from '@radix-ui/react-dialog';
import { OpenInNewWindowIcon } from '@radix-ui/react-icons';
import { Code, Loader2, Rocket } from 'lucide-react';
import Link from 'next/link';
import { useAccount, useReadContract } from 'wagmi';

export function HomePage() {
  const { isConnected } = useAccount();

  // Fetch NFTs for display (show up to 3)
  const {
    data: nfts,
    isLoading: isNftsLoading,
    error: nftsError,
  } = useReadContract({
    address: NFT_MARKETPLACE_ADDRESS,
    abi: NFT_MARKET_CONTRACT_ABI,
    functionName: 'getAllNfts',
  });

  const mounted = useMounted();

  if (!mounted) {
    return null;
  }

  return (
    <ContentLayout>
      <div className="mb-16 text-center">
        <h1 className="mb-4 text-4xl font-bold text-white md:text-6xl">
          Your All-in-One{' '}
          <span className="bg-linear-to-r from-orange-400 to-orange-600 bg-clip-text text-transparent">
            Web3 Dashboard
          </span>
        </h1>
        <p className="mx-auto max-w-2xl text-xl text-gray-400">Swap tokens, trade NFTs, and connect your wallet</p>
      </div>
      <div className="mb-24">
        <h2 className="mb-16 text-center text-2xl font-bold text-white md:text-3xl">Explore & Trade NFTs</h2>
        <div className="grid grid-cols-3 gap-6">
          {isNftsLoading ? (
            <Loader2 className="mx-auto animate-spin" />
          ) : nftsError ? (
            <p className="col-span-3 text-red-500">
              Unable to show NFTs, please check your connection or try again later.
            </p>
          ) : nfts && nfts.length > 0 ? (
            nfts.slice(0, 3).map((nft) => (
              <div key={nft.tokenId} className="flex flex-col justify-between text-center">
                <NftListItem tokenId={nft.tokenId} price={nft.price} owner={nft.owner} hideLink />
              </div>
            ))
          ) : (
            <p className="col-span-3 mt-4 text-gray-400">No NFTs created.</p>
          )}
        </div>
      </div>

      <div className="mb-16">
        <h2 className="text-center text-2xl font-bold text-white md:text-3xl">Explore other features</h2>
        <HomePageSlider />
      </div>

      <div className="mb-16 text-center">
        {/* <h2 className="mb-8 text-2xl font-bold text-white md:text-3xl">Launch Your Dashboard</h2> */}

        {!isConnected ? (
          <ConnectWallet buttonSize="xl" testId="connect-wallet-button" />
        ) : (
          <Button asChild variant="default" size="xl" data-testid="launch-dashboard-button">
            <Link href="/dashboard/tokens">
              <Rocket className="mr-2" /> Launch Dashboard
            </Link>
          </Button>
        )}
      </div>

      <div className="text-center">
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="link" className="text-gray-400 transition-colors duration-200 hover:text-white">
              <Code className="mr-2 h-4 w-4" />
              Local Setup Guide for Developers
            </Button>
          </DialogTrigger>
          <DialogContent aria-describedby="dialog-content" className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Local Setup Guide for Developers</DialogTitle>
            </DialogHeader>
            <div className="text-slate-500">
              <h3>To test all features locally, follow these steps:</h3>
              <ol className="space my-2 list-decimal pl-6">
                <li>
                  <b>Clone and configure</b> the repository
                  <br />
                  <Link
                    href="https://github.com/pleszkowicz/hardhat-smart-contract"
                    className="text-blue-600"
                    target="_blank"
                  >
                    pleszkowicz/hardhat-smart-contract <OpenInNewWindowIcon className="inline" />
                  </Link>{' '}
                </li>
                <li>
                  <b>Set up environment variables</b> as described in the repository’s documentation. .
                </li>
                <li>
                  <b>Start a local Hardhat node</b> and deploy the smart contract by following the instructions in the{' '}
                  <Link
                    href="https://github.com/pleszkowicz/web3-wallet-connect/blob/main/README.md"
                    className="inline-block text-blue-600"
                    target="_blank"
                  >
                    readme <OpenInNewWindowIcon className="inline" />.
                  </Link>
                </li>
              </ol>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </ContentLayout>
  );
}
