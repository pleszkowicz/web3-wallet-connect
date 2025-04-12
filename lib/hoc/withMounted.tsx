import { Loader } from '@/components/ui/loader';
import { useEffect, useState } from 'react';
import { JSX } from 'react/jsx-runtime';

export const withMounted = <P extends object>(WrappedComponent: (props: P) => JSX.Element) => {
  const WithMounted = (props: P) => {
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
      setIsMounted(true);
    }, []);

    if (!isMounted) {
      return <Loader>Loading...</Loader>;
    }

    return <WrappedComponent {...props} />;
  };

  return WithMounted;
};
