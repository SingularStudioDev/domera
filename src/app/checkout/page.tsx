"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { useCheckoutStore } from "@/stores/checkoutStore";
import { formatCurrency } from "@/utils/utils";
import { BathIcon, BedIcon, RulerIcon, TrashIcon } from "lucide-react";
import { useSession } from "next-auth/react";

import MainButton from "@/components/custom-ui/MainButton";

export const accordionItems = [
  "Vigencia de la reserva",
  "Cancelación",
  "Costos",
  "Términos y condiciones",
  "Cláusulas",
  "Cancelación",
];

export default function CheckoutPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { items, removeItem } = useCheckoutStore();

  useEffect(() => {
    if (status === "loading") return;

    if (!session?.user) {
      router.push("/login?redirect=/checkout");
      return;
    }
  }, [session, status, router]);

  if (status === "loading") {
    return (
      <div className="w-full">
        <div className="flex w-full gap-16">
          <div className="w-1/3" />
          <div className="container mx-auto flex w-full flex-col items-center justify-center gap-10 py-20">
            <div className="text-center">
              <h2 className="mb-4 text-3xl font-bold text-black">
                Cargando...
              </h2>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!session?.user) {
    return null;
  }

  // Si no hay items en el checkout, mostrar mensaje vacío
  if (items.length === 0) {
    return (
      <div className="w-full">
        <div className="flex w-full gap-16">
          <div className="w-1/3" />
          <div className="container mx-auto flex w-full flex-col items-start justify-start gap-10 py-5">
            <div className="flex flex-col items-start justify-center text-left">
              <h2 className="mb-2 text-3xl font-bold text-black">
                Tu checkout está vacío
              </h2>
              <p className="mb-8 max-w-sm text-gray-600">
                Agrega unidades desde la página de proyectos para comenzar tu
                proceso compra
              </p>
              <MainButton href="/projects" showArrow className="w-fit">
                Ver proyectos
              </MainButton>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="container mx-auto flex w-full">
        <div className="w-1/3" />
        <div className="flex w-full flex-col justify-end gap-10">
          {items.map((cartItems) => (
            <div key={cartItems.id} className="flex gap-10">
              {/* Left Column - Main Image */}
              <div className="min-h-[350px] min-w-[350px]">
                <img
                  src={cartItems.image}
                  alt={cartItems.projectName}
                  className="h-[350px] w-[350px] rounded-3xl border border-gray-300 object-contain"
                />
              </div>

              <div className="flex max-h-[344px] w-full flex-col items-start justify-between">
                <div className="flex w-full flex-col gap-4">
                  <div className="flex w-full items-center justify-between">
                    <h1 className="text-4xl font-bold text-black">
                      {cartItems.unitTitle}
                    </h1>
                    <button
                      onClick={() => removeItem(cartItems.id)}
                      className="cursor-pointer"
                    >
                      <TrashIcon className="h-5 w-5" />
                    </button>
                  </div>

                  <div className="flex flex-col gap-2">
                    <div className="flex gap-4">
                      <div className="flex flex-1 items-center gap-4">
                        <BathIcon className="h-5 w-5 text-black" />
                        <span className="text-xl text-black">Baños:</span>
                        <span className="text-xl text-black">
                          {cartItems.bathrooms}
                        </span>
                      </div>
                    </div>

                    <div className="flex gap-4">
                      <div className="flex flex-1 items-center gap-4">
                        <BedIcon className="h-5 w-5 text-black" />
                        <span className="text-xl text-black">Dormitorios:</span>
                        <span className="text-xl text-black">
                          {cartItems.bedrooms}
                        </span>
                      </div>
                    </div>

                    <div className="flex gap-4">
                      <div className="flex flex-1 items-center gap-4">
                        <RulerIcon className="h-5 w-5 text-black" />
                        <span className="text-xl text-black">Edificados:</span>
                        <span className="text-xl text-black">
                          {cartItems.builtArea}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Price and Buy Button */}
                <div className="flex flex-col items-start justify-end gap-2">
                  <div className="flex gap-4">
                    <div className="flex flex-1 items-center gap-2">
                      <span className="text-xl text-black">Estreno:</span>
                      <span className="text-xl text-black">
                        {cartItems.completion}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-primaryColor text-lg font-bold">
                        Precio
                      </p>
                      <p className="text-primaryColor text-3xl font-bold">
                        {formatCurrency(cartItems.price)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {/* Total and Actions */}
          <div className="flex items-center gap-7">
            {items.length < 2 && (
              <MainButton href="/checkout/additional">
                Agregar otro item
              </MainButton>
            )}

            <MainButton href="/checkout/confirmation">
              Ir al boleto de reserva
            </MainButton>
          </div>
        </div>
      </div>
    </div>
  );
}
