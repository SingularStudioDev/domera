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
import { LogOutIcon } from 'lucide-react';

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <Sidebar className="border-none bg-red-500">
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
                    className="py-5 text-base data-[active=true]:bg-[#0040FF] data-[active=true]:font-semibold data-[active=true]:text-white"
                  >
                    <Link
                      href={item.url}
                      className="flex items-center gap-3 px-4 py-4"
                    >
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="rounded-br-2xl border-r border-r-[#DCDCDC] bg-white">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="text-red-600 hover:bg-red-50 hover:text-red-700"
            >
              <Link href="/" className="flex items-center gap-3 px-4 py-2">
                <LogOutIcon className="h-4 w-4" />
                <span>Cerrar Sesión</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
