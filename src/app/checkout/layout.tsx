'use client';

import { ArrowLeft, ChevronDownIcon } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { CheckoutSteps } from './_components/CheckoutSteps';
import { accordionItems } from './page';
import { unstable_addTransitionType } from 'react';
import { usePathname } from 'next/navigation';

interface CheckoutLayoutProps {
  children: React.ReactNode;
}

export default function CheckoutLayout({ children }: CheckoutLayoutProps) {
  // Datos del carrito (en una app real vendrian de un estado global)
  const pathname = usePathname();

  const getStep = () => {
    if (pathname === '/checkout') {
      return 1;
    }

    if (pathname === '/checkout/additional') {
      return 2;
    }

    if (pathname === '/checkout/confirmation') {
      return 3;
    }

    return 0;
  };

  const cartItems = {
    id: '1',
    projectName: 'Winks America',
    unitTitle: 'Unidad 604 - Piso 6',
    image: '/cart-unit-1-29f3e6.png',
    bathrooms: 2,
    bedrooms: 2,
    builtArea: '120m2',
    completion: 'Enero 2027',
    price: 190000,
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
              className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800"
            >
              <ArrowLeft className="h-4 w-4" />
              Volver
            </Link>

            {/* Title */}
            <h1 className="dashboard-title py-8">Operacion de compra </h1>
          </div>

          <div className="flex flex-col gap-10">
            <div className="container mx-auto flex w-full">
              <CheckoutSteps currentStep={getStep()} />

              <div className="flex w-full flex-col gap-10">
                <div className="relative">
                  <img
                    src="/pro-hero.png"
                    alt={cartItems.projectName}
                    className="h-[229px] w-full rounded-3xl border border-gray-300 object-cover"
                  />

                  <h2 className="absolute top-3 left-3 rounded-2xl bg-white px-4 py-2 text-3xl font-semibold text-black">
                    {cartItems.projectName}
                  </h2>
                </div>
              </div>
            </div>

            {children}
          </div>
        </div>

        {/* Conditions Section */}
        <div className="w-full rounded-t-3xl bg-gray-100 p-12">
          <div className="container mx-auto">
            <h2 className="mb-8 text-3xl font-bold text-black">Condiciones</h2>
            <div className="space-y-0">
              {accordionItems.map((item, index) => (
                <div
                  key={index}
                  className="flex cursor-pointer items-center justify-between border-b border-gray-300 py-4 text-black transition duration-300 hover:text-blue-600"
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
