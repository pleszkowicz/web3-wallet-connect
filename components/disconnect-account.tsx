'use client';
import { Button } from '@/components/ui/button';
import { PowerOff } from 'lucide-react';
import { useDisconnect } from 'wagmi';
import { useToast } from './ui/hooks/use-toast';
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip';

type DisconnectAccountTypes = {
  className?: string;
};

export const DisconnectAccount = ({ className }: DisconnectAccountTypes) => {
  const { disconnectAsync: disconnect } = useDisconnect();
  const { toast } = useToast();

  async function handleDisconnect() {
    try {
      await disconnect();
    } catch (error) {
      console.error('Wallet disconnection failed', error);
      toast({ title: 'Wallet disconnection failed', description: 'Please try again later.', variant: 'destructive' });
    }
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button className={className} onClick={handleDisconnect} variant="ghost">
          <PowerOff width={20} />
        </Button>
      </TooltipTrigger>
      <TooltipContent>
        <p>Disconnect account</p>
      </TooltipContent>
    </Tooltip>
  );
};
