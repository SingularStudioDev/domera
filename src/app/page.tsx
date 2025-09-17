"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import Footer from "@/components/Footer";
import Header from "@/components/header/Header";
import Hero from "@/components/landing/Hero";
import Partners from "@/components/landing/Partners";
import Process from "@/components/landing/Process";
import Projects from "@/components/landing/Projects";
import { useAuth, useUserRole } from "@/hooks/useAuth";

export default function Home() {
  const { isAuthenticated, isLoading } = useAuth();
  const userRole = useUserRole();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      // Redirect authenticated users to their appropriate dashboard
      if (userRole === "admin") {
        router.push("/dashboard");
      } else if (["organization_owner", "sales_manager", "finance_manager", "site_manager"].includes(userRole)) {
        router.push("/dashboard");
      } else if (userRole === "professional") {
        router.push("/professionals/dashboard");
      } else {
        router.push("/userDashboard");
      }
    }
  }, [isAuthenticated, isLoading, userRole, router]);

  // Show loading state while checking auth
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  // Only show landing page for unauthenticated users
  if (isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Redirigiendo...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Header />

      <main>
        <Hero />
        <Partners />
        <Projects />
        <Process />
      </main>

      <Footer />
    </>
  );
}
