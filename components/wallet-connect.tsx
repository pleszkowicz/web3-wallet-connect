'use client';
import { Button } from '@/components/ui/button';
import { useMounted } from '@/hooks/useMounted';
import { cn } from '@/lib/cn';
import { Dialog } from '@radix-ui/react-dialog';
import { OpenInNewWindowIcon } from '@radix-ui/react-icons';
import { Loader2, Wallet2 } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { Connector, useConnect } from 'wagmi';
import { CardLayout } from './card-layout';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './ui/accordion';
import { DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';

export function WalletConnect() {
  const { connectors, connect, isPending } = useConnect();

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
    <CardLayout>
      <div>
        <h1 className="text-center text-3xl font-bold md:text-4xl">Welcome to the NFT Marketplace!</h1>
        <p className="text-center text-lg text-gray-600">Mint. Trade. Discover. All in one place.</p>
        <div className="mb-10 mt-8 rounded-xl bg-gray-50 p-2 sm:p-4">
          <h2 className="mb-6 mt-2 text-center text-2xl font-bold">Explore & Trade NFTs</h2>{' '}
          <div className="grid grid-cols-3 gap-4">{nftPlaceholders}</div>
        </div>
        <h2 className="mb-6 mt-2 text-center text-2xl font-bold">Let's dive, first</h2>{' '}
        <div className="mx-auto flex w-full flex-col items-center self-center md:max-w-[80%]">
          <div className="mb-4 flex items-center pb-2">
            <Dialog>
              <DialogTrigger asChild>
                <div className=" flex items-center pb-2 text-purple-800">
                  <Button variant="default" size="lg">
                    <Wallet2 className="mr-2 h-6 w-6" />
                    Connect your wallet
                  </Button>
                </div>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Please connect your wallet</DialogTitle>
                </DialogHeader>
                <div className="mt-6 grid w-full gap-2">
                  {connectors.length ? (
                    connectors.map((connector) => (
                      <WalletOption
                        key={connector.id}
                        connector={connector}
                        onClick={() => connect({ connector })}
                        pending={isPending}
                      />
                    ))
                  ) : (
                    <div className="text-slate-700">
                      <p>
                        Unfortunately, I <b>coud not find any crypto wallet</b> enabled in your browser. Once you
                        install, please try again.
                      </p>
                      <p></p>
                    </div>
                  )}
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* <div className="border rounded p-4 text-slate-500 shadow-sm"> */}
          <Accordion type="single" collapsible className="mt-8 w-full rounded-lg border px-4">
            <AccordionItem value="item-1">
              <AccordionTrigger>
                {' '}
                <span className="text-slate-500">🔧 Developer Setup Instructions</span>
              </AccordionTrigger>
              <AccordionContent>
                <div className="text-slate-500">
                  <p className="mt-4 text-sm">
                    In order to test all functionalities locally, you have to:
                    <ol className="my-2 list-decimal space-y-2 pl-6">
                      <li>
                        Clone and configure{' '}
                        <Link
                          href="https://github.com/pleszkowicz/hardhat-smart-contract"
                          className="text-blue-600"
                          target="_blank"
                        >
                          pleszkowicz/hardhat-smart-contract <OpenInNewWindowIcon className="inline" />
                        </Link>{' '}
                      </li>
                      <li>Setup your environment variables as described in the repository documentation.</li>
                    </ol>
                  </p>
                  <p className="mt-4 text-sm">
                    Once you have running hardhat node locally, deploy smart-contract as described in{' '}
                    <Link
                      href="https://github.com/pleszkowicz/web3-wallet-connect/blob/main/README.md"
                      className="inline-block text-blue-600"
                      target="_blank"
                    >
                      readme <OpenInNewWindowIcon className="inline" />.
                    </Link>
                  </p>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </div>
    </CardLayout>
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
      className="flex w-full transform content-between justify-start text-lg transition-transform duration-500 hover:scale-105 hover:bg-accent"
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
    const blur = Math.random() > 0.5 ? 'blur-sm' : '';
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

        'relative aspect-square animate-fade-in overflow-hidden rounded-xl bg-gradient-to-br opacity-0'
      )}
    >
      <div className="absolute inset-0 opacity-20">
        {/* SVG animation or canvas-based animation */}
        <svg className="h-full w-full" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
          {generateRandomCircles(delay / 100)}
          {/* Additional animated elements */}
        </svg>
      </div>
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-2">
        <h3 className="font-bold text-white">{name}</h3>
        <p className="text-sm text-gray-300">{description}</p>
        <p className="mt-1 font-bold text-green-400">{price} ETH</p>
      </div>
    </div>
  );
};
