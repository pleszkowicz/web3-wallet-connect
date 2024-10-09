import { useChainId } from "wagmi";
import { config } from "@/config/wagmiConfig";

export const useCurrentChain = () => {
  const { chains } = config
  const currentChainId = useChainId()

  return chains.find((chain) => chain.id === currentChainId)
}
