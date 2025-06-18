import { ContentLayout } from '@/components/ContentLayout';
import { Loader } from '@/components/ui/loader';
import { PortfolioBalanceProvider } from '@/context/PortfolioBalanceProvider';
import dynamic from 'next/dynamic';

const LazyTokentransferForm = dynamic(
  () => import('@/components/TokenTransferForm').then((mod) => mod.TokenTransferForm),
  {
    loading: () => <Loader size="lg" />,
  }
);

export default function TransactionPage() {
  return (
    <PortfolioBalanceProvider>
      <ContentLayout title="Send" goBackUrl="/dashboard/tokens">
        <LazyTokentransferForm />
      </ContentLayout>
    </PortfolioBalanceProvider>
  );
}
