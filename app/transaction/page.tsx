'use client';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Transfer } from '@/components/transfer';

export default function TransactionPage() {
  return (
    <ProtectedRoute>
      <Transfer />
    </ProtectedRoute>
  );
}
