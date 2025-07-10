'use client';
import { Button } from '@/components/ui/button';
import { DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Dialog } from '@radix-ui/react-dialog';
import { Loader2, Wallet2 } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Connector, useAccount, useConnect } from 'wagmi';

interface WalletOptionProps {
  buttonSize: 'lg' | 'xl';
  variant?: 'default' | 'secondary';
}

export function ConnectWallet({ buttonSize = 'lg', variant = 'default' }: WalletOptionProps) {
  const { connectors, connectAsync, isPending: isConnectionPending, isSuccess: isConnectionSuccess } = useConnect();
  const { isConnected } = useAccount();
  const { push } = useRouter();
  const [open, setIsOpen] = useState(false);

  const onConnectorSelect = async (connector: Connector) => {
    await connectAsync({ connector });
    setIsOpen(false);
    push('/dashboard');
  };

  if (isConnected) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={setIsOpen}>
      <DialogTrigger asChild onAbort={() => setIsOpen(false)}>
        <Button
          data-testid="connect-wallet-button"
          variant={variant}
          size={buttonSize}
          className="cursor-pointer"
          onClick={() => setIsOpen(true)}
        >
          <Wallet2 className="mr-2 h-6 w-6" />
          Connect your wallet
        </Button>
      </DialogTrigger>
      <DialogContent
        className="border-gray-700 bg-gray-900 text-white sm:max-w-[425px]"
        aria-describedby="dialog-content"
      >
        <DialogHeader>
          <DialogTitle>Please connect your wallet</DialogTitle>
        </DialogHeader>
        <DialogDescription asChild>
          <div className="mt-6 grid w-full gap-2">
            {connectors.length ? (
              connectors.map((connector) => (
                <WalletOption
                  key={connector.id}
                  connector={connector}
                  onClick={onConnectorSelect}
                  pending={isConnectionPending}
                />
              ))
            ) : (
              <div className="text-slate-700">
                <p>
                  Unfortunately, I <b>coud not find any crypto wallet</b> enabled in your browser. Once you install,
                  please try again.
                </p>
              </div>
            )}
          </div>
        </DialogDescription>
      </DialogContent>
    </Dialog>
  );
}

function WalletOption({
  connector,
  onClick,
  pending,
}: {
  connector: Connector;
  onClick: (connector: Connector) => void;
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
      data-testid={`connector-${connector.id}`}
      variant="outline"
      size="lg"
      className="flex w-full transform cursor-pointer content-between justify-start border-gray-600 bg-gray-700 text-lg text-white transition-transform duration-500 hover:scale-[1.01] hover:bg-gray-600 hover:text-white"
      disabled={!ready || pending}
      onClick={() => onClick(connector)}
    >
      {connector.icon && (
        <Image
          src={connector.icon.trimStart().trimEnd()}
          alt="connector"
          width={20}
          height={20}
          className="mr-2 h-[20px] w-[20px] rounded-sm"
        />
      )}
      <span>{connector.name}</span>
      {!ready && <span className="ml-auto">Unavailable</span>}
      {pending && <Loader2 className="ml-auto h-4 w-4 animate-spin" />}
    </Button>
  );
}
