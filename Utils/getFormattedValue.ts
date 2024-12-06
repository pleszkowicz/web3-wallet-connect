import { formatEther } from "viem"
import { GetBalanceData } from "wagmi/query"

export const getFormattedBalance = (balance?: Pick<GetBalanceData, 'value'> | bigint) => {
    return balance ? formatEther(typeof balance === 'bigint' ? balance : balance.value) : '0.00';
}
