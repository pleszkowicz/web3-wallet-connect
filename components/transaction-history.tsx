import { useEffect, useState } from 'react';
import { useAccount } from 'wagmi';
import { useTransactions } from '@/hooks/useTransactions';
import { formatEther } from 'viem';
import { useQueryClient } from '@tanstack/react-query';
import { shrotenAddress } from '@/Utils/shortenAddress';
import { Loader } from '@/components/ui/loader';

const TransactionHistory = () => {
  const { address, chain: currentChain } = useAccount();
  const [showTransactions, setShowTransactions] = useState<boolean>(true);
  const [chainId, setChainId] = useState(currentChain?.id);
  const queryClient = useQueryClient();

  const { data: transactions, error, isFetching } = useTransactions(address || '', { enabled: showTransactions });

  useEffect(() => {
    if (currentChain?.id !== chainId) {
      queryClient.invalidateQueries({ queryKey: ['transactions', address, currentChain?.id] });
      setChainId(currentChain?.id);
      setShowTransactions(false);
    }
  }, [address, chainId, currentChain?.id, queryClient]);

  if (isFetching) {
    return <Loader>Loading transactions...</Loader>;
  }

  if (error) {
    return (
      <p className="text-red-500">Fetching transactions failed: Please check your connection or try again later.</p>
    );
  }

  return (
    <div className="overflow-x-auto animate-in animate-bounce animate-fade-in max-h-[400px]">
      {showTransactions && transactions && transactions.length > 0 ? (
        <table className="text-sm min-w-full bg-white border border-gray-200">
          <thead className="sticky top-[0] z-10 bg-gray-100 shadow-md">
            <tr>
              <th className="py-2 px-4 border-b">Txn Hash</th>
              <th className="py-2 px-4 border-b">From</th>
              <th className="py-2 px-4 border-b">To</th>
              <th className="py-2 px-4 border-b">Time</th>
              <th className="py-2 px-4 border-b text-right">Value</th>
            </tr>
          </thead>
          <tbody className="text-slate-600">
            {transactions.map((tx) => (
              <tr key={tx.hash} className="hover:bg-gray-100">
                <td className="py-2 px-4 border-b">
                  {currentChain?.blockExplorers?.default.url ? (
                    <a
                      href={`${currentChain?.blockExplorers?.default.url}/tx/${tx.hash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:underline"
                    >
                      {shrotenAddress(tx.hash)}
                    </a>
                  ) : (
                    <span>{shrotenAddress(tx.hash)}</span>
                  )}
                </td>
                <td className="py-2 px-4 border-b">{shrotenAddress(tx.from)}</td>
                <td className="py-2 px-4 border-b">{shrotenAddress(tx.to)}</td>
                <td className="py-2 px-4 border-b">{new Date(parseInt(tx.timeStamp) * 1000).toLocaleString()}</td>
                <td className="py-2 px-4 border-b text-right whitespace-nowrap">
                    {tx.to && !!(tx.value > 0) && (tx.to === address ? '+' : '-')}
                    {formatEther(tx.value)} {currentChain?.nativeCurrency.symbol}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        !isFetching && showTransactions && <p className="text-muted-foreground">No transactions found.</p>
      )}
    </div>
  );
};

export default TransactionHistory;
