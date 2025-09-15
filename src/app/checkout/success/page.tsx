"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { CheckCircle } from "lucide-react";

import MainButton from "@/components/custom-ui/MainButton";

export default function CheckoutSuccessPage() {
  const router = useRouter();

  useEffect(() => {
    // Redireccionar al dashboard después de 5 segundos
    const timer = setTimeout(() => {
      router.push("/userDashboard/shopping");
    }, 5000);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="container mx-auto flex w-full min-h-[60vh] items-center justify-center">
      <div className="text-center max-w-md">
        {/* Success Icon */}
        <div className="mb-8 flex justify-center">
          <div className="flex h-24 w-24 items-center justify-center rounded-full bg-green-100">
            <CheckCircle className="h-12 w-12 text-green-600" />
          </div>
        </div>

        {/* Success Message */}
        <div className="mb-8">
          <h1 className="mb-4 text-3xl font-semibold text-gray-900">
            ¡Formulario enviado exitosamente!
          </h1>
          <p className="leading-relaxed text-gray-600 mb-4">
            Hemos recibido tu solicitud de compra. La desarrolladora revisará tus 
            datos y te enviará el boleto de reserva para ser firmado digitalmente.
          </p>
          <p className="text-sm text-gray-500">
            Serás redirigido a tus compras en unos segundos...
          </p>
        </div>

        {/* Action Button */}
        <MainButton 
          href="/userDashboard/shopping"
          variant="fill"
          showArrow
        >
          Ver mis compras
        </MainButton>
      </div>
    </div>
  );
}