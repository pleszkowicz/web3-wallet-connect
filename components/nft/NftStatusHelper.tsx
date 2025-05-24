import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/cn';
import { ShieldCheck, Tag } from 'lucide-react';
import { JSX } from 'react';

type NftStatusHelperProps = {
  variant: 'owner' | 'for-sale';
  className?: string;
};

const variantMap: Record<NftStatusHelperProps['variant'], { colorClasses: string; icon: JSX.Element; text: string }> = {
  owner: {
    colorClasses: 'bg-green-100 text-green-800',
    icon: <ShieldCheck width={20} height={20} />,
    text: 'You are the owner',
  },
  'for-sale': {
    colorClasses: 'bg-blue-100 text-blue-700',
    icon: <Tag width={20} height={20} />,
    text: 'For sale',
  },
};

export const NftStatusHelper = ({ className, variant }: NftStatusHelperProps) => {
  const variantValues = variantMap[variant];

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div className={cn('p-1 rounded-full aspect-square object-cover', variantValues.colorClasses, className)}>
          {variantValues.icon}
        </div>
      </TooltipTrigger>
      <TooltipContent>
        <p>{variantValues.text}</p>
      </TooltipContent>
    </Tooltip>
  );
};
