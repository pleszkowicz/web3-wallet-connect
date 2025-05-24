'use client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { DisconnectWallet } from '@/components/wallet/DisconnectWallet';
import { NetworkSwitch } from '@/components/wallet/NetworkSwitch';
import { useMounted } from '@/hooks/useMounted';
import { OpenInNewWindowIcon } from '@radix-ui/react-icons';
import { ArrowLeftIcon, CheckIcon, CopyIcon } from 'lucide-react';
import Link from 'next/link';
import { ReactElement, ReactNode, useEffect, useState } from 'react';
import { useAccount, useEnsName } from 'wagmi';

interface CardLayoutProps {
  title?: string;
  description?: ReactElement | string;
  headerContent?: ReactElement;
  goBackUrl?: string;
  children: ReactNode;
}

export const ContentLayout = ({ title, description, headerContent, goBackUrl, children }: CardLayoutProps) => {
  const { address, chain: currentChain, isConnected } = useAccount();
  const { data: ensName } = useEnsName({ address });
  const formattedAddress = ensName || address?.slice(0, 6) + '...' + address?.slice(-4);
  const mounted = useMounted();
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
    <Card className="max-w-3xl w-full min-h-screen sm:min-h-[80vh]">
      <CardHeader>
        <div className="flex flex-row justify-between items-center relative">
          {goBackUrl ? (
            <div className="flex items-center space-x-2 absolute left-0">
              <Button asChild variant="ghost" size="icon" aria-label="Go back" className="p-1">
                <Link href={goBackUrl}>
                  <ArrowLeftIcon className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          ) : (
            isConnected && (
              <div className="absolute left-0">
                <NetworkSwitch />
              </div>
            )
          )}

          <CardTitle className="flex-grow text-center text-lg">{title}</CardTitle>

          {isConnected && (
            <div className="absolute right-0">
              <DisconnectWallet />
            </div>
          )}
        </div>

        {isConnected && (
          <div className="text-sm font-medium flex flex-row items-center justify-center">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  className="text-muted-foreground bg-transparent hover:bg-transparent focus:bg-transparent focus-visible:ring-0 focus-visible:outline-none"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    navigator.clipboard.writeText(address as string);
                    setIsAddressCopiedIconVisible(true);
                  }}
                >
                  {isAddressCopiedIconVisible ? (
                    <>
                      <span>Address copied</span>
                      <CheckIcon className="ml-2 w-4 h-4" />
                    </>
                  ) : (
                    <>
                      <span>{formattedAddress}</span>
                      <CopyIcon className="ml-2 w-4 h-4" />
                    </>
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{isAddressCopiedIconVisible ? 'Copied!' : 'Copy to clipboard'}</p>
              </TooltipContent>
            </Tooltip>

            {currentChain?.blockExplorers?.default.url ? (
              <Tooltip>
                <TooltipTrigger asChild>
                  <a
                    href={`${currentChain?.blockExplorers?.default.url}/address/${address}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 hover:underline"
                  >
                    <OpenInNewWindowIcon />
                  </a>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Open in blockchain explorer</p>
                </TooltipContent>
              </Tooltip>
            ) : null}
          </div>
        )}

        {description && <CardDescription className="mt-12 text-muted-foreground">{description}</CardDescription>}
        {headerContent}
      </CardHeader>
      <CardContent className="space-y-4">{children}</CardContent>
      <CardFooter className="flex justify-end"></CardFooter>
    </Card>
  );
};
