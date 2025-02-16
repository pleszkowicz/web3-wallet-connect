import { ReactNode } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import NetworkSwitch from '@/components/network-switch';
import { Button } from './ui/button';
import Link from 'next/link';
import { ArrowLeftIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { DisconnectAccount } from './disconnect-account';

interface CardLayoutProps {
  title: string;
  description?: string;
  showBackButton?: boolean;
  children: ReactNode;
}

export default function CardLayout({ title, description, showBackButton, children }: CardLayoutProps) {
  const router = useRouter();

  return (
    <Card className="max-w-[960px] w-full">
      <CardHeader className="flex-row justify-between items-center">
        <div className="flex items-center space-x-2">
          {showBackButton && (
            <Button
              asChild
              variant="ghost"
              size="icon"
              onClick={() => router.push('/')}
              aria-label="Go back"
              className="p-1"
            >
              <Link href="/">
                <ArrowLeftIcon className="h-4 w-4" />
              </Link>
            </Button>
          )}
          <CardTitle>{title}</CardTitle>
        </div>
        {description && <CardDescription>{description}</CardDescription>}
        <NetworkSwitch />
        <DisconnectAccount />
      </CardHeader>
      <CardContent className="space-y-4">{children}</CardContent>
    </Card>
  );
}
