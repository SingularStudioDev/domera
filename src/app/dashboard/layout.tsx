"use client";

import { OrgMenuItems } from "@/lib/utils/MenuItems";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/dashboard/AppSidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-white">
        <AppSidebar menuItems={OrgMenuItems} />
        <main className="flex flex-1 flex-col overflow-auto bg-[#F5F5F5] p-6 pt-7">
          {children}
        </main>
      </div>
    </SidebarProvider>
  );
}
