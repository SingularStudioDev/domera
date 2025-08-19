'use client';

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Logo from '@/assets/Domera.svg';
import { menuItems } from '@/utils/MenuItems';
import { DoorOpenIcon } from 'lucide-react';

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <Sidebar className="border-none">
      <SidebarHeader className="rounded-tr-2xl border-r border-r-[#DCDCDC] bg-white">
        <Link href="/" className="flex items-center justify-center gap-2 pt-5">
          <Logo width={213} height={56} />
        </Link>
      </SidebarHeader>
      <SidebarContent className="border-r border-r-[#DCDCDC] bg-white">
        <SidebarGroup className="px-5">
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === item.url}
                    className="py-5 text-base data-[active=true]:bg-[#0040FF] hover:text-[#0004FF] hover:bg-blue-50 data-[active=true]:font-semibold data-[active=true]:text-white"
                  >
                    <Link
                      href={item.url}
                      className="flex items-center gap-3 px-4 py-4"
                    >
                      <item.icon className="h-4 w-4"/>
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="rounded-br-2xl px-5 pb-5 border-r border-r-[#DCDCDC] bg-white">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="text-black text-base hover:bg-blue-50 hover:text-[#0004FF]"
            >
              <Link href="/" className="flex items-center gap-3 px-4 py-2">
                <DoorOpenIcon className="h-4 w-4" />
                <span>Salir</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
