'use client';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { ConnectWallet } from '@/components/wallet/ConnectWallet';
import { DisconnectWallet } from '@/components/wallet/DisconnectWallet';
import { NetworkSwitch } from '@/components/wallet/NetworkSwitch';
import { useIsMobile } from '@/hooks/useMobile';
import { useMounted } from '@/hooks/useMounted';
import { ArrowLeft, CheckIcon, CopyIcon, ExternalLink, User, Wallet } from 'lucide-react';
import Link from 'next/link';
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
  const { isConnected } = useAccount();
  const mounted = useMounted();
  const { push } = useRouter();
  const isMobile = useIsMobile();

  if (!mounted) {
    return null;
  }

  return (
    <div className="min-h-screen w-full">
      <header className="sticky top-0 z-50 border-b border-gray-800 bg-gray-950/95 backdrop-blur-sm supports-backdrop-filter:bg-gray-950/80">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-4">
              {goBackUrl ? (
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-gray-400 hover:bg-gray-800 hover:text-white"
                  onClick={() => push(goBackUrl)}
                >
                  <ArrowLeft className="h-5 w-5" />
                </Button>
              ) : (
                <div className="h-5 w-5" /> // Placeholder for consistent spacing
              )}
              <div>
                <h1 className="text-xl font-semibold text-white">{title}</h1>
                <p className="text-sm text-gray-400">{description}</p>
              </div>
            </div>

            <div className="flex flex-row gap-2">
              {isConnected ? (
                <>
                  !isMobile && <WalletAddress />
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        size="icon"
                        className="text-gray-400 hover:bg-gray-800 hover:text-white"
                        variant="ghost"
                        data-testid="wallet-menu-button"
                      >
                        <User width={20} />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      align="end"
                      side="bottom"
                      className="border border-gray-700 bg-gray-800 shadow-lg"
                    >
                      <div>
                        <h3 className="my-4 text-center text-lg text-gray-200">Account</h3>

                        {isMobile && (
                          <>
                            <div className="flex flex-col items-center gap-4 p-4 pb-2">
                              <WalletAddress />
                            </div>
                          </>
                        )}
                      </div>

                      {/* <Separator className="bg-gray-700/50" /> */}

                      <div className="flex flex-col items-center justify-center gap-1 p-4 pt-2 pb-4">
                        <p className="text-xs text-gray-400">Network:</p>
                        <NetworkSwitch />
                      </div>

                      <Separator className="bg-gray-700/50" />

                      <div>
                        {/* <Separator className="bg-gray-700" /> */}

                        <Button
                          asChild
                          variant="ghost"
                          className="w-full rounded-none text-gray-400 hover:bg-gray-700 hover:text-white"
                        >
                          <Link href="/dashboard/tokens">
                            <span className="flex items-center gap-2">
                              <Wallet className="h-4 w-4" />
                              Dashboard
                            </span>
                          </Link>
                        </Button>
                        {/* <Separator className="bg-gray-700" /> */}

                        <DisconnectWallet className="flex w-full cursor-pointer gap-2 rounded-none text-gray-400 hover:bg-gray-700 hover:text-white" />
                      </div>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </>
              ) : (
                <ConnectWallet buttonSize="lg" variant="secondary" testId="connect-wallet-button-header" />
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl space-y-8 px-4 py-4 lg:px-8 lg:py-12">{children}</main>

      {/* <Card className="bg-gray-900 max-w-3xl w-full min-h-screen sm:min-h-[80vh]">
        <CardContent className="space-y-4">{children}</CardContent>
      </Card> */}
    </div>
  );
};

const WalletAddress = () => {
  const { address, chain: currentChain } = useAccount();
  const { data: ensName } = useEnsName({ address });
  const formattedAddress = ensName || address?.slice(0, 6) + '...' + address?.slice(-4);

  const [isAddressCopiedIconVisible, setIsAddressCopiedIconVisible] = useState(false);

  useEffect(() => {
    if (isAddressCopiedIconVisible) {
      const timer = setTimeout(() => {
        setIsAddressCopiedIconVisible(false);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [isAddressCopiedIconVisible]);

  return (
    <div className="flex items-center gap-2 rounded-full border border-gray-700 bg-gray-900 px-3 py-1.5">
      <Wallet className="h-4 w-4 text-orange-400" />
      <span className="font-mono text-sm text-gray-300">{formattedAddress}</span>

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
              onClick={() => window.open(`${currentChain?.blockExplorers?.default.url}/address/${address}`, '_blank')}
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
  );
};
