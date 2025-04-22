import { useRouter } from 'next/navigation';
import { PropsWithChildren, useEffect } from 'react';
import { useAccount } from 'wagmi';

export const ProtectedRoute = ({ children }: PropsWithChildren) => {
  const { isConnected } = useAccount();
  const { push } = useRouter();

  useEffect(() => {
    if (!isConnected) {
      push('/');
    }
  }, [isConnected, push]);

  if (!isConnected) {
    return null;
  }

  return children;
};
