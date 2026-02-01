
import Image from 'next/image';
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
      <div className="relative flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 p-1">
        <Image
          src="https://drive.google.com/uc?export=download&id=1S-n9dfx1AvGfD0obORN3h9h5ztTgarNU"
          alt="Farmit-ZM Logo"
          fill
          className="object-contain"
        />
      </div>
      <div className="group-data-[collapsible=icon]:hidden">
        <h1 className="font-headline text-xl font-bold tracking-tight text-foreground">
          Farmit-ZM
        </h1>
      </div>
    </Link>
  );
}
