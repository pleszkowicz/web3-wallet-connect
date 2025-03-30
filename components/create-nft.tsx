'use client';
import { ErrorMessage, Field, Form, Formik } from 'formik';
import { Address } from 'viem';
import { useWriteContract } from 'wagmi';
import * as Yup from 'yup';
import { Input } from './ui/input';
import * as dotenv from 'dotenv';
import { NFT } from '@/types/NFT';
import { Button } from './ui/button';
import { NFT_MARKET_CONTRACT_ABI } from '@/const/nft-marketplace-abi';
import CardLayout from './card-layout';
import { useToast } from './ui/hooks/use-toast';
import { useRouter } from 'next/navigation';

dotenv.config();

type NFTMetadata = Omit<NFT, 'tokenId'>;

export function CreateNFT() {
  const { toast } = useToast();
  const router = useRouter();
  const { writeContract } = useWriteContract();
  const validationSchema: Yup.ObjectSchema<NFTMetadata> = Yup.object().shape({
    name: Yup.string().required('Name is required'),
    description: Yup.string().required('Description is required'),
    image: Yup.string().url('Must be a valid URL').required('Image URL is required'),
  });

  return (
    <CardLayout title="Create NFT" showBackButton>
      <Formik<NFTMetadata>
        initialValues={{ name: '', description: '', image: '' }}
        onSubmit={async (values) => {
          const tokenURIResponse = await fetch('/api/token-uri', {
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
          // get id from response
          const { tokenId } = await tokenURIResponse.json();
          const currentDomain = window.location.origin;
          const tokenURI = `${currentDomain}/api/token-uri/${tokenId}`;

          await writeContract(
            {
              address: process.env.NEXT_PUBLIC_CUSTOM_NFT_MARKETPLACE_SMART_CONTRACT_ADDRESS as Address,
              abi: NFT_MARKET_CONTRACT_ABI,
              functionName: 'createNFT',
              args: [tokenURI, BigInt(0.025 * 10 ** 18)],
              value: BigInt(0.025 * 10 ** 18),
            },
            {
              onSuccess: (tokenId) => {
                console.log('NFT created successfully');
                console.log('data', tokenId);

                toast({ title: 'NFT successfully created!' });
                router.push('/');
              },
              onError: (error) => {
                console.log('NFT creation failed');
                console.log('error', error);
              },
            }
          );
        }}
        validationSchema={validationSchema}
      >
        <Form className="space-y-4">
          <Field as={Input} id="name" name="name" placeholder="Name" />
          <ErrorMessage name="name" component="div" className="text-red-500" />

          <Field as={Input} id="description" name="description" placeholder="Description" />
          <ErrorMessage name="description" component="div" className="text-red-500" />

          <Field as={Input} id="image" name="image" placeholder="Image URL" />
          <ErrorMessage name="image" component="div" className="text-red-500" />

          <Button variant="default" className="w-full" type="submit">
            Create
          </Button>
        </Form>
      </Formik>
    </CardLayout>
  );
}
