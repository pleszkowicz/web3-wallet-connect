'use client';
import { Connector, useConnect } from 'wagmi';
import { Button } from '@/components/ui/button';
import { Loader2, Wallet2 } from 'lucide-react';
import Image from 'next/image';
import { CardLayout } from './card-layout';
import Link from 'next/link';
import { OpenInNewWindowIcon } from '@radix-ui/react-icons';
import { useEffect, useState } from 'react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './ui/accordion';
import { cn } from '@/lib/utils';

export function WalletConnect() {
  const { connectors, connect, isPending } = useConnect();

  return (
    <CardLayout>
      <div>
        <h1 className="text-3xl md:text-4xl font-bold text-center">Welcome to the NFT Marketplace!</h1>
        <p className="text-gray-600 text-center text-lg">
          Welcome to the NFT Hub – Mint, Sell &amp; Discover Unique Digital Assets.
        </p>

        <div className="mb-10 p-4 bg-gray-50 rounded-xl mt-8">
          <h2 className="text-2xl font-bold text-center mb-6">Explore & Trade NFTs</h2>{' '}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <NftPlaceholder delay={300} />
            <NftPlaceholder delay={500} />
            <NftPlaceholder delay={700} />
          </div>
        </div>
      </div>

      <div className="flex items-center mb-4 pb-2">
        <Wallet2 className="mr-2 h-6 w-6 " />

        <h2 className="text-xl font-semibold text-slate-700">Choose a wallet to connect to this app:</h2>
      </div>
      <div className="grid gap-2">
        {connectors.map((connector) => (
          <WalletOption
            key={connector.id}
            connector={connector}
            onClick={() => connect({ connector })}
            pending={isPending}
          />
        ))}
      </div>

      {/* <div className="border rounded p-4 text-slate-500 shadow-sm"> */}
      <Accordion type="single" collapsible className="border rounded-lg px-4">
        <AccordionItem value="item-1">
          <AccordionTrigger>
            {' '}
            <span className="text-slate-500">🔧 Developer Setup Instructions</span>
          </AccordionTrigger>
          <AccordionContent>
            <div className="text-slate-500">
              <p className="mt-4 text-sm">
                In order to test all functionalities locally, you have to:
                <ol className="list-decimal pl-6 space-y-2 my-2">
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
                  className="text-blue-600 inline-block"
                  target="_blank"
                >
                  readme <OpenInNewWindowIcon className="inline" />.
                </Link>
              </p>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
      {/* </div> */}
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
      className="w-full justify-start flex content-between text-lg transform transition-transform duration-500 hover:scale-105 hover:bg-accent"
      disabled={!ready || pending}
      onClick={onClick}
    >
      {connector.icon && (
        <Image
          src={connector.icon.trimStart().trimEnd()}
          alt="connector"
          width={20}
          height={20}
          className="w-[20px] h-[20px] mr-2 rounded-sm"
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
  const prices = [0.01, 0.05, 0.1, 0.25, 0.5];
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

        'relative rounded-xl overflow-hidden bg-gradient-to-br aspect-square opacity-0 animate-fade-in'
      )}
    >
      <div className="absolute inset-0 opacity-20">
        {/* SVG animation or canvas-based animation */}
        <svg className="w-full h-full" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
          {generateRandomCircles(7)}
          {/* Additional animated elements */}
        </svg>
      </div>
      <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black to-transparent">
        <h3 className="text-white font-bold">{name}</h3>
        <p className="text-gray-300 text-sm">{description}</p>
        <p className="text-green-400 font-bold mt-1">{price} ETH</p>
      </div>
    </div>
  );
};
