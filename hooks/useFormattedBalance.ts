import { formatEther } from "viem"

export const useFormattedBalance = (balance: bigint) => {
    const formattedBalance = balance && `${parseFloat(formatEther(balance.value)).toFixed(4)} ${balance.symbol}`

    return formattedBalance
}
