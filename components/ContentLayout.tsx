'use client';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { DisconnectWallet } from '@/components/wallet/DisconnectWallet';
import { useMounted } from '@/hooks/useMounted';
import { ArrowLeft, CheckIcon, CopyIcon, ExternalLink, Wallet } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { ReactElement, ReactNode, useEffect, useState } from 'react';
import { useAccount, useEnsName } from 'wagmi';

interface CardLayoutProps {
  title?: string;
  description?: ReactElement | string;
  goBackUrl?: string;
  children: ReactNode;
}

export const ContentLayout = ({ title, description, goBackUrl, children }: CardLayoutProps) => {
  const { address, chain: currentChain, isConnected } = useAccount();
  const { data: ensName } = useEnsName({ address });
  const formattedAddress = ensName || address?.slice(0, 6) + '...' + address?.slice(-4);
  const mounted = useMounted();
  const { push } = useRouter();

  const [isAddressCopiedIconVisible, setIsAddressCopiedIconVisible] = useState(false);

  useEffect(() => {
    if (isAddressCopiedIconVisible) {
      const timer = setTimeout(() => {
        setIsAddressCopiedIconVisible(false);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [isAddressCopiedIconVisible]);

  if (!mounted) {
    return null;
  }

  return (
    <div className="min-h-screen w-full">
      <header className="sticky top-0 z-50 border-b border-gray-800 bg-gray-950/95 backdrop-blur supports-[backdrop-filter]:bg-gray-950/80">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-4">
              {goBackUrl ? (
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-gray-400 hover:text-white hover:bg-gray-800"
                  onClick={() => push(goBackUrl)}
                >
                  <ArrowLeft className="h-5 w-5" />
                </Button>
              ) : (
                <div className="w-5 h-5" /> // Placeholder for consistent spacing
              )}
              <div>
                <h1 className="text-xl font-semibold text-white">{title}</h1>
                <p className="text-sm text-gray-400">{description}</p>
              </div>
            </div>

            {isConnected && (
              <div className="flex items-center gap-3">
                <div className="hidden sm:flex items-center gap-2 rounded-full bg-gray-800 border border-gray-700 px-3 py-1.5">
                  <Wallet className="h-4 w-4 text-orange-400" />
                  <span className="text-sm font-mono text-gray-300">{formattedAddress}</span>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-gray-400 hover:text-gray-600"
                        onClick={() => {
                          navigator.clipboard.writeText(address as string);
                          setIsAddressCopiedIconVisible(true);
                        }}
                      >
                        {isAddressCopiedIconVisible ? (
                          <CheckIcon className="h-4 w-4 text-green-500" />
                        ) : (
                          <CopyIcon className="h-4 w-4 text-gray-400" />
                        )}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{isAddressCopiedIconVisible ? 'Copied!' : 'Copy to clipboard'}</p>
                    </TooltipContent>
                  </Tooltip>

                  {currentChain?.blockExplorers?.default.url && (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 text-gray-400 hover:text-gray-600"
                          onClick={() =>
                            window.open(`${currentChain?.blockExplorers?.default.url}/address/${address}`, '_blank')
                          }
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Open in blockchain explorer</p>
                      </TooltipContent>
                    </Tooltip>
                  )}
                </div>
                <DisconnectWallet className="text-gray-400 hover:text-white hover:bg-gray-800" />
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-4 lg:py-12 lg:px-8 space-y-4">{children}</main>

      {/* <Card className="bg-gray-900 max-w-3xl w-full min-h-screen sm:min-h-[80vh]">
        <CardContent className="space-y-4">{children}</CardContent>
      </Card> */}
    </div>
  );
};
