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
    <div className="max-h-[400px] overflow-x-auto">
      {showTransactions && transactions && transactions.length > 0 ? (
        <table className="text-md min-w-full bg-gray-800">
          <thead className="text-md sticky top-[0] z-10 bg-gray-700 text-left text-slate-200 shadow-md">
            <tr>
              <th className="px-4 py-2">Txn Hash</th>
              <th className="px-4 py-2">From</th>
              <th className="px-4 py-2">To</th>
              <th className="px-4 py-2">Time</th>
              <th className="px-4 py-2 text-right">Value</th>
            </tr>
          </thead>
          <tbody className="text-md text-slate-200">
            {transactions.map((tx) => (
              <tr key={tx.hash} className="border-b-gray-600 hover:bg-gray-700">
                <td className="px-4 py-2">
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
                <td className="px-4 py-2">
                  {tx.category === 'erc721' && tx.from === zeroAddress ? (
                    <Badge className="bg-blue-500/80 px-2.5 py-0 text-xs text-white backdrop-blur-xs">
                      NFT&nbsp;Minted
                    </Badge>
                  ) : (
                    shrotenAddress(tx.from)
                  )}
                </td>
                <td className="px-4 py-2">
                  {tx.to === null ? <span className="text-xs">Smart contract deployment</span> : null}
                  {shrotenAddress(tx.to)}
                </td>
                <td className="px-4 py-2">{new Date(tx.metadata.blockTimestamp).toLocaleString()}</td>
                <td className="px-4 py-2 text-right">
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
