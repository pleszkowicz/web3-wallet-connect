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
        <div className="flex flex-col sm:flex-row justify-between lg:justify-between gap-6">
          <div className="flex flex-col justify-center text-center sm:text-left">
            <p className="text-sm text-gray-400 mb-2">Total Portfolio Value</p>
            <h2 className="text-4xl font-bold text-white">
              {isLoading ? <Loader iconOnly /> : `≈$${totalUsd.toFixed(2)}`}
            </h2>
            {/* <div className="flex items-center gap-2"> */}
            {/* <TrendingUp className="h-4 w-4 text-green-400" /> */}
            {/* <span className="text-green-400 font-medium">{portfolioChange}</span> */}
            {/* <span className="text-gray-400">({portfolioChangeValue}) today</span> */}
            {/* </div> */}
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-3 gap-4 justify-items-center">
            <ActionLink href="/nft/create" text="Mint NFT" Icon={ImagePlusIcon} />
            <ActionLink href="/exchange" text="Swap" Icon={RefreshCw} />
            <ActionLink href="/transfer" text="Send" Icon={SendIcon} />
          </div>
        </div>
      </ContentCard>

      <div className="grid w-full grid-cols-3 text-center bg-gray-800 border border-gray-700 p-1 rounded-xl">
        {tabLinks.map((tab) => {
          const isActive = pathname.startsWith(tab.href);
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`text-gray-400 hover:text-white rounded-lg p-2 ${isActive ? 'text-white bg-gray-700' : ''}`}
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

type ActionLinkProps = {
  href: string;
  Icon: LucideIcon;
  text: string;
};

const ActionLink = ({ href, Icon, text }: ActionLinkProps) => {
  return (
    <Link
      href={href}
      className="h-20 w-20 lg:h-24 lg:w-24 text-gray-200 rounded-xl bg-gray-800 hover:bg-orange-400 hover:text-white border border-gray-800 hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl flex flex-col items-center justify-center"
    >
      <span className="inline-block p-3 bg-transparent transform transition-transform duration-300 group-hover:scale-[1.02]">
        <Icon className="h-6 w-6" />
      </span>
      <span className="text-xs font-medium">{text}</span>
    </Link>
  );
};
