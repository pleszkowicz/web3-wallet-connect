import { Loader } from '@/components/ui/loader';
import { useCallback, useEffect, useRef, useState } from 'react';
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

const useDebounce = (value: unknown, delay: number) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timoeutId = setTimeout(() => setDebouncedValue(value), delay);

    return clearTimeout(timoeutId);
  }, [delay, value]);

  return debouncedValue;
};

const useDebouncedCallback = <T extends (...args: unknown[]) => void>(callback: T, delay: number) => {
  const id = useRef<NodeJS.Timeout>(undefined);

  const debouncedCallback = useCallback(
    (...args: Parameters<T>) => {
      clearTimeout(id.current);
      id.current = setTimeout(() => {
        callback(...args);
      }, delay);
    },
    [callback, delay]
  );

  return debouncedCallback;
};
