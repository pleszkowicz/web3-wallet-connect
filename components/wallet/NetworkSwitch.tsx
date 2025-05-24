'use client';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { config } from '@/config/wagmiConfig';
import { useChainId, useSwitchChain } from 'wagmi';

export const NetworkSwitch = () => {
  const { chains } = config;
  const { switchChain, isPending } = useSwitchChain();
  const chainId = useChainId();

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <select
          className={isPending ? 'animate-pulse' : ''}
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
      </TooltipTrigger>
      <TooltipContent>
        <p>Switch network</p>
      </TooltipContent>
    </Tooltip>
  );
};
