'use client';
import * as React from 'react';
import { Connector, useConnect } from 'wagmi';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import Image from 'next/image';

export function WalletSelect() {
  const { connectors, connect, isPending } = useConnect();

  return (
    <Card className="w-[350px]">
      <CardHeader>
        <CardTitle>Connect Wallet</CardTitle>
        <CardDescription>Choose a wallet to connect to this app</CardDescription>
      </CardHeader>
      <CardContent>
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
      </CardContent>
    </Card>
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
        <Image src={connector.icon} alt="connector" width={20} height={20} className="w-[20px] h-[20px] mr-2" />
      )}
      <span>{connector.name}</span>
      {!ready && <span className="ml-auto">Unavailable</span>}
      {pending && <Loader2 className="ml-auto h-4 w-4 animate-spin" />}
    </Button>
  );
}
