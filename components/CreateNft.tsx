'use client';
import { createNftTokenUri } from '@/app/actions/createNftTokenUri';
import { deleteNftTokenUri } from '@/app/actions/deleteNftTokenUri';
import { validateImageUrl } from '@/app/actions/validateImageUrl';
import { NFT_MARKET_CONTRACT_ABI } from '@/const/nft-marketplace/nft-marketplace-abi';
import { NFT_MARKETPLACE_ADDRESS } from '@/const/nft-marketplace/nft-marketplace-address';
import { useMounted } from '@/hooks/useMounted';
import { Prisma } from '@/lib/generated/prisma';
import { NftMeta } from '@/types/NFT';
import { ErrorMessage, Field, Form, Formik } from 'formik';
import { InfoIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import invariant from 'tiny-invariant';
import { formatEther } from 'viem';
import { usePublicClient, useReadContract, useWriteContract } from 'wagmi';
import * as Yup from 'yup';
import { ContentLayout } from './ContentLayout';
import { NftListItemUI } from './NftListItem';
import { Button } from './ui/button';
import { useToast } from './ui/hooks/use-toast';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip';

export function CreateNFT() {
  const { toast } = useToast();
  const router = useRouter();
  const { data: listingPrice } = useReadContract({
    address: NFT_MARKETPLACE_ADDRESS,
    abi: NFT_MARKET_CONTRACT_ABI,
    functionName: 'listingPrice',
  });

  // Local image state to avoid unnecessary computations when any of the form fields change
  const [imageUrl, setImageUrl] = useState('');

  const { writeContractAsync, isPending: isTransactionPending } = useWriteContract();
  const client = usePublicClient();
  const validationSchema: Yup.ObjectSchema<Pick<NftMeta, 'name' | 'description' | 'image'>> = Yup.object().shape({
    name: Yup.string().required('Name is required'),
    description: Yup.string().required('Description is required'),
    image: Yup.lazy((value: unknown) =>
      Yup.string()
        .required('Image URL is required')
        .url('Must be a valid URL')
        .test('is-image', 'URL must point to an image', async function (currentImage: string | undefined) {
          // TODO: apply debounce
          if (!currentImage || currentImage === imageUrl) {
            return true;
          }
          const { valid } = await validateImageUrl(currentImage);
          setImageUrl(currentImage);
          return valid;
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

      toast({ title: 'NFT confirmed on the blockchain!' });

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
    <ContentLayout title="Mint NFT" showBackButton>
      <Formik<Prisma.NftCreateInput>
        initialValues={{ name: '', description: '', image: '' }}
        onSubmit={handleSubmit}
        validationSchema={validationSchema}
      >
        {({ isSubmitting, values, isValid, errors }) => {
          const isImageLoading = values.image == '' || !isValidUrl(values.image) || !!errors['image'];

          return (
            <div className="flex flex-col md:flex-row-reverse w-full gap-4 items-center border rounded-lg p-4">
              <div className="flex-1 opacity-90 relative">
                <div className="absolute inset-0 z-10 cursor-default"></div>

                <NftListItemUI
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

              <Form className="flex flex-col gap-4 w-1/2" aria-disabled={isSubmitting || isTransactionPending}>
                <div>
                  <Label htmlFor="image">NFT image URL</Label>
                  <Field as={Input} id="image" name="image" placeholder="https://.." />
                  <ErrorMessage name="image" component="div" className="text-red-500" />
                </div>

                <div>
                  <Label htmlFor="image">Name</Label>
                  <Field as={Input} id="name" name="name" placeholder="" />
                  <ErrorMessage name="name" component="div" className="text-red-500" />
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Field as={Input} id="description" name="description" placeholder="" />
                  <ErrorMessage name="description" component="div" className="text-red-500" />
                </div>

                <div>
                  <p className="text-sm my-2 text-muted-foreground">
                    NFT creation fee{' '}
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <InfoIcon className="inline-block" width={20} />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>NFT listing price can be updated after creation</p>
                      </TooltipContent>
                    </Tooltip>
                  </p>

                  <div className="flex items-center justify-start gap-2 bg-muted p-2 rounded-md">
                    <span className="text-sm">
                      <b>{listingPrice && formatEther(listingPrice)} ETH</b>
                    </span>
                  </div>
                </div>

                <Button
                  variant="default"
                  className="w-full"
                  type="submit"
                  disabled={isSubmitting || isTransactionPending || !isValid}
                >
                  Mint
                </Button>
              </Form>
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
