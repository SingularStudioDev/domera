"use client";

import { FloatingSidebar } from "@/components/dashboard/FloatingSidebar";
import Footer from "@/components/Footer";
import Header from "@/components/header/Header";
import { DashboardUserMenuItems } from "@/components/header/headerItems";

export default function UserDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Header />

      <div className="container mx-auto min-h-screen w-full bg-white">
        {/* Custom floating sidebar */}
        <FloatingSidebar menuItems={DashboardUserMenuItems} />

        {/* Main content with left margin for sidebar */}
        <main className="ml-64 p-4 pr-0">{children}</main>
      </div>

      <Footer />
    </>
  );
}
