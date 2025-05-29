'use client';
import { Badge } from '@/components/ui/badge';
import { Loader } from '@/components/ui/loader';
import { useTransactions } from '@/hooks/useTransactions';
import { shrotenAddress } from '@/lib/shortenAddress';
import { useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { formatEther, parseEther, zeroAddress } from 'viem';
import { useAccount } from 'wagmi';

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
    return <Loader />;
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
        <table className="text-md min-w-full bg-gray-800">
          <thead className="sticky top-[0] z-10 text-left text-md bg-gray-700 text-slate-200 shadow-md">
            <tr>
              <th className="py-2 px-4">Txn Hash</th>
              <th className="py-2 px-4">From</th>
              <th className="py-2 px-4">To</th>
              <th className="py-2 px-4">Time</th>
              <th className="py-2 px-4 text-right">Value</th>
            </tr>
          </thead>
          <tbody className="text-md text-slate-200">
            {transactions.map((tx) => (
              <tr key={tx.hash} className="hover:bg-gray-700 border-b-gray-600">
                <td className="py-2 px-4">
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
                <td className="py-2 px-4">
                  {tx.category === 'erc721' && tx.from === zeroAddress ? (
                    <Badge className="bg-blue-500/80 backdrop-blur-xs text-xs text-white px-2.5 py-0">
                      NFT&nbsp;Minted
                    </Badge>
                  ) : (
                    shrotenAddress(tx.from)
                  )}
                </td>
                <td className="py-2 px-4">
                  {tx.to === null ? <span className="text-xs">Smart contract deployment</span> : null}
                  {shrotenAddress(tx.to)}
                </td>
                <td className="py-2 px-4">{new Date(tx.metadata.blockTimestamp).toLocaleString()}</td>
                <td className="py-2 px-4 text-right">
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
