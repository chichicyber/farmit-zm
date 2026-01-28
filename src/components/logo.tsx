import Image from 'next/image';
import Link from 'next/link';
import { cn } from '@/lib/utils';

export function Logo({ className }: { className?: string }) {
  return (
    <Link
      href="/dashboard"
      className={cn('flex items-center gap-2 outline-none', className)}
    >
      <Image
        src="https://picsum.photos/seed/farmit-logo/200/80"
        width={125}
        height={50}
        alt="FarmIt-ZM Logo"
        data-ai-hint="farm logo"
      />
    </Link>
  );
}
