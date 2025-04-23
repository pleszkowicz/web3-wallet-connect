'use client';
import { CreateNFT } from '@/components/CreateNft';
import { ProtectedRoute } from '@/components/ProtectedRoute';

export default function TransactionPage() {
  return (
    <ProtectedRoute>
      <CreateNFT />
    </ProtectedRoute>
  );
}
