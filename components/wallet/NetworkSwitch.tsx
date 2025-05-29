'use client';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { config } from '@/config/wagmiConfig';
import { cn } from '@/lib/cn';
import { useChainId, useSwitchChain } from 'wagmi';

export const NetworkSwitch = () => {
  const { chains } = config;
  const { switchChain, isPending } = useSwitchChain();
  const chainId = useChainId();

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div className="flex text-gray-200">
          <select
            className={cn(
              'bg-gray-900 border border-gray-700 text-white hover:bg-gray-600 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500',
              isPending ? 'animate-pulse' : ''
            )}
            onChange={(event) => event.target.value && switchChain({ chainId: parseInt(event.target.value) })}
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
