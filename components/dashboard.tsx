'use client';
import TransactionHistory from '@/components/transaction-history';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import WalletBalanceItem from '@/components/wallet-balance-item';
import { SEPOLIA_LINK_CONTRACT_ADDRESS, SEPOLIA_LINK_TOKEN_ABI } from '@/const/sepolia';
import { ImagePlusIcon, LucideIcon, Plus, SendIcon } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import invariant from 'tiny-invariant';
import { formatEther } from 'viem';
import { useAccount, useBalance, useConnect, useReadContract } from 'wagmi';
import { sepolia } from 'wagmi/chains';
import { CardLayout } from './card-layout';
import { NftList } from './nft-list';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';

export function Dashboard() {
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

  if (isConnected) {
    const formattedBalance = balance && `${parseFloat(formatEther(balance.value)).toFixed(4)} ${balance.symbol}`;

    return (
      <CardLayout
        title="Wallet Dashboard"
        headerContent={
          <p className="flex flex-row gap-6 justify-center pt-3">
            <ActionLink href="/nft/create" text="Create NFT" Icon={ImagePlusIcon} />
            <ActionLink href="/transaction" text="Send" Icon={SendIcon} />
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
                <Plus /> Mint New NFT
              </Link>
            </Button>
          </TabsContent>
          <TabsContent value="transactions">
            <TransactionHistory key={chain?.id} />
            <Button asChild variant="default" className="w-full mt-5 mb-5">
              <Link href="/transaction">
                <Plus /> New transaction
              </Link>
            </Button>
          </TabsContent>
        </Tabs>
        <Separator />
      </CardLayout>
    );
  }

  return (
    <CardLayout title="Connect Wallet">
      <div className="grid gap-4">
        {connectors.map((connector) => (
          <Button
            key={connector.id}
            onClick={() => connect({ connector })}
            disabled={!ready[connector.id]}
            variant="outline"
          >
            {connector.name}
          </Button>
        ))}
      </div>
    </CardLayout>
  );
}

export default function SepoliaLinkBalance() {
  const { address, isConnected } = useAccount();

  invariant(address, 'Address is required');

  const { data: balance, isLoading } = useReadContract({
    address: SEPOLIA_LINK_CONTRACT_ADDRESS,
    abi: SEPOLIA_LINK_TOKEN_ABI,
    functionName: 'balanceOf',
    args: [address],
  });

  const { data: symbol } = useReadContract({
    address: SEPOLIA_LINK_CONTRACT_ADDRESS,
    abi: SEPOLIA_LINK_TOKEN_ABI,
    functionName: 'symbol',
  });

  const { data: name } = useReadContract({
    address: SEPOLIA_LINK_CONTRACT_ADDRESS,
    abi: SEPOLIA_LINK_TOKEN_ABI,
    functionName: 'name',
  });

  // Convert balance from token decimals
  const formattedBalance = balance ? formatEther(balance) : 'N/A';
  const formattedSymbol = String(symbol);

  return (
    <div>
      {isConnected ? (
        <WalletBalanceItem
          address={address}
          balance={`${formattedBalance} ${formattedSymbol}`}
          isLoading={isLoading}
          name={name}
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
