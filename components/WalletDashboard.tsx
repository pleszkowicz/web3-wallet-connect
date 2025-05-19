'use client';
import TransactionHistory from '@/components/TransactionHistory';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Token, tokenMap, tokens } from '@/const/tokens';
import { ImagePlusIcon, LucideIcon, Plus, RefreshCw, SendIcon } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import invariant from 'tiny-invariant';
import { useAccount, useBalance, useConnect, useReadContract } from 'wagmi';
import { ContentLayout } from './ContentLayout';
import { NftList } from './NftList';
import TokenBalance from './TokenBalance';
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

  const erc20tokens = useMemo(() => {
    return tokens.filter((token) => !!token.address);
  }, []);

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
      <Separator />

      <Tabs defaultValue="tokens" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-4">
          <TabsTrigger value="tokens">Tokens</TabsTrigger>
          <TabsTrigger value="nfts">NFTs</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
        </TabsList>

        <TabsContent value="tokens">
          <div className="flex flex-col gap-4">
            <TokenBalance balance={balance?.value} isLoading={isBalanceLoading} token={tokenMap.eth} />
            {erc20tokens.map((token) => (
              <ERC20TokenBalance key={token.symbol} token={token} />
            ))}
          </div>
        </TabsContent>

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
    </ContentLayout>
  );
}

type ERC20TokenBalanceProps = {
  token: Token;
};

export default function ERC20TokenBalance({ token }: ERC20TokenBalanceProps) {
  const { address, isConnected } = useAccount();

  invariant(address, 'Address is required');

  const { data: balance, isLoading } = useReadContract({
    address: token.address,
    abi: token.abi,
    functionName: 'balanceOf',
    args: [address],
    query: { enabled: !!token.address },
  });

  // Convert balance from token decimals
  return (
    <div>
      {isConnected ? (
        <TokenBalance token={token} balance={balance as bigint | undefined} isLoading={isLoading} />
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
