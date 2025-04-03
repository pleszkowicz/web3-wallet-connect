'use client';
import { ErrorMessage, Field, Form, Formik } from 'formik';
import { useWriteContract } from 'wagmi';
import * as Yup from 'yup';
import { Input } from './ui/input';
import * as dotenv from 'dotenv';
import { Button } from './ui/button';
import { NFT_MARKET_CONTRACT_ABI } from '@/const/nft-marketplace-abi';
import { CardLayout } from './card-layout';
import { useToast } from './ui/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { NftMeta } from '@/types/NFT';
import { NFT_MARKETPLACE_ADDRESS } from '@/const/nft-marketplace-address';

dotenv.config();

export function CreateNFT() {
  const { toast } = useToast();
  const router = useRouter();
  const { writeContract } = useWriteContract();
  const validationSchema: Yup.ObjectSchema<Pick<NftMeta, 'name' | 'description' | 'image'>> = Yup.object().shape({
    name: Yup.string().required('Name is required'),
    description: Yup.string().required('Description is required'),
    image: Yup.string().url('Must be a valid URL').required('Image URL is required'),
  });

  return (
    <CardLayout title="Create NFT" showBackButton>
      <Formik<Omit<NftMeta, 'tokenId'>>
        initialValues={{ name: '', description: '', image: '' }}
        onSubmit={async (values) => {
          try {
            const currentDomain = window.location.origin;
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
            
            const { tokenId } = await tokenURIResponse.json();
            const tokenURI = `${currentDomain}/api/token-uri/${tokenId}`;

            await writeContract(
              {
                address: NFT_MARKETPLACE_ADDRESS,
                abi: NFT_MARKET_CONTRACT_ABI,
                functionName: 'createNFT',
                args: [tokenURI, BigInt(0.025 * 10 ** 18)],
                value: BigInt(0.025 * 10 ** 18),
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
                  console.log('error', error);                },
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
          <Form className="space-y-4" aria-disabled={isSubmitting}>
            <Field as={Input} id="name" name="name" placeholder="Name" />
            <ErrorMessage name="name" component="div" className="text-red-500" />

            <Field as={Input} id="description" name="description" placeholder="Description" />
            <ErrorMessage name="description" component="div" className="text-red-500" />

            <Field as={Input} id="image" name="image" placeholder="Image URL" />
            <ErrorMessage name="image" component="div" className="text-red-500" />

            <Button variant="default" className="w-full" type="submit" disabled={isSubmitting}>
              Create
            </Button>
          </Form>
        )}
      </Formik>
    </CardLayout>
  );
}
