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
import { useAuth } from '@/hooks/use-auth';
import { cn } from '@/lib/utils';
import {
  Bot,
  Home,
  BookOpen,
  Rabbit,
  Bell,
  Tractor,
  Map,
} from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: Home },
  { href: '/education', label: 'Education', icon: BookOpen },
  { href: '/crops', label: 'Crop Tracking', icon: Tractor },
  { href: '/animals', label: 'Animal Tracking', icon: Rabbit },
  { href: '/animals/map', label: 'Animal Map', icon: Map },
  { href: '/ai-advisor', label: 'AI Advisor', icon: Bot },
  { href: '/reminders', label: 'Reminders', icon: Bell },
];

function AuthenticatedLayoutContent({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { setOpenMobile } = useSidebar();

  const handleNavigate = (href: string) => {
    router.push(href);
    setOpenMobile(false);
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
                  isActive={pathname === item.href}
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
  const { user, loading } = useAuth();
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
