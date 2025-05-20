'use client';
import TransactionHistory from '@/components/TransactionHistory';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import Link from 'next/link';
import { useAccount } from 'wagmi';

export default function TransactionsPage() {
  const { chain } = useAccount();

  return (
    <>
      <TransactionHistory key={chain?.id} />
      <Button asChild variant="default" className="w-full mt-5 mb-5">
        <Link href="/transfer">
          <Plus /> New transaction
        </Link>
      </Button>
    </>
  );
}
