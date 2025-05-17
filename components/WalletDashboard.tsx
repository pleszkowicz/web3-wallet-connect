'use client';
import TransactionHistory from '@/components/TransactionHistory';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import WalletBalanceItem from '@/components/WalletBalanceItem';
import { tokenMap } from '@/const/tokens';
import { ImagePlusIcon, LucideIcon, Plus, RefreshCw, SendIcon } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import invariant from 'tiny-invariant';
import { formatEther } from 'viem';
import { useAccount, useBalance, useConnect, useReadContract } from 'wagmi';
import { sepolia } from 'wagmi/chains';
import { ContentLayout } from './ContentLayout';
import { NftList } from './NftList';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';

export function WalletDashboard() {
  const { address, isConnected, chain } = useAccount();
  const { data: balance, isLoading: isBalanceLoading } = useBalance({ address });

  const { connectors, connect } = useConnect();
  const [ready, setReady] = useState<{ [key: string]: boolean }>({});

  useEffect(() => {
    connectors.forEach(async (connector) => {
      const provider = await connector.getProvider();
      setReady((prev) => ({ ...prev, [connector.id]: !!provider }));
    });
  }, [connectors]);

  const formattedBalance = balance && `${parseFloat(formatEther(balance.value)).toFixed(4)} ${balance.symbol}`;

  return (
    <ContentLayout
      title="Wallet Dashboard"
      headerContent={
        <p className="flex flex-row gap-6 justify-center pt-3">
          <ActionLink href="/nft/create" text="Create NFT" Icon={ImagePlusIcon} />
          <ActionLink href="/transfer" text="Send" Icon={SendIcon} />
          <ActionLink href="/exchange" text="Swap" Icon={RefreshCw} />
        </p>
      }
    >
      <WalletBalanceItem
        address={address}
        balance={formattedBalance}
        isLoading={isBalanceLoading}
        symbol={balance?.symbol}
        name="Ethereum"
      />
      {chain?.id === sepolia.id && <SepoliaLinkBalance />}

      <Separator />

      <Tabs defaultValue="nfts" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-4">
          <TabsTrigger value="nfts">NFTs</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
        </TabsList>
        <TabsContent value="nfts">
          <NftList />
          <Button asChild variant="default" className="w-full mt-5">
            <Link href="/nft/create">
              <Plus /> Mint new NFT
            </Link>
          </Button>
        </TabsContent>
        <TabsContent value="transactions">
          <TransactionHistory key={chain?.id} />
          <Button asChild variant="default" className="w-full mt-5 mb-5">
            <Link href="/transfer">
              <Plus /> New transaction
            </Link>
          </Button>
        </TabsContent>
      </Tabs>
      <Separator />
    </ContentLayout>
  );
}

export default function SepoliaLinkBalance() {
  const { address, isConnected } = useAccount();

  invariant(address, 'Address is required');

  const { data: balance, isLoading } = useReadContract({
    address: tokenMap.link.address,
    abi: tokenMap.link.abi,
    functionName: 'balanceOf',
    args: [address],
  });

  // Convert balance from token decimals
  const formattedBalance = balance ? formatEther(balance) : 'N/A';

  return (
    <div>
      {isConnected ? (
        <WalletBalanceItem
          address={address}
          balance={`${formattedBalance} ${tokenMap.link.symbol}`}
          isLoading={isLoading}
          name={tokenMap.link.label}
        />
      ) : (
        <p>Please connect your wallet to Sepolia</p>
      )}
    </div>
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
