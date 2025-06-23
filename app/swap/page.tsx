import { Loader } from '@/components/ui/loader';
import { PortfolioBalanceProvider } from '@/context/PortfolioBalanceProvider';
import dynamic from 'next/dynamic';

const LazyTokenSwap = dynamic(() => import('@/components/swap/TokenSwap').then((mod) => mod.TokenSwap), {
  loading: () => <Loader size="lg" />,
});

export default function TokenSwapPage() {
  return (
    <PortfolioBalanceProvider>
      <LazyTokenSwap />
    </PortfolioBalanceProvider>
  );
}
