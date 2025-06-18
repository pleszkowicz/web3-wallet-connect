import { Loader } from '@/components/ui/loader';
import { PortfolioBalanceProvider } from '@/context/PortfolioBalanceProvider';
import dynamic from 'next/dynamic';

const LazyCreateNFT = dynamic(() => import('@/components/nft/CreateNft').then((mod) => mod.CreateNFT), {
  loading: () => <Loader size="lg" />,
});

export default function TransactionPage() {
  return (
    <PortfolioBalanceProvider>
      <LazyCreateNFT />
    </PortfolioBalanceProvider>
  );
}
