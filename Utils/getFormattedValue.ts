import { formatEther } from "viem"
import { GetBalanceData } from "wagmi/query"

export const getFormattedBalance = (balance?: GetBalanceData) => {
    return balance ? formatEther(balance?.value) : '0.00';
}
