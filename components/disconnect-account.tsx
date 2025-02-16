'use client';
import { useDisconnect } from 'wagmi';
import { Button } from '@/components/ui/button';

export const DisconnectAccount = () => {
  const { disconnect } = useDisconnect();

  return (
    <Button onClick={() => disconnect()} variant="ghost">
      Disconnect
    </Button>
  );
};
