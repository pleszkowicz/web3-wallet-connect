'use client';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Copy, ExternalLink, RefreshCw, Shield, Tag } from 'lucide-react';
import Image from 'next/image';

export default function NFTDetailsPage() {
  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="max-w-2xl mx-auto bg-white rounded-xl overflow-hidden">
        {/* Header */}
        <div className="p-4 flex items-center justify-between bg-white text-gray-900">
          <Button variant="ghost" size="icon" className="text-gray-700">
            <ArrowLeft className="h-5 w-5" />
            <span className="sr-only">Back</span>
          </Button>

          <h1 className="text-xl font-medium">NFT details</h1>

          <Button variant="ghost" size="icon" className="text-gray-700">
            <RefreshCw className="h-5 w-5" />
            <span className="sr-only">Refresh</span>
          </Button>
        </div>

        {/* Contract Address */}
        <div className="px-4 py-2 flex items-center text-gray-500 text-sm bg-white">
          <span>0xf39F...2266</span>
          <Button variant="ghost" size="icon" className="h-6 w-6 ml-1 text-gray-500">
            <Copy className="h-4 w-4" />
            <span className="sr-only">Copy address</span>
          </Button>
        </div>

        {/* NFT Image with Overlay */}
        <div className="relative">
          <Image
            src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Screenshot%202025-04-11%20at%2013.56.37-wXEFHlpiowiDh6JNE3wAWDKDjWr9GM.png"
            alt="My NFT"
            width={800}
            height={800}
            className="w-full aspect-square object-cover"
          />

          {/* Overlay for NFT info */}
          <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
            <div className="flex flex-col gap-1">
              <h2 className="text-2xl font-bold text-white">My NFT</h2>
              <p className="text-gray-300">NFT description</p>

              <div className="flex items-center mt-2">
                <div className="bg-green-900/60 backdrop-blur-sm rounded-full p-1.5">
                  <Shield className="h-5 w-5 text-green-400" />
                </div>
              </div>

              <div className="flex items-center mt-2">
                <span className="text-2xl font-bold text-green-400">0.001 ETH</span>
                <Button variant="ghost" size="sm" className="h-6 px-1 text-green-400">
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* For Sale Badge */}
          <div className="absolute top-4 left-4">
            <Badge className="bg-blue-500/80 backdrop-blur-sm text-white px-2.5 py-1">
              <Tag className="h-3.5 w-3.5 mr-1" />
              For Sale
            </Badge>
          </div>
        </div>

        {/* Bottom Section - Token Info and Buttons */}
        <div className="bg-white text-gray-900 p-4">
          {/* Token Information */}
          <div className="mb-4">
            <h3 className="text-sm font-medium mb-2">Token Information</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Contract Address</span>
                <div className="flex items-center">
                  <span>0xf39F...2266</span>
                  <Button variant="ghost" size="sm" className="h-6 w-6 p-0 ml-1 text-gray-500">
                    <Copy className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-500">Token ID</span>
                <span>#1234</span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-500">Token Standard</span>
                <span>ERC-721</span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-500">Blockchain</span>
                <span>Ethereum</span>
              </div>
            </div>
          </div>

          <Separator className="my-4" />

          {/* Action Buttons */}
          <div className="space-y-3">
            <Button className="w-full bg-red-500 hover:bg-red-600 text-white">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Revoke from Sale
            </Button>

            <div className="flex gap-2">
              <Button variant="outline" className="flex-1 border-gray-200">
                Edit Price
              </Button>
              <Button variant="outline" className="flex-1 border-gray-200">
                Transfer
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
