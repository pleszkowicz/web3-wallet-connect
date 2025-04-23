"use client"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowRightIcon, RefreshCwIcon } from "lucide-react"

const cryptos = [
  { value: "btc", label: "Bitcoin (BTC)" },
  { value: "eth", label: "Ethereum (ETH)" },
  { value: "bnb", label: "Binance Coin (BNB)" },
  { value: "sol", label: "Solana (SOL)" },
  { value: "ada", label: "Cardano (ADA)" },
]

export function CryptoExchange() {
  const [fromCrypto, setFromCrypto] = useState("")
  const [toCrypto, setToCrypto] = useState("")
  const [amount, setAmount] = useState("")
  const [gasFee, setGasFee] = useState("0.0025") // Simulated gas fee

  const handleExchange = () => {
    // Here you would implement the actual exchange logic
    console.log(`Exchanging ${amount} ${fromCrypto} to ${toCrypto}`)
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Cross-Chain Crypto Exchange</CardTitle>
        <CardDescription>Swap your crypto across different blockchains</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="from-crypto">From</Label>
          <Select value={fromCrypto} onValueChange={setFromCrypto}>
            <SelectTrigger id="from-crypto">
              <SelectValue placeholder="Select crypto" />
            </SelectTrigger>
            <SelectContent>
              {cryptos.map((crypto) => (
                <SelectItem key={crypto.value} value={crypto.value}>
                  {crypto.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="amount">Amount</Label>
          <Input
            id="amount"
            placeholder="0.00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
        </div>
        <div className="flex justify-center">
          <ArrowRightIcon className="text-muted-foreground" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="to-crypto">To</Label>
          <Select value={toCrypto} onValueChange={setToCrypto}>
            <SelectTrigger id="to-crypto">
              <SelectValue placeholder="Select crypto" />
            </SelectTrigger>
            <SelectContent>
              {cryptos.map((crypto) => (
                <SelectItem key={crypto.value} value={crypto.value}>
                  {crypto.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Estimated Gas Fee</Label>
          <div className="flex items-center justify-between bg-muted p-2 rounded-md">
            <span>{gasFee} ETH</span>
            <Button variant="ghost" size="sm" onClick={() => setGasFee((Math.random() * 0.01).toFixed(4))}>
              <RefreshCwIcon className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button className="w-full" onClick={handleExchange}>
          Exchange
        </Button>
      </CardFooter>
    </Card>
  )
}
