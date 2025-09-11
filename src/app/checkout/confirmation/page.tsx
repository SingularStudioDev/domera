"use client";

import { useState } from "react";

import MainButton from "@/components/custom-ui/MainButton";
import { PaymentMethodSelector, PaymentMethod } from "@/components/checkout/PaymentMethodSelector";
import { EscrowReservation } from "@/components/checkout/EscrowReservation";
import { TraditionalPayment, TraditionalPaymentData } from "@/components/checkout/TraditionalPayment";
import { submitCheckoutFormAction } from "@/lib/actions/payments";

import { TermsModal } from "./_components/TermsModal";

export default function ConfirmationPage() {
  const [formData, setFormData] = useState({
    nombre: "",
    apellido: "",
    cedula: "",
    telefono: "",
    email: "",
    direccion: "",
    ciudad: "",
    departamento: "",
    codigoPostal: "",
    ingresos: "",
    comentarios: "",
  });

  const [useOwnNotary, setUseOwnNotary] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // New payment-related states
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod>("traditional");
  const [paymentCompleted, setPaymentCompleted] = useState(false);
  const [escrowTransactionId, setEscrowTransactionId] = useState<string | null>(null);
  const [traditionalPaymentData, setTraditionalPaymentData] = useState<TraditionalPaymentData | null>(null);
  const [paymentError, setPaymentError] = useState<string | null>(null);

  // Mock property data - in real implementation, this would come from context or props
  const propertyData = {
    id: "prop-001",
    title: "Apartamento Premium en Pocitos",
    price: "USD 150,000",
    location: "Pocitos, Montevideo",
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Payment handlers
  const handleEscrowCreated = (transactionId: string, transactionHash: string) => {
    setEscrowTransactionId(transactionId);
    setPaymentCompleted(true);
    setPaymentError(null);
    console.log('Escrow created:', { transactionId, transactionHash });
  };

  const handleTraditionalPaymentInitiated = (paymentData: TraditionalPaymentData) => {
    setTraditionalPaymentData(paymentData);
    setPaymentCompleted(true);
    setPaymentError(null);
    console.log('Traditional payment initiated:', paymentData);
  };

  const handlePaymentError = (error: string) => {
    setPaymentError(error);
    setPaymentCompleted(false);
  };

  const clearPaymentError = () => {
    setPaymentError(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Clear any previous errors
    clearPaymentError();
    
    // Check if payment is required and completed
    if (!paymentCompleted) {
      setPaymentError("Debes completar el pago de reserva antes de continuar");
      return;
    }
    
    setShowTermsModal(true);
  };

  const handleFinalSubmit = async () => {
    setIsSubmitting(true);
    
    try {
      // Prepare complete submission data
      const submissionData = {
        formData: { ...formData, useOwnNotary },
        paymentData: {
          method: selectedPaymentMethod,
          escrowTransactionId,
          traditionalPaymentData,
          propertyData,
        },
      };
      
      console.log("Complete submission data:", submissionData);
      
      // Submit form data using server action
      const result = await submitCheckoutFormAction(submissionData);
      
      if (result.success) {
        setShowTermsModal(false);
        alert(`Formulario enviado exitosamente con pago ${selectedPaymentMethod === 'escrow' ? 'por escrow' : 'tradicional'}`);
        // TODO: Redirect to success page or payment confirmation
      } else {
        throw new Error(result.error || 'Error al enviar formulario');
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      setPaymentError(error instanceof Error ? error.message : 'Error al enviar el formulario');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto flex w-full">
      <div className="w-1/4" />

      <div className="w-full flex-1">
        {/* Header Text */}
        <div className="mb-12">
          <h1 className="mb-8 text-3xl font-semibold text-gray-900">
            Creación de boleto de reserva
          </h1>
          <p className="leading-relaxed text-gray-600">
            Completa el formulario con tus datos para enviárselos a la
            desarrolladora, y así puedan generar tu boleto de reserva. Una vez
            generado se te enviará el boleto de reserva con tus datos para ser
            firmado digitalmente (Agesic, Abitab).
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Input Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Nombre *
              </label>
              <input
                type="text"
                name="nombre"
                value={formData.nombre}
                onChange={handleInputChange}
                className="focus:ring-primaryColor w-full rounded-md border border-gray-300 px-4 py-3 transition-all outline-none focus:border-transparent focus:ring-2"
                placeholder="Tu nombre"
                required
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Apellido *
              </label>
              <input
                type="text"
                name="apellido"
                value={formData.apellido}
                onChange={handleInputChange}
                className="focus:ring-primaryColor w-full rounded-md border border-gray-300 px-4 py-3 transition-all outline-none focus:border-transparent focus:ring-2"
                placeholder="Tu apellido"
                required
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Cédula de Identidad *
              </label>
              <input
                type="text"
                name="cedula"
                value={formData.cedula}
                onChange={handleInputChange}
                className="focus:ring-primaryColor w-full rounded-md border border-gray-300 px-4 py-3 transition-all outline-none focus:border-transparent focus:ring-2"
                placeholder="1.234.567-8"
                required
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Teléfono *
              </label>
              <input
                type="tel"
                name="telefono"
                value={formData.telefono}
                onChange={handleInputChange}
                className="focus:ring-primaryColor w-full rounded-md border border-gray-300 px-4 py-3 transition-all outline-none focus:border-transparent focus:ring-2"
                placeholder="+598 99 123 456"
                required
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Correo electrónico *
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="focus:ring-primaryColor w-full rounded-md border border-gray-300 px-4 py-3 transition-all outline-none focus:border-transparent focus:ring-2"
                placeholder="tu@email.com"
                required
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Dirección *
              </label>
              <input
                type="text"
                name="direccion"
                value={formData.direccion}
                onChange={handleInputChange}
                className="focus:ring-primaryColor w-full rounded-md border border-gray-300 px-4 py-3 transition-all outline-none focus:border-transparent focus:ring-2"
                placeholder="Tu dirección completa"
                required
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Ciudad *
              </label>
              <input
                type="text"
                name="ciudad"
                value={formData.ciudad}
                onChange={handleInputChange}
                className="focus:ring-primaryColor w-full rounded-md border border-gray-300 px-4 py-3 transition-all outline-none focus:border-transparent focus:ring-2"
                placeholder="Tu ciudad"
                required
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Departamento *
              </label>
              <input
                type="text"
                name="departamento"
                value={formData.departamento}
                onChange={handleInputChange}
                className="focus:ring-primaryColor w-full rounded-md border border-gray-300 px-4 py-3 transition-all outline-none focus:border-transparent focus:ring-2"
                placeholder="Departamento"
                required
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Código Postal
              </label>
              <input
                type="text"
                name="codigoPostal"
                value={formData.codigoPostal}
                onChange={handleInputChange}
                className="focus:ring-primaryColor w-full rounded-md border border-gray-300 px-4 py-3 transition-all outline-none focus:border-transparent focus:ring-2"
                placeholder="11000"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Ingresos mensuales *
              </label>
              <input
                type="text"
                name="ingresos"
                value={formData.ingresos}
                onChange={handleInputChange}
                className="focus:ring-primaryColor w-full rounded-md border border-gray-300 px-4 py-3 transition-all outline-none focus:border-transparent focus:ring-2"
                placeholder="USD 0,000"
                required
              />
            </div>
          </div>

          {/* Textarea - spans two columns */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Comentarios adicionales
            </label>
            <textarea
              name="comentarios"
              value={formData.comentarios}
              onChange={handleInputChange}
              rows={4}
              className="focus:ring-primaryColor w-full resize-none rounded-md border border-gray-300 px-4 py-3 transition-all outline-none focus:border-transparent focus:ring-2"
              placeholder="Cualquier información adicional que consideres relevante..."
            />
          </div>

          {/* Notary Checkbox */}
          <div className="mt-6 flex items-center">
            <input
              id="use-own-notary"
              name="use-own-notary"
              type="checkbox"
              checked={useOwnNotary}
              onChange={(e) => setUseOwnNotary(e.target.checked)}
              className="text-primaryColor h-4 w-4 cursor-pointer rounded border-gray-300 focus:ring-blue-500"
            />
            <label
              htmlFor="use-own-notary"
              className="ml-2 block cursor-pointer text-sm text-gray-700 select-none"
            >
              ¿Vas a usar tu escribana en el proceso de compra o te
              proporcionamos una?
            </label>
          </div>

          {/* Payment Section */}
          <div className="mt-8 pt-8 border-t border-gray-200">
            <PaymentMethodSelector
              selectedMethod={selectedPaymentMethod}
              onMethodChange={(method) => {
                setSelectedPaymentMethod(method);
                setPaymentCompleted(false);
                setPaymentError(null);
              }}
              onWalletConnected={() => {
                clearPaymentError();
              }}
            />
          </div>

          {/* Payment Error Display */}
          {paymentError && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-800">❌ {paymentError}</p>
            </div>
          )}

          {/* Payment Process Section */}
          <div className="mt-6">
            {selectedPaymentMethod === "escrow" && (
              <EscrowReservation
                onEscrowCreated={handleEscrowCreated}
                onError={handlePaymentError}
                propertyData={propertyData}
                disabled={paymentCompleted}
              />
            )}

            {selectedPaymentMethod === "traditional" && (
              <TraditionalPayment
                onPaymentInitiated={handleTraditionalPaymentInitiated}
                onError={handlePaymentError}
                propertyData={propertyData}
                disabled={paymentCompleted}
              />
            )}
          </div>

          {/* Payment Success Display */}
          {paymentCompleted && (
            <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center space-x-2">
                <span className="text-green-600">✅</span>
                <div>
                  <p className="text-sm font-medium text-green-800">
                    Pago completado exitosamente
                  </p>
                  {selectedPaymentMethod === "escrow" && escrowTransactionId && (
                    <p className="text-xs text-green-600">
                      ID de Escrow: {escrowTransactionId}
                    </p>
                  )}
                  {selectedPaymentMethod === "traditional" && traditionalPaymentData && (
                    <p className="text-xs text-green-600">
                      Referencia: {traditionalPaymentData.reference}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <MainButton 
            type="submit" 
            showArrow
            disabled={!paymentCompleted}
            className={!paymentCompleted ? "opacity-50 cursor-not-allowed" : ""}
          >
            {paymentCompleted ? "Continuar con Boleto de Reserva" : "Completa el Pago de Reserva"}
          </MainButton>
        </form>
      </div>

      <TermsModal
        open={showTermsModal}
        onOpenChange={setShowTermsModal}
        onAccept={handleFinalSubmit}
        isSubmitting={isSubmitting}
      />
    </div>
  );
}
