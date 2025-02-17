'use client';
import { useDisconnect } from 'wagmi';
import { Button } from '@/components/ui/button';
import { PowerOff } from 'lucide-react';

type DisconnectAccountTypes = {
  className?: string;
}

export const DisconnectAccount = ({ className }: DisconnectAccountTypes) => {
  const { disconnect } = useDisconnect();

  return (
    <Button className={className} onClick={() => disconnect()} variant="ghost">
      <PowerOff width={20} />
    </Button>
  );
};
