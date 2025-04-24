'use client';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { TransferForm } from '@/components/TransferForm';

export default function TransactionPage() {
  return (
    <ProtectedRoute>
      <TransferForm />
    </ProtectedRoute>
  );
}
