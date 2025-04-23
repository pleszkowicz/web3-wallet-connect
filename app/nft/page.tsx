'use client';
import { CardLayout } from '@/components/CardLayout';
import { ProtectedRoute } from '@/components/ProtectedRoute';

export default function TransactionPage() {
  return (
    <ProtectedRoute>
      <CardLayout title="All NFTs" description="List all of the marketplace NFTs" showBackButton>
        TODO: - list all NFTs from smart-contract.
      </CardLayout>
    </ProtectedRoute>
  );
}
