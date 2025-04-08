'use client';
import * as React from 'react';
import { Connector, useConnect } from 'wagmi';
import { Button } from '@/components/ui/button';
import { InfoIcon, Loader2 } from 'lucide-react';
import Image from 'next/image';
import { CardLayout } from './card-layout';
import Link from 'next/link';

export function WalletConnect() {
  const { connectors, connect, isPending } = useConnect();

  return (
    <CardLayout title="Connect Wallet" description="Choose a wallet to connect to this app">
      <div className="grid gap-4">
        {connectors.map((connector) => (
          <WalletOption
            key={connector.id}
            connector={connector}
            onClick={() => connect({ connector })}
            pending={isPending}
          />
        ))}
      </div>
      <div className="mt-6 border rounded p-4 text-slate-600">
        <h2 className="flex items-center">
          <span className="inline-block h-6 w-6 mr-2">
            <InfoIcon display="inline" />
          </span>
          Additional note:
        </h2>
        <h3 className="mt-4">Welcome to the NFT Marketplace!</h3>
        <p>
          In order to test the functionality, you have to configure{' '}
          <Link href="https://github.com/pleszkowicz/hardhat-smart-contract" className="text-blue-800" target="_blank">
            pleszkowicz/hardhat-smart-contract
          </Link>.
        </p>
        <p>Once you have working hardhat node and deployed smart-contract, follow <Link href="https://github.com/pleszkowicz/web3-wallet-connect/blob/main/README.md" target="_blank">README.MD</Link></p>
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
  const [ready, setReady] = React.useState(false);

  React.useEffect(() => {
    (async () => {
      const provider = await connector.getProvider();
      setReady(!!provider);
    })();
  }, [connector]);

  return (
    <Button
      variant="outline"
      className="w-full justify-start flex content-between"
      disabled={!ready || pending}
      onClick={onClick}
    >
      {connector.icon && (
        <Image
          src={connector.icon.trimStart().trimEnd()}
          alt="connector"
          width={20}
          height={20}
          className="w-[20px] h-[20px] mr-2"
        />
      )}
      <span>{connector.name}</span>
      {!ready && <span className="ml-auto">Unavailable</span>}
      {pending && <Loader2 className="ml-auto h-4 w-4 animate-spin" />}
    </Button>
  );
}
