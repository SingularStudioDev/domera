"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import Footer from "@/components/Footer";
import Header from "@/components/header/Header";

export default function EditProjectLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkSession = async () => {
      try {
        const response = await fetch("/api/auth/super-admin/session-check");

        if (!response.ok) {
          router.push("/super");
          return;
        }
      } catch (error) {
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
          <p className="mt-4 text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  // Layout sin sidebar - pantalla completa
  return (
    <div className="min-h-screen w-full bg-white">
      <Header />
      <main className="w-full">{children}</main>
      <Footer />
    </div>
  );
}
