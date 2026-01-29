'use client';

import { Logo } from '@/components/logo';
import { UserNav } from '@/components/user-nav';
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarInset,
  SidebarTrigger,
  SidebarFooter,
  useSidebar,
} from '@/components/ui/sidebar';
import { useAuth as useAppAuth } from '@/hooks/use-auth';
import { cn } from '@/lib/utils';
import {
  Bot,
  Home,
  BookOpen,
  Rabbit,
  Bell,
  Tractor,
  Map,
  HeartPulse,
  Shield,
} from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useFirestore, useDoc, useMemoFirebase, useAuth } from '@/firebase';
import { doc } from 'firebase/firestore';

type UserProfile = {
  role: string;
};

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: Home },
  { href: '/education', label: 'Education', icon: BookOpen },
  { href: '/crops', label: 'Crop Tracking', icon: Tractor },
  { href: '/animals', label: 'Animal Tracking', icon: Rabbit },
  { href: '/animals/map', label: 'Animal Map', icon: Map },
  { href: '/ai-advisor', label: 'AI Advisor', icon: Bot },
  { href: '/farm-doctor', label: 'Farm Doctor', icon: HeartPulse },
  { href: '/reminders', label: 'Reminders', icon: Bell },
];

const adminNavItems = [{ href: '/admin', label: 'User Management', icon: Shield }];

function AuthenticatedLayoutContent({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { setOpenMobile } = useSidebar();
  const auth = useAuth();
  const firestore = useFirestore();

  const userProfileRef = useMemoFirebase(() => {
    if (!auth.currentUser?.uid || !firestore) return null;
    return doc(firestore, 'users', auth.currentUser.uid);
  }, [auth.currentUser?.uid, firestore]);

  const { data: userProfile } = useDoc<UserProfile>(userProfileRef);

  useEffect(() => {
    setOpenMobile(false);
  }, [pathname, setOpenMobile]);

  const handleNavigate = (href: string) => {
    router.push(href);
  };

  return (
    <>
      <Sidebar>
        <SidebarHeader>
          <Logo />
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            {navItems.map((item) => (
              <SidebarMenuItem key={item.href}>
                <SidebarMenuButton
                  isActive={pathname.startsWith(item.href) && item.href !== '/'}
                  className={cn(
                    'group-data-[collapsible=icon]:justify-center'
                  )}
                  onClick={() => handleNavigate(item.href)}
                  tooltip={{
                    children: item.label,
                    className: 'group-data-[collapsible=icon]:block hidden',
                  }}
                >
                  <item.icon />
                  <span>{item.label}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
            {userProfile?.role === 'admin' && (
              <>
                <SidebarMenuItem className="mt-4 mb-2">
                  <span className="px-2 text-xs font-semibold text-muted-foreground group-data-[collapsible=icon]:hidden">
                    Admin
                  </span>
                </SidebarMenuItem>
                {adminNavItems.map((item) => (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      isActive={pathname.startsWith(item.href)}
                      className={cn(
                        'group-data-[collapsible=icon]:justify-center'
                      )}
                      onClick={() => handleNavigate(item.href)}
                      tooltip={{
                        children: item.label,
                        className: 'group-data-[collapsible=icon]:block hidden',
                      }}
                    >
                      <item.icon />
                      <span>{item.label}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </>
            )}
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter>
          <UserNav />
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <header className="flex h-14 items-center justify-between border-b bg-card/80 px-4 backdrop-blur-sm sm:px-6 md:justify-end">
          <SidebarTrigger />
          <div className="hidden md:block">
            {/* Can add header content here if needed */}
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">{children}</main>
      </SidebarInset>
    </>
  );
}

export default function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAppAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/login');
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <div className="h-16 w-16 animate-spin rounded-full border-4 border-solid border-primary border-t-transparent"></div>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <AuthenticatedLayoutContent>{children}</AuthenticatedLayoutContent>
    </SidebarProvider>
  );
}
