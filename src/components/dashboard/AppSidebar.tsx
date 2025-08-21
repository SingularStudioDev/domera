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
import { DoorOpenIcon, LucideProps } from 'lucide-react';
import { ForwardRefExoticComponent, RefAttributes } from 'react';

interface AppSidebarProps {
  menuItems: {
    title: string;
    url: string;
    icon: ForwardRefExoticComponent<
      Omit<LucideProps, 'ref'> & RefAttributes<SVGSVGElement>
    >;
  }[];
}

export function AppSidebar({ menuItems }: AppSidebarProps) {
  const pathname = usePathname();

  const isMenuItemActive = (itemUrl: string) => {
    const pathSegments = pathname.split('/').filter(Boolean);
    // const itemSegments = itemUrl.split('/').filter(Boolean);

    if (pathSegments.length === 3) {
      const pathWithoutId = `/${pathSegments.slice(0, 2).join('/')}`;
      return pathWithoutId === itemUrl;
    }

    return pathname === itemUrl;
  };

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
              {menuItems.map((item) => {
                const isActive = isMenuItemActive(item.url);

                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      className={`py-5 text-base transition-colors duration-300 ${isActive ? 'bg-primaryColor hover:bg-primaryColor-hover font-semibold text-white hover:text-white' : 'bg-transparent hover:bg-blue-50 hover:text-[#0004FF]'}`}
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
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="rounded-br-2xl border-r border-r-[#DCDCDC] bg-white px-5 pb-5">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="text-base text-black hover:bg-blue-50 hover:text-[#0004FF]"
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
