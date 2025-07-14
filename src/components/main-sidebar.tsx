'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
} from '@/components/ui/sidebar';
import { LayoutDashboard, MonitorPlay, ShieldAlert, PhonePulse } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from './ui/button';

const menuItems = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/wallboard', label: 'Wallboard', icon: MonitorPlay },
  { href: '/anomaly-detection', label: 'Anomaly Detection', icon: ShieldAlert },
];

export function MainSidebar() {
  const pathname = usePathname();

  return (
    <Sidebar collapsible="icon" className="border-r">
      <SidebarHeader className="p-2 flex items-center justify-center">
        <Button variant="ghost" size="icon" className="w-9 h-9 text-primary" asChild>
            <Link href="/">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                    <path d="M14.05 2a9 9 0 0 1 8 7.94"></path>
                    <path d="M14.05 6A5 5 0 0 1 18 10"></path>
                </svg>
                <span className="sr-only">Call Center Pulse</span>
            </Link>
        </Button>
        <h1 className="text-lg font-semibold tracking-tight ml-2 group-data-[collapsible=icon]:hidden">
          Call Center Pulse
        </h1>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {menuItems.map((item) => (
            <SidebarMenuItem key={item.href}>
              <SidebarMenuButton
                asChild
                isActive={pathname === item.href}
                tooltip={{ children: item.label }}
              >
                <Link href={item.href}>
                  <item.icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter>
        {/* Can add user profile or settings here later */}
      </SidebarFooter>
    </Sidebar>
  );
}
