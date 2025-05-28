import { cn } from '@/lib/cn';

type LoaderProps = {
  iconOnly?: boolean;
  size?: 'sm' | 'md' | 'lg';
};

export const Loader = ({ iconOnly = false, size }: LoaderProps) => {
  if (iconOnly) {
    return <LoaderIcon size={size} />;
  }

  return (
    <span className="flex w-full justify-center">
      <LoaderIcon size={size} />
    </span>
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

  return <span className={cn('inline-block animate-spin rounded-full border-b-2 border-orange-400 mb-2', sizeClass)} />;
};
