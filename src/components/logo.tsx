import { Leaf } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

export function Logo({ className }: { className?: string }) {
  return (
    <Link
      href="/dashboard"
      className={cn(
        'flex items-center gap-2 text-lg font-bold text-primary outline-none',
        'group-data-[collapsible=icon]:justify-center',
        className
      )}
    >
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
        <Leaf className="h-6 w-6 text-primary" />
      </div>
      <div className="group-data-[collapsible=icon]:hidden">
        <h1 className="font-headline text-xl font-bold tracking-tight text-foreground">
          FarmIt-ZM
        </h1>
      </div>
    </Link>
  );
}
