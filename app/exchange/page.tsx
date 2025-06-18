import { Loader } from '@/components/ui/loader';
import { PortfolioBalanceProvider } from '@/context/PortfolioBalanceProvider';
import dynamic from 'next/dynamic';

const LazyTokenExchange = dynamic(() => import('@/components/swap/TokenExchange').then((mod) => mod.TokenExchange), {
  loading: () => <Loader size="lg" />,
});

export default function ExchangePage() {
  return (
    <PortfolioBalanceProvider>
      <LazyTokenExchange />
    </PortfolioBalanceProvider>
  );
}
