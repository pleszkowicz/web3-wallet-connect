'use client';
import { useDisconnect } from 'wagmi';
import { Button } from '@/components/ui/button';
import { PowerOff } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip';

type DisconnectAccountTypes = {
  className?: string;
};

export const DisconnectAccount = ({ className }: DisconnectAccountTypes) => {
  const { disconnect } = useDisconnect();

  return (
    <Tooltip>
      <TooltipTrigger>
        <Button className={className} onClick={() => disconnect()} variant="ghost">
          <PowerOff width={20} />
        </Button>
      </TooltipTrigger>
      <TooltipContent>
        <p>Disconnect account</p>
      </TooltipContent>
    </Tooltip>
  );
};
