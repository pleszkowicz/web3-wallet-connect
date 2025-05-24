'use client';
import { ContentLayout } from '@/components/ContentLayout';
import { ImagePlusIcon, LucideIcon, RefreshCw, SendIcon } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { PropsWithChildren, useEffect, useState } from 'react';
import { useConnect } from 'wagmi';

export function WalletDashboard({ children }: PropsWithChildren) {
  const { connectors } = useConnect();
  const [ready, setReady] = useState<{ [key: string]: boolean }>({});

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
    <ContentLayout
      title="Wallet Dashboard"
      headerContent={
        <p className="flex flex-row gap-6 justify-center pt-3">
          <ActionLink href="/nft/create" text="Mint NFT" Icon={ImagePlusIcon} />
          <ActionLink href="/exchange" text="Swap" Icon={RefreshCw} />
          <ActionLink href="/transfer" text="Send" Icon={SendIcon} />
        </p>
      }
    >
      <div className="flex flex-row mb-4 w-full border-b">
        {tabLinks.map((tab) => {
          const isActive = pathname.startsWith(tab.href);
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`text-center px-8 py-3 rounded-t-md font-medium transition-all ${
                isActive ? 'bg-gray-800 text-white' : 'text-gray-500 hover:text-gray-800'
              }`}
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
    <Link href={href} className="flex flex-col group items-center ">
      <span className="inline-block rounded-full p-3 bg-gray-800 dark:hover:bg-gray-100 transform transition-transform duration-300 group-hover:scale-110">
        <Icon size="16" color="white" />
      </span>
      <span className="block text-xs text-center mt-1">{text}</span>
    </Link>
  );
};
