'use client';
import { useToast } from '@/components/ui/hooks/use-toast';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/cn';
import { ChangeEvent } from 'react';
import { useChainId, useSwitchChain } from 'wagmi';

export const NetworkSwitch = () => {
  const { chains, switchChain, isPending } = useSwitchChain();
  const { toast } = useToast();
  const chainId = useChainId();

  const onChainChange = async (event: ChangeEvent<HTMLSelectElement>) => {
    const chainId = parseInt(event.target.value);
    if (!chainId) {
      return;
    }

    try {
      switchChain({ chainId });
    } catch (err) {
      toast({
        title: 'Network change failed',
        description: 'Please refresh the application to reconnect to the previous one',
        variant: 'destructive',
      });
    }
  };

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div className="flex text-gray-200">
          <select
            className={cn(
              'rounded-lg border border-gray-700 bg-gray-900 px-4 py-2 text-white hover:bg-gray-600 focus:ring-2 focus:ring-blue-500 focus:outline-hidden',
              isPending ? 'animate-pulse' : ''
            )}
            onChange={onChainChange}
            value={chainId}
            disabled={isPending}
          >
            {chains.map((chain) => (
              <option key={chain.id} value={chain.id}>
                {chain.name}
              </option>
            ))}
          </select>
        </div>
      </TooltipTrigger>
      <TooltipContent>
        <p>Switch network</p>
      </TooltipContent>
    </Tooltip>
  );
};
