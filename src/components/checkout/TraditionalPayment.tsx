"use client";

import { useState } from "react";

import { AlertTriangle } from "lucide-react";

import MainButton from "@/components/custom-ui/MainButton";

import { Card, CardContent } from "../ui/card";

interface TraditionalPaymentProps {
  onPaymentInitiated: (paymentData: TraditionalPaymentData) => void;
  onError: (error: string) => void;
  propertyData?: {
    id: string;
    title: string;
    price: string;
    location: string;
  };
  disabled?: boolean;
}

export interface TraditionalPaymentData {
  method: "bank_transfer" | "credit_card" | "other";
  amount: string;
  reference?: string;
}

export function TraditionalPayment({
  onPaymentInitiated,
  onError,
  propertyData,
  disabled = false,
}: TraditionalPaymentProps) {
  const [selectedMethod, setSelectedMethod] =
    useState<TraditionalPaymentData["method"]>("bank_transfer");
  const [isProcessing, setIsProcessing] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  const handlePaymentSubmit = async () => {
    if (!acceptedTerms) {
      onError("Debes aceptar los términos y condiciones");
      return;
    }

    if (!propertyData) {
      onError("Datos de propiedad no disponibles");
      return;
    }

    setIsProcessing(true);

    try {
      // Generate a reference number for the payment
      const reference = `DOM-${Date.now()}-${propertyData.id.slice(0, 4).toUpperCase()}`;

      const paymentData: TraditionalPaymentData = {
        method: selectedMethod,
        amount: "200",
        reference,
      };

      // Simulate processing delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      onPaymentInitiated(paymentData);
    } catch (error) {
      console.error("Error processing traditional payment:", error);
      onError(error instanceof Error ? error.message : "Error desconocido");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Payment method selection */}
      <div>
        <h5 className="mb-3 font-medium text-gray-900">Método de Pago</h5>
        <div className="space-y-3">
          <label className="flex items-center">
            <input
              type="radio"
              name="payment-method"
              value="bank_transfer"
              checked={selectedMethod === "bank_transfer"}
              onChange={(e) =>
                setSelectedMethod(
                  e.target.value as TraditionalPaymentData["method"],
                )
              }
              className="text-primaryColor focus:ring-primaryColor mr-3 h-4 w-4 cursor-pointer"
            />
            <span className="text-sm">Transferencia Bancaria</span>
          </label>

          <label className="flex items-center">
            <input
              type="radio"
              name="payment-method"
              value="credit_card"
              checked={selectedMethod === "credit_card"}
              onChange={(e) =>
                setSelectedMethod(
                  e.target.value as TraditionalPaymentData["method"],
                )
              }
              className="text-primaryColor focus:ring-primaryColor mr-3 h-4 w-4 cursor-pointer"
            />
            <span className="text-sm">Tarjeta de Crédito</span>
          </label>

          <label className="flex items-center">
            <input
              type="radio"
              name="payment-method"
              value="other"
              checked={selectedMethod === "other"}
              onChange={(e) =>
                setSelectedMethod(
                  e.target.value as TraditionalPaymentData["method"],
                )
              }
              className="text-primaryColor focus:ring-primaryColor mr-3 h-4 w-4 cursor-pointer"
            />
            <span className="text-sm">Otro (Coordinar con Domera)</span>
          </label>
        </div>
      </div>

      <Card className="border-amber-300 bg-amber-50">
        <CardContent className="p-4">
          <div className="flex items-start flex-col gap-2">
            <span className="font-semibold">Pago Tradicional</span>
            Serás redirigido a nuestro procesador de pagos seguro para completar
            el pago con tarjeta de crédito o débito
          </div>
        </CardContent>
      </Card>

      {/* Terms acceptance */}
      <div className="flex items-start space-x-3">
        <input
          id="accept-non-refundable"
          type="checkbox"
          checked={acceptedTerms}
          onChange={(e) => setAcceptedTerms(e.target.checked)}
          className="mt-1 h-4 w-4 text-orange-600 focus:ring-orange-500"
        />
        <label
          htmlFor="accept-non-refundable"
          className="cursor-pointer text-sm leading-relaxed text-gray-700"
        >
          Entiendo y acepto que este pago de USD 200 es{" "}
          <strong> NO REEMBOLSABLE </strong> bajo ninguna circunstancia, y que
          al proceder estoy comprometido con la reserva de la propiedad.
        </label>
      </div>

      <MainButton
        onClick={handlePaymentSubmit}
        disabled={disabled || !acceptedTerms || isProcessing}
        showArrow
        className="w-fit"
      >
        {isProcessing ? "Procesando Pago..." : "Proceder con Pago Tradicional"}
      </MainButton>

      {isProcessing && (
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-3">
          <p className="text-sm text-blue-800">
            Procesando tu solicitud de pago...
          </p>
        </div>
      )}
    </div>
  );
}
