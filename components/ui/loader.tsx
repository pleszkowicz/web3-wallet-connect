import { cn } from '@/lib/cn';
import { Loader2 } from 'lucide-react';

type LoaderProps = {
  iconOnly?: boolean;
  size?: 'sm' | 'md' | 'lg';
};

export const Loader = ({ iconOnly = false, size }: LoaderProps) => {
  if (iconOnly) {
    return <LoaderIcon size={size} />;
  }

  return (
    <div className="flex justify-center">
      <LoaderIcon size={size} />
    </div>
  );
};

const LoaderIcon = ({ size = 'md' }: Pick<LoaderProps, 'size'>) => {
  let sizeClass;
  switch (size) {
    case 'sm':
      sizeClass = 'w-4 h-4';
      break;
    case 'lg':
      sizeClass = 'w-12 h-12';
      break;
    default:
      sizeClass = 'w-8 h-8';
  }

  return <Loader2 className={cn('animate-spin text-gray-400 inline-block', sizeClass)} />;
};
