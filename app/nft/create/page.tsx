'use client';
import { CreateNFT } from '@/components/create-nft';
import { ProtectedRoute } from '@/components/ProtectedRoute';

export default function TransactionPage() {
  return (
    <ProtectedRoute>
      <CreateNFT />
    </ProtectedRoute>
  );
}
