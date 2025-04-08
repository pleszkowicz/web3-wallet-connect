'use client';
import * as React from 'react';
import { Connector, useConnect } from 'wagmi';
import { Button } from '@/components/ui/button';
import { InfoIcon, Loader2 } from 'lucide-react';
import Image from 'next/image';
import { CardLayout } from './card-layout';
import Link from 'next/link';
import { OpenInNewWindowIcon } from '@radix-ui/react-icons';

export function WalletConnect() {
  const { connectors, connect, isPending } = useConnect();

  return (
    <CardLayout title="Connect Wallet" description="Welcome to the NFT Marketplace! Choose a wallet to connect to this app">
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

      <div className="border rounded p-4 text-slate-500 shadow-sm">
        <p className="flex items-center text-sm">
          <span className="inline-block text-lg mr-2">
            <InfoIcon display="inline" />
          </span>
          Setup instruction
        </p>
        <p className="mt-4 text-sm">
          In order to test all functionalities locally, you have to clone and configure{' '}
          <Link href="https://github.com/pleszkowicz/hardhat-smart-contract" className="text-blue-600" target="_blank">
            pleszkowicz/hardhat-smart-contract <OpenInNewWindowIcon className="inline" />
          </Link>{' '}
          and set up your environment variables as described in the repository documentation.
        </p>
        <p className="mt-4 text-sm">
          Once you have running hardhat node locally, deploy smart-contract as described in {' '}
          <Link
            href="https://github.com/pleszkowicz/web3-wallet-connect/blob/main/README.md"
            className="text-blue-600 inline-block"
            target="_blank"
          >
            readme <OpenInNewWindowIcon className="inline" />.
          </Link>
        </p>
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
      size="lg"
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
          className="w-[20px] h-[20px] mr-2 rounded-sm"
        />
      )}
      <span>{connector.name}</span>
      {!ready && <span className="ml-auto">Unavailable</span>}
      {pending && <Loader2 className="ml-auto h-4 w-4 animate-spin" />}
    </Button>
  );
}
