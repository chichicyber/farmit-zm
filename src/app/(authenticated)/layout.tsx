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
  Rabbit,
  Bell,
  Tractor,
  Map,
  HeartPulse,
  Shield,
  BrainCircuit,
} from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useFirestore, useDoc, useMemoFirebase, useAuth } from '@/firebase';
import { doc } from 'firebase/firestore';
import { FcmHandler } from '@/components/fcm-handler';
import { useLanguage } from '@/contexts/language-context';
import { LanguageSwitcher } from '@/components/language-switcher';

type UserProfile = {
  role: string;
};

const navItems = [
  { href: '/dashboard', labelKey: 'nav.dashboard', icon: Home },
  { href: '/education', labelKey: 'nav.farmitSmart', icon: BrainCircuit },
  { href: '/crops', labelKey: 'nav.cropTracking', icon: Tractor },
  { href: '/animals', labelKey: 'nav.animalTracking', icon: Rabbit },
  { href: '/animals/map', labelKey: 'nav.animalMap', icon: Map },
  { href: '/reminders', labelKey: 'nav.reminders', icon: Bell },
  { href: '/ai-advisor', labelKey: 'nav.aiAdvisor', icon: Bot },
  { href: '/farm-doctor', labelKey: 'nav.farmDoctor', icon: HeartPulse },
];

const adminNavItems = [{ href: '/admin', labelKey: 'nav.userManagement', icon: Shield }];

function AuthenticatedLayoutContent({ children }: { children: React.ReactNode }) {
  const { t } = useLanguage();
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
  
  const isAdmin = userProfile?.role === 'admin' || auth.currentUser?.email === 'henrychemba@gmail.com';

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
                    children: t(item.labelKey),
                    className: 'group-data-[collapsible=icon]:block hidden',
                  }}
                >
                  <item.icon />
                  <span>{t(item.labelKey)}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
            {isAdmin && (
              <>
                <SidebarMenuItem className="mt-4 mb-2">
                  <span className="px-2 text-xs font-semibold text-muted-foreground group-data-[collapsible=icon]:hidden">
                    {t('nav.admin')}
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
                        children: t(item.labelKey),
                        className: 'group-data-[collapsible=icon]:block hidden',
                      }}
                    >
                      <item.icon />
                      <span>{t(item.labelKey)}</span>
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
        <header className="flex h-14 items-center justify-between border-b bg-card/80 px-4 backdrop-blur-sm sm:px-6">
          <SidebarTrigger />
          <div className="flex flex-1 items-center justify-end gap-2">
            <LanguageSwitcher />
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
      <FcmHandler />
    </SidebarProvider>
  );
}
