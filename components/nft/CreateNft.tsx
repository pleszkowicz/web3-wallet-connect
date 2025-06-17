'use client';
import { createNftTokenUri } from '@/app/actions/createNftTokenUri';
import { deleteNftTokenUri } from '@/app/actions/deleteNftTokenUri';
import { ContentCard } from '@/components/ContentCard';
import { ContentLayout } from '@/components/ContentLayout';
import { NftListItemUI } from '@/components/nft/NftListItem';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FormError } from '@/components/ui/form/FormError';
import { FormInput } from '@/components/ui/form/FormInput';
import { useToast } from '@/components/ui/hooks/use-toast';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { NFT_MARKET_CONTRACT_ABI } from '@/const/nft-marketplace/nft-marketplace-abi';
import { NFT_MARKETPLACE_ADDRESS } from '@/const/nft-marketplace/nft-marketplace-address';
import { useMounted } from '@/hooks/useMounted';
import { Prisma } from '@/lib/generated/prisma';
import { shrotenAddress } from '@/lib/shortenAddress';
import { NftMeta } from '@/types/NFT';
import { Form, Formik } from 'formik';
import { AlertCircle, CheckCircle, Info, InfoIcon, Sparkles } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import invariant from 'tiny-invariant';
import { formatEther } from 'viem';
import { sepolia } from 'viem/chains';
import { useAccount, usePublicClient, useReadContract, useWriteContract } from 'wagmi';
import * as Yup from 'yup';

export function CreateNFT() {
  const { toast } = useToast();
  const router = useRouter();
  const [gasPrice, setGasPrice] = useState<bigint | undefined>(undefined);
  const { address, chain } = useAccount();
  const { data: listingPrice } = useReadContract({
    address: NFT_MARKETPLACE_ADDRESS,
    abi: NFT_MARKET_CONTRACT_ABI,
    functionName: 'listingPrice',
  });

  const client = usePublicClient();

  useEffect(() => {
    async function fetchGas() {
      const createNftPrice = await client?.estimateContractGas({
        account: address,
        address: NFT_MARKETPLACE_ADDRESS, // Quoter V2 on Sepolia
        abi: NFT_MARKET_CONTRACT_ABI,
        functionName: 'createNft',
        args: ['https://picsum.photos/536/354', listingPrice as bigint],
        value: listingPrice as bigint,
      });

      setGasPrice(createNftPrice);
    }

    if (listingPrice) {
      fetchGas();
    }
  }, [address, client, listingPrice]);

  const fakeTokenURI = 'https://picsum.photos/536/354';
  const price = listingPrice as bigint;

  // Local image state to avoid unnecessary computations when any of the form fields change
  const [imageUrl, setImageUrl] = useState('');

  const { writeContractAsync, isPending: isTransactionPending } = useWriteContract();
  const validationSchema: Yup.ObjectSchema<Pick<NftMeta, 'name' | 'description' | 'image'>> = Yup.object().shape({
    name: Yup.string().required('Name is required').max(64),
    description: Yup.string().required('Description is required').max(128),
    image: Yup.lazy((value: unknown) =>
      Yup.string()
        .required('Image URL is required')
        .url('Must be a valid URL')
        .test('is-image', 'URL must point to an image', async function (currentImage: string | undefined) {
          // TODO: apply debounce
          if (!currentImage || currentImage === imageUrl) {
            return true;
          }
          // const { valid } = await validateImageUrl(currentImage);
          setImageUrl(currentImage);
          return true;
        })
    ),
  });

  const mounted = useMounted();

  if (!mounted) {
    return null;
  }

  const handleSubmit = async ({ name, description, image }: Prisma.NftCreateInput) => {
    // we need token URI record  before confirming transaction
    // in case of failure, delete it in catch
    let nftUriId: NftMeta['id'] | undefined;

    try {
      const { nftUri, error } = await createNftTokenUri({
        name,
        description,
        image,
      });

      nftUriId = nftUri?.id;

      if (error || !nftUriId) {
        console.log('Error:', error);
        throw new Error('Nft ID is missing');
      }

      const currentDomain = globalThis?.location?.origin || '';
      const tokenURI = `${currentDomain}/api/token-uri/${nftUriId}`;

      invariant(listingPrice, 'listingPrice is not defined');

      const txHash = await writeContractAsync({
        address: NFT_MARKETPLACE_ADDRESS,
        abi: NFT_MARKET_CONTRACT_ABI,
        functionName: 'createNft',
        args: [tokenURI, listingPrice],
        value: listingPrice,
      });

      toast({
        title: 'NFT created',
        description: 'Waiting for confirmation on the blockchain.',
      });

      await client?.waitForTransactionReceipt({ hash: txHash });

      toast({ title: 'NFT confirmed on the blockchain!', testId: 'toast-nft-confirmed' });

      router.push('/dashboard/nfts');
    } catch (error) {
      if (nftUriId) {
        deleteNftTokenUri({ id: nftUriId });
      }

      if ((error as Error)?.message?.includes('User rejected the request')) {
        return;
      }
      console.error('Error creating NFT:', error);
      toast({ title: 'Error creating NFT', description: 'Please try again later.', variant: 'destructive' });
    }
  };

  return (
    <ContentLayout title="Create NFT" description="Mint your digital asset" goBackUrl="/dashboard/nfts">
      <Formik<Prisma.NftCreateInput>
        initialValues={{ name: '', description: '', image: '' }}
        onSubmit={handleSubmit}
        validationSchema={validationSchema}
      >
        {({ isSubmitting, values, isValid, errors }) => {
          const isImageLoading = values.image == '' || !isValidUrl(values.image) || !!errors['image'];

          return (
            <div className="grid gap-8 lg:grid-cols-3">
              <div className="lg:col-span-2">
                <ContentCard
                  title="NFT Details"
                  description="Provide information about your NFT"
                  badge={
                    <Badge className="border-amber-500/20 bg-amber-500/10 text-amber-600 hover:bg-amber-500/20">
                      ERC-721
                    </Badge>
                  }
                >
                  <Form className="space-y-6" aria-disabled={isSubmitting || isTransactionPending}>
                    <div className="space-y-2">
                      <Label htmlFor="image" className="flex-1 text-lg font-medium text-gray-400">
                        Image URL
                      </Label>
                      <div className="relative">
                        <FormInput
                          className="pr-10"
                          id="image"
                          name="image"
                          type="url"
                          placeholder="https://"
                          data-testid="image-input"
                        />
                        <div className="absolute inset-y-0 top-0 right-0 bottom-0 flex h-full items-center pr-3">
                          {imageUrl &&
                            (errors.image ? (
                              <AlertCircle className="h-4 w-4 text-red-400" />
                            ) : (
                              <CheckCircle className="h-4 w-4 text-green-400" />
                            ))}
                        </div>
                      </div>
                      <p className="text-xs text-gray-500">Supported formats: JPG, PNG, GIF, WebP. Max size: 10MB</p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="name" className="flex-1 text-lg font-medium text-gray-400">
                        Name *
                      </Label>
                      <FormInput id="name" name="name" data-testid="name-input" />
                      <FormError name="name" />
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>Choose a memorable name for your NFT</span>
                        <span className={values.name.length > 64 ? 'text-amber-400' : ''}>{values.name.length}/64</span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="description" className="flex-1 text-lg font-medium text-gray-400">
                        Description
                      </Label>
                      <FormInput id="description" name="description" data-testid="description-input" />
                      <FormError name="description" />
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>Provide a detailed description to attract collectors</span>
                        <span className={values.description.length > 128 ? 'text-amber-400' : ''}>
                          {values.description.length}/128
                        </span>
                      </div>
                    </div>

                    <Separator className="bg-gray-800" />

                    {/* Blockchain Info */}
                    <div className="rounded-lg border border-gray-800 bg-gray-800/50 p-4">
                      <h3 className="mb-3 flex items-center gap-2 text-sm font-medium text-white">
                        <Sparkles className="h-4 w-4 text-amber-400" />
                        Blockchain Details
                      </h3>
                      <div className="grid gap-3 sm:grid-cols-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-400">Network</span>
                          <span className="text-sm font-medium text-amber-600">{chain?.name}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-400">Gas Fee</span>
                          <span className={`text-sm font-medium text-amber-600`}>
                            {gasPrice && `${formatEther(gasPrice, 'gwei')} Gwei`}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-400">Estimated confirmation</span>
                          <span className="text-sm font-medium text-amber-600">
                            {chain?.id === sepolia.id ? '~30 seconds' : '~5 seconds'}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-400">Platform Fee</span>
                          <span className="flex items-center gap-1 text-sm font-medium text-amber-600">
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <InfoIcon className="inline-block h-4 w-4" />
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>
                                  There's a <b>{listingPrice && formatEther(listingPrice, 'wei')} ETH fee</b> to mint an
                                  NFT. Once it's created, you can set your own sale price.
                                </p>
                              </TooltipContent>
                            </Tooltip>{' '}
                            {listingPrice && formatEther(listingPrice)} ETH
                          </span>
                        </div>
                      </div>
                    </div>

                    <Button
                      data-testid="nft-submit-button"
                      variant="default"
                      className="w-full"
                      type="submit"
                      disabled={isSubmitting || isTransactionPending || !isValid}
                    >
                      <div className="flex items-center gap-2">
                        <Sparkles className="h-4 w-4" /> Mint NFT
                      </div>
                    </Button>
                  </Form>
                </ContentCard>
              </div>

              <div className="lg:col-span-1">
                <div className="sticky top-24">
                  <ContentCard className="space-y-4" title="Preview" description="How your NFT will appear">
                    <div className="relative">
                      <div className="absolute inset-0 z-10 cursor-default"></div>

                      <NftListItemUI
                        isPreview
                        tokenId={0n}
                        tokenDetailsError={null}
                        isLoading={isImageLoading}
                        tokenDetails={{
                          image: isValidUrl(values.image) ? values.image : '',
                          id: 'fake',
                          description: values.description,
                          createdAt: null,
                          name: values.name,
                        }}
                        isOwned={true}
                        isSaleApproved={false}
                        price={listingPrice}
                      />
                    </div>
                    {/* NFT Card Preview */}
                    <div className="rounded-lg border border-gray-800 bg-gray-800/50 p-4">
                      <div className="space-y-3">
                        <div>
                          <h4 className="truncate font-medium text-white">{values.name || 'Untitled NFT'}</h4>
                          <p className="text-sm text-gray-400">by {shrotenAddress(address)}</p>
                        </div>

                        {values.description && (
                          <p className="line-clamp-3 text-sm leading-relaxed text-gray-300">{values.description}</p>
                        )}

                        <div className="flex items-center justify-between border-t border-gray-700 pt-2">
                          <span className="text-xs text-gray-500">Token ID</span>
                          <span className="font-mono text-xs text-gray-400">#TBD</span>
                        </div>
                      </div>
                    </div>

                    {/* Status */}
                    <div className="rounded-lg border border-amber-500/20 bg-amber-500/10 p-3">
                      <div className="flex items-center gap-2">
                        <Info className="h-4 w-4 text-amber-400" />
                        <span className="text-sm font-medium text-amber-300">Ready to mint</span>
                      </div>
                      <p className="mt-1 text-xs text-amber-400/80">
                        Your NFT will be permanently stored on the blockchain
                      </p>
                    </div>
                  </ContentCard>
                </div>
              </div>
            </div>
          );
        }}
      </Formik>
    </ContentLayout>
  );
}

function isValidUrl(str: string): boolean {
  try {
    const url = new URL(str);
    return /^https?:/.test(url.protocol) && !!url.hostname.includes('.');
  } catch (_) {
    return false;
  }
}
