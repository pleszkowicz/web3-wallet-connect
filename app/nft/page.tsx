'use client';
import { ContentLayout } from '@/components/ContentLayout';
import { ProtectedRoute } from '@/components/ProtectedRoute';

export default function TransactionPage() {
  return (
    <ProtectedRoute>
      <ContentLayout title="All NFTs" description="List all of the marketplace NFTs" showBackButton>
        TODO: - list all NFTs from smart-contract.
      </ContentLayout>
    </ProtectedRoute>
  );
}
