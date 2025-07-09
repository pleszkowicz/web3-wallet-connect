'use client';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { cn } from '@/lib/cn';
import { ComponentProps, ReactNode } from 'react';

type ContentCardProps = ComponentProps<typeof Card> & {
  variant?: 'default' | 'light';
  title?: string;
  description?: string;
  badge?: ReactNode;
};

export const ContentCard = ({
  className,
  description,
  children,
  title,
  badge,
  variant = 'default',
}: ContentCardProps) => {
  let variantClasses;
  switch (variant) {
    case 'light':
      variantClasses = 'border-gray-700 bg-gray-800';
      break;
    default:
      variantClasses = 'border-gray-800 bg-gray-900';
  }
  return (
    <Card className={cn('shadow-2xl', variantClasses)}>
      {(title || description || badge) && (
        <CardHeader className="pb-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-white">{title}</h2>
              <p className="mt-1 text-sm text-gray-400">{description}</p>
            </div>
            {badge}
          </div>
        </CardHeader>
      )}

      <CardContent className={cn('space-y-6', className)}>{children}</CardContent>
    </Card>
  );
};
