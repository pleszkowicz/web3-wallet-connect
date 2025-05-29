'use client';
import { ContentCard } from '@/components/ContentCard';
import { ContentLayout } from '@/components/ContentLayout';
import { Loader } from '@/components/ui/loader';
import { usePortfolio } from '@/context/PortfolioBalanceProvider';
import { ImagePlusIcon, LucideIcon, RefreshCw, SendIcon } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { PropsWithChildren, useEffect, useState } from 'react';
import { useConnect } from 'wagmi';

export function WalletDashboard({ children }: PropsWithChildren) {
  const { connectors } = useConnect();
  const [ready, setReady] = useState<{ [key: string]: boolean }>({});
  const { totalUsd, isLoading } = usePortfolio();

  useEffect(() => {
    connectors.forEach(async (connector) => {
      const provider = await connector.getProvider();
      setReady((prev) => ({ ...prev, [connector.id]: !!provider }));
    });
  }, [connectors]);

  const pathname = usePathname();

  // Tab routes and labels
  const tabLinks = [
    { href: '/dashboard/tokens', label: 'Tokens' },
    { href: '/dashboard/nfts', label: 'NFTs' },
    { href: '/dashboard/transactions', label: 'Transactions' },
  ];

  return (
    <ContentLayout title="Wallet Dashboard">
      <ContentCard className="p-8">
        <div className="flex flex-col justify-between gap-6 sm:flex-row lg:justify-between">
          <div className="flex flex-col justify-center sm:text-left">
            <p className="mb-2 text-sm text-gray-400">Total Portfolio Value</p>
            <h2 className="text-center text-4xl font-bold text-white">
              {isLoading ? <Loader size="sm" iconOnly /> : <span>≈${totalUsd.toFixed(2)}</span>}
            </h2>
            {/* <div className="flex items-center gap-2"> */}
            {/* <TrendingUp className="h-4 w-4 text-green-400" /> */}
            {/* <span className="text-green-400 font-medium">{portfolioChange}</span> */}
            {/* <span className="text-gray-400">({portfolioChangeValue}) today</span> */}
            {/* </div> */}
          </div>

          <div className="grid grid-cols-3 justify-items-center gap-4">
            <ActionLink bgColor="from-orange-500 to-pink-500" href="/nft/create" text="Mint NFT" Icon={ImagePlusIcon} />
            <ActionLink bgColor="from-blue-500 to-cyan-500" href="/exchange" text="Swap" Icon={RefreshCw} />
            <ActionLink bgColor="from-green-500 to-emerald-500" href="/transfer" text="Send" Icon={SendIcon} />
          </div>
        </div>
      </ContentCard>

      <div className="mt-8 grid w-full grid-cols-3 rounded-xl border border-gray-700 bg-gray-800 p-1 text-center">
        {tabLinks.map((tab) => {
          const isActive = pathname.startsWith(tab.href);
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`rounded-lg p-2 text-gray-400 hover:text-white ${isActive ? 'bg-gray-700 text-white' : ''}`}
              aria-current={isActive ? 'page' : undefined}
            >
              {tab.label}
            </Link>
          );
        })}
      </div>

      {children}
    </ContentLayout>
  );
}

type ActionLinkProps = PropsWithChildren & {
  href: string;
  bgColor: string;
  Icon: LucideIcon;
  text: string;
};

const ActionLink = ({ href, bgColor, Icon, text }: ActionLinkProps) => {
  return (
    <Link
      href={href}
      className={`h-20 w-20 rounded-xl bg-linear-to-br text-gray-200 lg:h-24 lg:w-24 ${bgColor} flex flex-col items-center justify-center border border-gray-800 shadow-lg transition-all duration-200 hover:scale-105 hover:text-white hover:shadow-xl`}
    >
      <span className="inline-block transform bg-transparent p-2 pt-0 transition-transform duration-300 group-hover:scale-[1.02]">
        <Icon className="h-6 w-6" />
      </span>
      <span className="text-xs font-medium">{text}</span>
    </Link>
  );
};
