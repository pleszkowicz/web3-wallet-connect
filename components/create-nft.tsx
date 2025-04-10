'use client';
import { NFT_MARKET_CONTRACT_ABI } from '@/const/nft-marketplace-abi';
import { NFT_MARKETPLACE_ADDRESS } from '@/const/nft-marketplace-address';
import { useMounted } from '@/hooks/useMounted';
import { Nft } from '@/lib/generated/prisma';
import { NftMeta } from '@/types/NFT';
import { ErrorMessage, Field, Form, Formik } from 'formik';
import { useRouter } from 'next/navigation';
import invariant from 'tiny-invariant';
import { formatEther } from 'viem';
import { useReadContract, useWriteContract } from 'wagmi';
import * as Yup from 'yup';
import { CardLayout } from './card-layout';
import { Button } from './ui/button';
import { useToast } from './ui/hooks/use-toast';
import { Input } from './ui/input';

export function CreateNFT() {
  const { toast } = useToast();
  const router = useRouter();
  const { data: listingPrice } = useReadContract({
    address: NFT_MARKETPLACE_ADDRESS,
    abi: NFT_MARKET_CONTRACT_ABI,
    functionName: 'listingPrice',
  });
  const { writeContract, isPending: isTransactionPending } = useWriteContract();
  const validationSchema: Yup.ObjectSchema<Pick<NftMeta, 'name' | 'description' | 'image'>> = Yup.object().shape({
    name: Yup.string().required('Name is required'),
    description: Yup.string().required('Description is required'),
    image: Yup.string().url('Must be a valid URL').required('Image URL is required'),
  });
  const mounted = useMounted();

  if (!mounted) {
    return null;
  }

  return (
    <CardLayout title="Create NFT" showBackButton>
      <Formik<Omit<NftMeta, 'tokenId'>>
        initialValues={{ name: '', description: '', image: '' }}
        onSubmit={async (values) => {
          try {
            const currentDomain = typeof window !== 'undefined' ? window.location.origin : '';
            const tokenURIResponse = await fetch(`${currentDomain}/api/token-uri`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(values),
            });

            if (!tokenURIResponse.ok) {
              console.error('Failed to create NFT');
              return;
            }

            const { id } = (await tokenURIResponse.json()) as Nft;
            const tokenURI = `${currentDomain}/api/token-uri/${id}`;

            invariant(listingPrice, 'listingPrice is not defined');

            await writeContract(
              {
                address: NFT_MARKETPLACE_ADDRESS,
                abi: NFT_MARKET_CONTRACT_ABI,
                functionName: 'createNft',
                args: [tokenURI, listingPrice],
                value: listingPrice,
              },
              {
                onSuccess: (data) => {
                  console.log('NFT created successfully');
                  console.log('data', data);

                  toast({ title: 'NFT successfully created!' });
                  router.push('/');
                },
                onError: (error) => {
                  console.log('NFT creation failed');
                  console.log('error', error);
                },
              }
            );
          } catch (error) {
            console.error('Error creating NFT:', error);
            toast({ title: 'Error creating NFT', description: 'Please try again later.', variant: 'destructive' });
          }
        }}
        validationSchema={validationSchema}
      >
        {({ isSubmitting }) => (
          <Form className="space-y-4" aria-disabled={isSubmitting || isTransactionPending}>
            <Field as={Input} id="name" name="name" placeholder="Name" />
            <ErrorMessage name="name" component="div" className="text-red-500" />
            <Field as={Input} id="description" name="description" placeholder="Description" />
            <ErrorMessage name="description" component="div" className="text-red-500" />
            <Field as={Input} id="image" name="image" placeholder="Image URL" />
            <ErrorMessage name="image" component="div" className="text-red-500" />
            <div className="flex items-center justify-start gap-2 bg-muted p-2 rounded-md">
              <span className="text-sm">
                NFT creation price: <b>{listingPrice && formatEther(listingPrice)} ETH</b>
              </span>
            </div>
            <Button variant="default" className="w-full" type="submit" disabled={isSubmitting || isTransactionPending}>
              Create
            </Button>
          </Form>
        )}
      </Formik>
    </CardLayout>
  );
}
