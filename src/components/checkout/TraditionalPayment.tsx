"use client";

import { useState } from "react";
import MainButton from "@/components/custom-ui/MainButton";

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
  disabled = false
}: TraditionalPaymentProps) {
  const [selectedMethod, setSelectedMethod] = useState<TraditionalPaymentData['method']>("bank_transfer");
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
        reference
      };

      // Simulate processing delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      onPaymentInitiated(paymentData);
    } catch (error) {
      console.error('Error processing traditional payment:', error);
      onError(error instanceof Error ? error.message : 'Error desconocido');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Warning about non-refundable */}
      <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
        <h4 className="font-medium text-orange-900 mb-2">
          💳 Pago Tradicional - Importante
        </h4>
        <div className="text-sm text-orange-800 space-y-2">
          <p>
            ⚠️ <strong>Este pago NO es devolvible</strong> bajo ninguna circunstancia.
          </p>
          <p>
            Los USD 200 de reserva serán procesados por Domera y no podrán ser 
            reembolsados, independientemente del motivo de cancelación.
          </p>
        </div>
      </div>

      {/* Property details */}
      {propertyData && (
        <div className="bg-gray-50 rounded-lg p-4">
          <h5 className="font-medium text-gray-900 mb-2">Detalles de la Reserva</h5>
          <div className="text-sm text-gray-600 space-y-1">
            <p><strong>Propiedad:</strong> {propertyData.title}</p>
            <p><strong>Ubicación:</strong> {propertyData.location}</p>
            <p><strong>Precio:</strong> {propertyData.price}</p>
            <p><strong>Monto de Reserva:</strong> USD 200</p>
          </div>
        </div>
      )}

      {/* Payment method selection */}
      <div>
        <h5 className="font-medium text-gray-900 mb-3">Método de Pago</h5>
        <div className="space-y-3">
          <label className="flex items-center">
            <input
              type="radio"
              name="payment-method"
              value="bank_transfer"
              checked={selectedMethod === "bank_transfer"}
              onChange={(e) => setSelectedMethod(e.target.value as TraditionalPaymentData['method'])}
              className="mr-3 h-4 w-4 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm">🏦 Transferencia Bancaria</span>
          </label>
          
          <label className="flex items-center">
            <input
              type="radio"
              name="payment-method"
              value="credit_card"
              checked={selectedMethod === "credit_card"}
              onChange={(e) => setSelectedMethod(e.target.value as TraditionalPaymentData['method'])}
              className="mr-3 h-4 w-4 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm">💳 Tarjeta de Crédito</span>
          </label>
          
          <label className="flex items-center">
            <input
              type="radio"
              name="payment-method"
              value="other"
              checked={selectedMethod === "other"}
              onChange={(e) => setSelectedMethod(e.target.value as TraditionalPaymentData['method'])}
              className="mr-3 h-4 w-4 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm">📄 Otro (Coordinar con Domera)</span>
          </label>
        </div>
      </div>

      {/* Payment instructions based on method */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h5 className="font-medium text-blue-900 mb-2">
          {selectedMethod === "bank_transfer" && "📋 Instrucciones de Transferencia"}
          {selectedMethod === "credit_card" && "💳 Proceso de Pago con Tarjeta"}
          {selectedMethod === "other" && "📞 Coordinación de Pago"}
        </h5>
        <div className="text-sm text-blue-800">
          {selectedMethod === "bank_transfer" && (
            <div className="space-y-1">
              <p>Al confirmar, recibirás por email:</p>
              <ul className="list-disc list-inside ml-2">
                <li>Datos bancarios de Domera</li>
                <li>Número de referencia único</li>
                <li>Instrucciones detalladas</li>
              </ul>
            </div>
          )}
          
          {selectedMethod === "credit_card" && (
            <div className="space-y-1">
              <p>Serás redirigido a nuestro procesador de pagos seguro para completar el pago con tarjeta de crédito o débito.</p>
            </div>
          )}
          
          {selectedMethod === "other" && (
            <div className="space-y-1">
              <p>Un representante de Domera se contactará contigo dentro de las próximas 2 horas hábiles para coordinar el método de pago.</p>
            </div>
          )}
        </div>
      </div>

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
          className="text-sm text-gray-700 cursor-pointer leading-relaxed"
        >
          Entiendo y acepto que este pago de USD 200 es <strong>completamente NO devolvible</strong> bajo ninguna circunstancia, y que al proceder estoy comprometido con la reserva de la propiedad.
        </label>
      </div>

      <MainButton
        onClick={handlePaymentSubmit}
        disabled={disabled || !acceptedTerms || isProcessing}
        showArrow
        className="w-full"
      >
        {isProcessing 
          ? "Procesando Pago..." 
          : "💳 Proceder con Pago Tradicional"
        }
      </MainButton>

      {isProcessing && (
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800">
            ⏳ Procesando tu solicitud de pago...
          </p>
        </div>
      )}
    </div>
  );
}