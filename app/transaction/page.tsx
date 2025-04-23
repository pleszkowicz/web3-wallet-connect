'use client';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Transfer } from '@/components/Transfer';

export default function TransactionPage() {
  return (
    <ProtectedRoute>
      <Transfer />
    </ProtectedRoute>
  );
}
