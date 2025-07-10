'use client';
import { withMounted } from '@/lib/hoc/withMounted';
import dynamic from 'next/dynamic';

const LazyHomePage = dynamic(() => import('@/components/home-page/HomePage').then((module) => module.HomePage), {
  ssr: false,
});

function HomePage() {
  return <LazyHomePage />;
}

const HomePageWithMounted = withMounted(HomePage);

export default HomePageWithMounted;
