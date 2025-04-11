'use client';
import { useChainId, useSwitchChain } from 'wagmi';
import { config } from '@/config/wagmiConfig';
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip';

export default function NetworkSwitch() {
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
}
