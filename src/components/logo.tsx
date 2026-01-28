import { Leaf } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

export function Logo({ className }: { className?: string }) {
  return (
    <Link
      href="/dashboard"
      className={cn('flex items-center gap-2 outline-none', className)}
    >
      <div className="rounded-full bg-primary p-2">
        <Leaf className="h-5 w-5 text-primary-foreground" />
      </div>
      <span className="text-xl font-bold font-headline text-foreground">
        FarmIt-ZM
      </span>
    </Link>
  );
}
