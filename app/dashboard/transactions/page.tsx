import TransactionHistory from '@/components/transactions/TransactionHistory';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import Link from 'next/link';

export default function TransactionsPage() {
  return (
    <>
      <div className="space-y-4">
        <h3 className="text-xl font-semibold text-white">Transaction History</h3>
      </div>
      <TransactionHistory />
      <Button asChild variant="default" className="mt-5 mb-5 w-full">
        <Link href="/transfer">
          <Plus /> New transaction
        </Link>
      </Button>
    </>
  );
}
