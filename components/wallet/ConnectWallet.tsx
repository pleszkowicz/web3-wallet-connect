'use client';
import { ContentLayout } from '@/components/ContentLayout';
import { Button } from '@/components/ui/button';
import { DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useMounted } from '@/hooks/useMounted';
import { cn } from '@/lib/cn';
import { Dialog } from '@radix-ui/react-dialog';
import { OpenInNewWindowIcon } from '@radix-ui/react-icons';
import { Code, Loader2, Rocket, Wallet2 } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { Connector, useAccount, useConnect } from 'wagmi';

export function WalletConnect() {
  const { connectors, connectAsync, isPending: isConnectionPending, isSuccess: isConnectionSuccess } = useConnect();
  const { isConnected } = useAccount();
  const { push } = useRouter();
  const [open, setIsOpen] = useState(false);

  // prevent re-render during wallet connect action
  const nftPlaceholders = useMemo(() => {
    return [300, 700, 500].map((nftPlaceholderDelay) => (
      <NftPlaceholder delay={nftPlaceholderDelay} key={nftPlaceholderDelay} />
    ));
  }, []);

  const mounted = useMounted();

  if (!mounted) {
    return null;
  }

  return (
    <ContentLayout>
      <div>
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

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">{nftPlaceholders}</div>
        </div>
        <div className="mb-16 text-center">
          <h2 className="mb-8 text-2xl font-bold text-white md:text-3xl">Let's dive</h2>

          {!isConnected ? (
            <Dialog open={open}>
              <DialogTrigger asChild>
                <Button variant="default" size="xl" onClick={() => setIsOpen(true)}>
                  <Wallet2 className="mr-2 h-6 w-6" />
                  Connect your wallet
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]" aria-describedby="dialog-content">
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
                          onClick={async () => {
                            await connectAsync({ connector });
                            setIsOpen(false);
                            push('/dashboard');
                          }}
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
            <Button asChild variant="default" size="xl">
              <Link href="/dashboard">
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
  onClick: () => void;
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
      variant="outline"
      size="lg"
      className="hover:bg-accent flex w-full transform content-between justify-start text-lg transition-transform duration-500 hover:scale-[1.02]"
      disabled={!ready || pending}
      onClick={onClick}
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

const delayMap: Record<number, string> = {
  0: 'delay-0',
  100: 'delay-100',
  200: 'delay-200',
  300: 'delay-300',
  500: 'delay-500',
  700: 'delay-700',
  1000: 'delay-1000',
};

const getRandomTokenData = () => {
  const names = ['Sky Ape', 'Pixel Cat', 'Cyber Punk', 'Mystic Fox'];
  const descriptions = ['Cool NFT', 'Limited Edition', 'Rare drop', 'Exclusive art'];
  const prices = [0.016, 0.05, 0.1, 0.25, 0.5];
  const gradients = [
    ['from-purple-900', 'via-pink-700', 'to-amber-500'],
    ['from-blue-900', 'via-indigo-700', 'to-sky-500'],
    ['from-green-900', 'via-emerald-700', 'to-lime-500'],
    ['from-orange-800', 'via-yellow-600', 'to-red-400'],
    ['from-red-900', 'via-orange-700', 'to-yellow-500'],
  ];

  return {
    gradient: gradients[Math.floor(Math.random() * prices.length)],
    name: names[Math.floor(Math.random() * names.length)],
    description: descriptions[Math.floor(Math.random() * descriptions.length)],
    price: prices[Math.floor(Math.random() * prices.length)],
  };
};

const generateRandomCircles = (count = 5) =>
  Array.from({ length: count }).map((_, i) => {
    const cx = Math.floor(Math.random() * 100);
    const cy = Math.floor(Math.random() * 100);
    const r = Math.floor(Math.random() * 10) + 3;
    const opacity = (Math.random() * 0.1 + 0.05).toFixed(2);
    const blur = Math.random() > 0.5 ? 'blur-xs' : '';
    const delay = `${Math.floor(Math.random() * 3)}s`;
    return (
      <circle
        key={i}
        cx={cx}
        cy={cy}
        r={r}
        fill={`hsl(${Math.floor(Math.random() * 360)}, 70%, 80%)`}
        style={{ animationDelay: delay }}
        className={`animate-float opacity-[${opacity}] ${blur}`}
      />
    );
  });

const NftPlaceholder = ({ delay }: { delay: number }) => {
  const { gradient, name, description, price } = getRandomTokenData();
  const delayClass = delayMap[delay] ?? 'delay-0';

  return (
    <div
      className={cn(
        gradient,
        delayClass,
        'animate-fade-in relative aspect-square overflow-hidden rounded-xl bg-linear-to-br opacity-0'
      )}
    >
      <div className="absolute inset-0 opacity-20">
        <svg className="h-full w-full" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
          {generateRandomCircles(delay / 100)}
        </svg>
      </div>
      <div className="absolute top-[30%] right-0 bottom-0 left-0 flex flex-col justify-end bg-linear-to-t from-black to-transparent p-2">
        <h3 className="font-bold text-white">{name}</h3>
        <p className="text-sm text-gray-300">{description}</p>
        <p className="mt-1 font-bold text-green-400">{price} ETH</p>
      </div>
    </div>
  );
};
