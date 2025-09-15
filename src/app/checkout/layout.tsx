"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

import { useCheckoutStore } from "@/stores/checkoutStore";
import { ArrowLeft, ChevronDownIcon, AlertTriangle } from "lucide-react";
import { hasActiveOperationAction } from "@/lib/actions/operations";

import Footer from "@/components/Footer";
import Header from "@/components/header/Header";

import { CheckoutSteps } from "./_components/CheckoutSteps";
import { accordionItems } from "./page";

interface CheckoutLayoutProps {
  children: React.ReactNode;
}

export default function CheckoutLayout({ children }: CheckoutLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { currentProject } = useCheckoutStore();
  const [hasActiveOperation, setHasActiveOperation] = useState<boolean | null>(null);

  useEffect(() => {
    const checkActiveOperation = async () => {
      try {
        const result = await hasActiveOperationAction();
        const hasActive = result.success && result.data === true;
        setHasActiveOperation(hasActive);
        
        // If user has active operation and is trying to access checkout, redirect
        if (hasActive && pathname.startsWith('/checkout') && pathname !== '/checkout/success') {
          router.push('/userDashboard/shopping');
        }
      } catch (error) {
        console.log('Could not check active operation status');
        setHasActiveOperation(false);
      }
    };

    checkActiveOperation();
  }, [pathname, router]);

  // Show loading while checking operation status
  if (hasActiveOperation === null) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="border-primaryColor mx-auto h-8 w-8 animate-spin rounded-full border-b-2"></div>
          <p className="mt-2 text-gray-600">Verificando estado...</p>
        </div>
      </div>
    );
  }

  // If user has active operation, show redirect message
  if (hasActiveOperation && pathname.startsWith('/checkout') && pathname !== '/checkout/success') {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="mx-auto max-w-md p-8 text-center">
          <AlertTriangle className="mx-auto mb-4 h-16 w-16 text-yellow-500" />
          <h1 className="mb-2 text-2xl font-bold text-gray-900">
            Ya tienes una compra en proceso
          </h1>
          <p className="mb-4 text-gray-600">
            No puedes iniciar una nueva compra hasta que completes tu reserva actual.
          </p>
          <p className="text-sm text-gray-500">
            Redirigiendo a tus compras...
          </p>
        </div>
      </div>
    );
  }

  const getStep = () => {
    if (pathname === "/checkout") {
      return 1;
    }

    if (pathname === "/checkout/additional") {
      return 2;
    }

    if (pathname === "/checkout/confirmation") {
      return 3;
    }

    return 0;
  };

  return (
    <div className="min-h-screen bg-white">
      <Header />

      <main className="pt-28">
        <div className="w-full">
          <div className="container mx-auto flex flex-col items-start">
            {/* Back Button */}
            <Link
              href="/projects"
              className="text-primaryColor hover:text-primaryColor-hover inline-flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Volver
            </Link>

            {/* Title */}
            <h1 className="dashboard-title pt-4 pb-8">Operacion de compra </h1>
          </div>

          <div className="flex flex-col gap-10">
            <div className="container mx-auto flex w-full">
              <CheckoutSteps currentStep={getStep()} />

              <div className="flex w-full flex-col gap-10">
                <div className="relative">
                  <img
                    src={
                      currentProject?.heroImage || "/checkout-hero-fallback.png"
                    }
                    alt={currentProject?.name || "Proyecto"}
                    className="h-[229px] w-full rounded-3xl border border-gray-300 object-cover"
                  />

                  <h2 className="absolute top-3 left-3 rounded-2xl bg-white px-4 py-2 text-2xl font-semibold text-black">
                    {currentProject?.name || "Selecciona un proyecto"}
                  </h2>
                </div>
              </div>
            </div>

            {children}
          </div>
        </div>

        {/* Conditions Section */}
        <div className="mt-18 w-full rounded-t-3xl bg-gray-100 p-12">
          <div className="container mx-auto">
            <h2 className="mb-8 text-3xl font-bold text-black">Condiciones</h2>
            <div className="space-y-0">
              {accordionItems.map((item, index) => (
                <div
                  key={index}
                  className="hover:text-primaryColor flex cursor-pointer items-center justify-between border-b border-gray-300 py-4 text-black transition duration-300"
                >
                  <span className="text-lg font-bold">{item}</span>
                  <ChevronDownIcon className="h-5 w-5" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
