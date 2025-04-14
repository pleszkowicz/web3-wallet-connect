'use client';
import { createNftTokenUri } from '@/app/actions/createNftTokenUri';
import { deleteNftTokenUri } from '@/app/actions/deleteNftTokenUri';
import { NFT_MARKET_CONTRACT_ABI } from '@/const/nft-marketplace-abi';
import { NFT_MARKETPLACE_ADDRESS } from '@/const/nft-marketplace-address';
import { useMounted } from '@/hooks/useMounted';
import { Prisma } from '@/lib/generated/prisma';
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

  const handlesubmit = async ({ name, description, image }: Prisma.NftCreateInput) => {
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

      writeContract(
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
            router.push('/dashboard');
          },
          onError: (error) => {
            console.log('Failure during write contract', error);
            if (nftUriId) {
              deleteNftTokenUri({ id: nftUriId });
            }
          },
        }
      );
    } catch (error) {
      if (nftUriId) {
        deleteNftTokenUri({ id: nftUriId });
      }
      console.error('Error creating NFT:', error);
      toast({ title: 'Error creating NFT', description: 'Please try again later.', variant: 'destructive' });
    }
  };

  return (
    <CardLayout title="Create NFT" showBackButton>
      <Formik<Prisma.NftCreateInput>
        initialValues={{ name: '', description: '', image: '' }}
        onSubmit={handlesubmit}
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
            isSubmitting: {isSubmitting.toString()}
            <Button variant="default" className="w-full" type="submit" disabled={isSubmitting || isTransactionPending}>
              Create
            </Button>
          </Form>
        )}
      </Formik>
    </CardLayout>
  );
}
