'use client';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/hooks/use-toast';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { PowerOff } from 'lucide-react';
import { useDisconnect } from 'wagmi';

type DisconnectAccountTypes = {
  className?: string;
};

export const DisconnectWallet = ({ className }: DisconnectAccountTypes) => {
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
          <span>Disconnect Wallet</span>
        </Button>
      </TooltipTrigger>
      <TooltipContent>
        <p>Disconnect</p>
      </TooltipContent>
    </Tooltip>
  );
};
