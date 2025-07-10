'use client';
import { ContentLayout } from '@/components/ContentLayout';
import { NftListItem } from '@/components/nft/NftListItem';
import { Button } from '@/components/ui/button';
import { DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { NFT_MARKET_CONTRACT_ABI } from '@/const/nft-marketplace/nft-marketplace-abi';
import { NFT_MARKETPLACE_ADDRESS } from '@/const/nft-marketplace/nft-marketplace-address';
import { useMounted } from '@/hooks/useMounted';
import { Dialog } from '@radix-ui/react-dialog';
import { OpenInNewWindowIcon } from '@radix-ui/react-icons';
import { Code, Loader2, Rocket, Wallet2 } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Connector, useAccount, useConnect, useReadContract } from 'wagmi';

export function ConnectWallet() {
  const { connectors, connectAsync, isPending: isConnectionPending, isSuccess: isConnectionSuccess } = useConnect();
  const { isConnected } = useAccount();
  const { push } = useRouter();
  const [open, setIsOpen] = useState(false);

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

  const onConnectorSelect = async (connector: Connector) => {
    await connectAsync({ connector });
    setIsOpen(false);
    push('/dashboard');
  };

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
      <div className="mb-16">
        <h2 className="mb-8 text-center text-2xl font-bold text-white md:text-3xl">Explore & Trade NFTs</h2>
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
      <div className="mb-16 text-center">
        <h2 className="mb-8 text-2xl font-bold text-white md:text-3xl">Let's dive</h2>

        {!isConnected ? (
          <Dialog open={open} onOpenChange={setIsOpen}>
            <DialogTrigger asChild onAbort={() => setIsOpen(false)}>
              <Button
                data-testid="connect-wallet-button"
                variant="default"
                size="xl"
                className="cursor-pointer"
                onClick={() => setIsOpen(true)}
              >
                <Wallet2 className="mr-2 h-6 w-6" />
                Connect your wallet
              </Button>
            </DialogTrigger>
            <DialogContent
              className="border-gray-700 bg-gray-900 text-white sm:max-w-[425px]"
              aria-describedby="dialog-content"
            >
              <DialogHeader>
                <DialogTitle>Please connect your wallet</DialogTitle>
              </DialogHeader>
              <DialogDescription asChild>
                <div className="mt-6 grid w-full gap-2">
                  {connectors.length ? (
                    connectors.map((connector) => (
                      <WalletOption
                        key={connector.id}
                        connector={connector}
                        onClick={onConnectorSelect}
                        pending={isConnectionPending}
                      />
                    ))
                  ) : (
                    <div className="text-slate-700">
                      <p>
                        Unfortunately, I <b>coud not find any crypto wallet</b> enabled in your browser. Once you
                        install, please try again.
                      </p>
                    </div>
                  )}
                </div>
              </DialogDescription>
            </DialogContent>
          </Dialog>
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

function WalletOption({
  connector,
  onClick,
  pending,
}: {
  connector: Connector;
  onClick: (connector: Connector) => void;
  pending: boolean;
}) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    (async () => {
      const provider = await connector.getProvider();
      setReady(!!provider);
    })();
  }, [connector]);

  return (
    <Button
      data-testid={`connector-${connector.id}`}
      variant="outline"
      size="lg"
      className="flex w-full transform cursor-pointer content-between justify-start border-gray-600 bg-gray-700 text-lg text-white transition-transform duration-500 hover:scale-[1.01] hover:bg-gray-600 hover:text-white"
      disabled={!ready || pending}
      onClick={() => onClick(connector)}
    >
      {connector.icon && (
        <Image
          src={connector.icon.trimStart().trimEnd()}
          alt="connector"
          width={20}
          height={20}
          className="mr-2 h-[20px] w-[20px] rounded-sm"
        />
      )}
      <span>{connector.name}</span>
      {!ready && <span className="ml-auto">Unavailable</span>}
      {pending && <Loader2 className="ml-auto h-4 w-4 animate-spin" />}
    </Button>
  );
}
