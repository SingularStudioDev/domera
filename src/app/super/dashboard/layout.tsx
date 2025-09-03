"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { SuperAdminMenuItems } from "@/utils/MenuItems";

import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/dashboard/AppSidebar";

export default function SuperDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [userInfo, setUserInfo] = useState(null);

  useEffect(() => {
    const checkSession = async () => {
      try {
        const response = await fetch("/api/auth/super-admin/session-check");

        if (!response.ok) {
          router.push("/super");
          return;
        }

        const result = await response.json();
        setUserInfo(result.data);
      } catch {
        router.push("/super");
      } finally {
        setIsLoading(false);
      }
    };

    checkSession();
  }, [router]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
          <p className="mt-4 text-gray-600">
            Cargando panel de administración...
          </p>
        </div>
      </div>
    );
  }

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
