"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function SuperDashboard() {
  const router = useRouter();
  const [isVerifying, setIsVerifying] = useState(true);

  useEffect(() => {
    const checkSession = async () => {
      try {
        const response = await fetch("/api/auth/super-admin/session-check");

        if (response.ok) {
          // Valid session, redirect to organizations page
          router.push("/super/dashboard/organizations");
        } else {
          // Invalid session, redirect to login
          router.push("/super");
        }
      } catch (error) {
        // Error checking session, redirect to login
        router.push("/super");
      } finally {
        setIsVerifying(false);
      }
    };

    checkSession();
  }, [router]);

  if (isVerifying) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
          <p className="mt-4 text-gray-600">Verificando sesión...</p>
        </div>
      </div>
    );
  }

  return null;
}
