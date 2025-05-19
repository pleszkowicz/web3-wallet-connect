'use client';
import { Loader } from '@/components/ui/loader';
import { useTransactions } from '@/hooks/useTransactions';
import { shrotenAddress } from '@/lib/shortenAddress';
import { useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { formatEther, parseEther, zeroAddress } from 'viem';
import { useAccount } from 'wagmi';
import { Badge } from './ui/badge';

const TransactionHistory = () => {
  const { address, chain: currentChain } = useAccount();
  const [showTransactions, setShowTransactions] = useState<boolean>(true);
  const [chainId, setChainId] = useState(currentChain?.id);
  const queryClient = useQueryClient();

  const {
    data: transactions,
    error,
    isFetching,
  } = useTransactions({ address, chainId }, { enabled: showTransactions });

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
    console.log('error', error);
    return (
      <p className="text-red-500">Fetching transactions failed: Please check your connection or try again later.</p>
    );
  }

  return (
    <div className="overflow-x-auto max-h-[400px]">
      {showTransactions && transactions && transactions.length > 0 ? (
        <table className="text-sm min-w-full bg-white border border-gray-200">
          <thead className="sticky top-[0] z-10 bg-gray-100 shadow-md">
            <tr>
              <th className="py-1 px-2 border-b">Txn Hash</th>
              <th className="py-1 px-2 border-b">From</th>
              <th className="py-1 px-2 border-b">To</th>
              <th className="py-1 px-2 border-b">Time</th>
              <th className="py-1 px-2 border-b text-right">Value</th>
            </tr>
          </thead>
          <tbody className="text-slate-600">
            {transactions.map((tx) => (
              <tr key={tx.hash} className="hover:bg-gray-100">
                <td className="py-1 px-2 border-b">
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
                <td className="py-1 px-2 border-b">
                  {tx.category === 'erc721' && tx.from === zeroAddress ? (
                    <Badge className="bg-blue-500/80 backdrop-blur-sm text-xs text-white px-2.5 py-0">
                      NFT&nbsp;Minted
                    </Badge>
                  ) : (
                    shrotenAddress(tx.from)
                  )}
                </td>
                <td className="py-1 px-2 border-b">
                  {tx.to === null ? <span className="text-xs">Smart contract deployment</span> : null}
                  {shrotenAddress(tx.to)}
                </td>
                <td className="py-1 px-2 border-b">{new Date(tx.metadata.blockTimestamp).toLocaleString()}</td>
                <td className="py-1 px-2 border-b text-right whitespace-nowrap">
                  {tx.to && !!(Number(tx.value) > 0) && (tx.to.toLowerCase() === address?.toLowerCase() ? '+' : '-')}
                  {tx.asset?.toLocaleLowerCase() === 'eth'
                    ? tx.value &&
                      formatEther(
                        parseEther(
                          String(
                            tx.value.toLocaleString('en-US', {
                              useGrouping: true,
                              maximumSignificantDigits: 18,
                            })
                          )
                        )
                      )
                    : tx.value}{' '}
                  <span>{tx.asset}</span>
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
