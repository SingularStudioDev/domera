"use client";

import { useState } from "react";

import MainButton from "@/components/custom-ui/MainButton";

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

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowTermsModal(true);
  };

  const handleFinalSubmit = async () => {
    setIsSubmitting(true);
    console.log("Form submitted:", { ...formData, useOwnNotary });

    setTimeout(() => {
      setIsSubmitting(false);
      setShowTermsModal(false);
      alert("Formulario enviado exitosamente"); // TODO: Esto no tiene que estar
    }, 2000);
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

          {/* Submit Button */}
          <MainButton type="submit" showArrow>
            Enviar
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
