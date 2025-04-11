'use client';
import NetworkSwitch from '@/components/network-switch';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useMounted } from '@/hooks/useMounted';
import { OpenInNewWindowIcon } from '@radix-ui/react-icons';
import { ArrowLeftIcon, CopyIcon } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ReactElement, ReactNode } from 'react';
import { useAccount, useEnsName } from 'wagmi';
import { DisconnectAccount } from './disconnect-account';
import { Button } from './ui/button';
import { useToast } from './ui/hooks/use-toast';
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip';

interface CardLayoutProps {
  title?: string;
  description?: ReactElement | string;
  headerContent?: ReactElement;
  showBackButton?: boolean;
  children: ReactNode;
}

export const CardLayout = ({ title, description, headerContent, showBackButton, children }: CardLayoutProps) => {
  const router = useRouter();
  const { toast } = useToast();
  const { address, chain: currentChain, isConnected } = useAccount();
  const { data: ensName } = useEnsName({ address });
  const formattedAddress = ensName || address?.slice(0, 6) + '...' + address?.slice(-4);
  const mounted = useMounted();

  if (!mounted) {
    return null;
  }

  return (
    <Card className="max-w-3xl w-full min-h-screen sm:min-h-[80vh]">
      <CardHeader>
        <div className="flex flex-row justify-between items-center relative">
          {showBackButton ? (
            <div className="flex items-center space-x-2 absolute left-0">
              <Button
                asChild
                variant="ghost"
                size="icon"
                onClick={() => router.push('/')}
                aria-label="Go back"
                className="p-1"
              >
                <Link href="/">
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
              <DisconnectAccount />
            </div>
          )}
        </div>

        {isConnected && (
          <div className="text-sm font-medium flex flex-row items-center justify-center">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  className="text-muted-foreground"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    navigator.clipboard.writeText(address as string);
                    toast({
                      title: 'Address copied!',
                    });
                  }}
                >
                  <span>{formattedAddress}</span>
                  <CopyIcon className="ml-2 w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Copy address to clipboard</p>
              </TooltipContent>
            </Tooltip>

            {currentChain?.blockExplorers?.default.url ? (
              <a
                href={`${currentChain?.blockExplorers?.default.url}/address/${address}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 hover:underline"
                title="Go to Explorer"
              >
                <OpenInNewWindowIcon />
              </a>
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
