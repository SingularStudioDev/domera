"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { useCheckoutStore } from "@/stores/checkoutStore";
import { ArrowRight } from "lucide-react";

import { MaxUnitsModal } from "@/components/MaxUnitsModal";

interface BottomCTAProps {
  unit?: {
    id: string;
    projectId: string;
    projectName: string;
    unitId: string;
    unitTitle: string;
    image: string;
    bathrooms: number;
    bedrooms: number;
    builtArea: string;
    completion: string;
    price: number;
  };
}

const BottomCTA = ({ unit }: BottomCTAProps) => {
  const [isMaxUnitsModalOpen, setIsMaxUnitsModalOpen] = useState(false);
  const { addItem } = useCheckoutStore();
  const router = useRouter();

  const handleAddToCheckout = () => {
    if (!unit) {
      router.push("/checkout");
      return;
    }

    const result = addItem(unit);

    switch (result) {
      case "success":
        router.push("/checkout");
        break;
      case "already_exists":
        router.push("/checkout");
        break;
      case "different_project":
        alert("Solo puedes agregar unidades del mismo proyecto al checkout.");
        break;
      case "max_units_reached":
        setIsMaxUnitsModalOpen(true);
        break;
    }
  };

  return (
    <div className="mb-16 flex w-full items-center justify-center text-center">
      <button
        onClick={handleAddToCheckout}
        className="bg-primaryColor flex w-fit items-center justify-center rounded-full px-12 py-4 text-xl font-medium text-white transition-colors hover:bg-blue-700"
      >
        Comprar unidad
        <ArrowRight className="ml-2 h-5 w-5" />
      </button>

      <MaxUnitsModal
        isOpen={isMaxUnitsModalOpen}
        onClose={() => setIsMaxUnitsModalOpen(false)}
      />
    </div>
  );
};

export default BottomCTA;
