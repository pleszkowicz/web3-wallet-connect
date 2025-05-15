'use client';
import { usePathname, useRouter } from 'next/navigation';
import { PropsWithChildren, useEffect, useRef } from 'react';
import { useAccount } from 'wagmi';

export const ProtectedLayout = ({ children }: PropsWithChildren) => {
  const { status } = useAccount();
  const router = useRouter();

  const pathName = usePathname();

  const wasEverConnectingOrConnected = useRef(false);

  useEffect(() => {
    if (pathName === '/') {
      return; // Don't redirect if on the home page
    }

    if (status === 'connecting' || status === 'connected') {
      wasEverConnectingOrConnected.current = true;
    }

    if (status === 'disconnected' && wasEverConnectingOrConnected.current) {
      router.push('/'); // Redirect to home page
    }
  }, [pathName, status, router]);

  if (status === 'connecting' || status === 'reconnecting') {
    return (
      <div className="flex items-center justify-center h-screen">
        <span className="text-gray-500">Loading...</span>
      </div>
    );
  }

  if (status !== 'connected' && pathName !== '/') {
    return null;
  }

  return children;
};
