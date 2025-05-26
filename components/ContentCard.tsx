'use client';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { cn } from '@/lib/cn';
import { ComponentProps, ReactNode } from 'react';

type ContentCardProps = ComponentProps<typeof Card> & {
  title: string;
  description?: string;
  badge?: ReactNode;
};

export const ContentCard = ({ className, description, children, title, badge }: ContentCardProps) => {
  return (
    <Card className="border-gray-800 bg-gray-900 shadow-2xl">
      <CardHeader className="pb-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-white">{title}</h2>
            <p className="text-sm text-gray-400 mt-1">{description}</p>
          </div>
          {badge}
        </div>
      </CardHeader>

      <CardContent className={cn('space-y-6', className)}>{children}</CardContent>
    </Card>
  );
};
