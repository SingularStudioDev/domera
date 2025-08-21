'use client';

import { SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/dashboard/AppSidebar';
import {  SuperAdminMenuItems } from '@/utils/MenuItems';

export default function SuperDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-white">
        <AppSidebar menuItems={SuperAdminMenuItems} />

        <main className="flex flex-1 flex-col overflow-auto bg-[#F5F5F5] p-6 pt-7">
          {children}
        </main>
      </div>
    </SidebarProvider>
  );
}
