import { useEffect, useState } from 'react';
import { useAccount } from 'wagmi';
import { useTransactions } from "@/hooks/useTransactions";
import { formatEther } from "viem";
import { Button } from "@/components/ui/button";
import { useQueryClient } from "@tanstack/react-query";
import { ChevronDown, ChevronUp } from "lucide-react";

const TransactionHistory = () => {
  const { address, isConnected, chain: currentChain } = useAccount();
  const [showTransactions, setShowTransactions] = useState<boolean>(false)
  const [currentChainId, setCurrentChainId] = useState(currentChain?.id)
  const queryClient = useQueryClient();

  const {
    data: transactions,
    error,
    isFetching,
  } = useTransactions(address || '', { enabled: showTransactions });

  useEffect(() => {
    if (currentChain?.id !== currentChainId) {
      queryClient.invalidateQueries({ queryKey: ['transactions', address, currentChain?.id] });
      setCurrentChainId(currentChain?.id)
      setShowTransactions(false)
    }
  }, [currentChain?.id]);

  const handleFetchTransactions = async() => {
    if (!isConnected || !address) {
      return;
    }
    setShowTransactions((prevState) => !prevState)
  };

  return (
    <>
      <Button
        className="flex justify-between w-full"
        variant="ghost"
        disabled={isFetching}
        onClick={handleFetchTransactions}
      >
        <span>{showTransactions ? 'Hide Transactions' : 'Show Transactions '}</span>
        {showTransactions ? <ChevronUp className="ml-2 h-4 w-4"/> : <ChevronDown className="ml-2 h-4 w-4"/>}
      </Button>

      {error && <p className="text-red-500 mb-4">Error: {error.message}</p>}

      <div className="overflow-x-auto animate-in animate-bounce animate-fade-in">
        {showTransactions && transactions && transactions.length > 0 ? (
          <table className="text-sm min-w-full bg-white border border-gray-200">
            <thead>
              <tr>
                <th className="py-2 px-4 border-b">Txn Hash</th>
                <th className="py-2 px-4 border-b">Time</th>
                <th className="py-2 px-4 border-b">Value</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((tx) => (
                <tr key={tx.hash} className="hover:bg-gray-100">
                  <td className="py-2 px-4 border-b">
                    <a
                      href={`${currentChain?.blockExplorers?.default.url}/tx/${tx.hash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:underline"
                    >
                      {tx.hash.substring(0, 6)}...{tx.hash.substring(tx.hash.length - 4)}
                    </a>
                  </td>
                  <td className="py-2 px-4 border-b">
                    {new Date(parseInt(tx.timeStamp) * 1000).toLocaleString()}
                  </td>
                  <td className="py-2 px-4 border-b">
                    {formatEther(tx.value)} {currentChain?.nativeCurrency.symbol}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          !isFetching && showTransactions && <p className="text-xs text-muted-foreground">No transactions found.</p>
        )}
      </div>
    </>
  );
};

export default TransactionHistory;
