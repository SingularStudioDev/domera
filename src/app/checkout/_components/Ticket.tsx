"use client";

import { useState } from "react";
import Link from "next/link";

import { useCheckoutStore } from "@/stores/checkoutStore";
import { ArrowRightIcon, DownloadIcon } from "lucide-react";

import { createOperationSimpleAction } from "@/lib/actions/operations";

interface TicketProps {
  handleFileUpload?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  selectedFile?: File | null;
}

export function Ticket({
  handleFileUpload,
  selectedFile: propSelectedFile,
}: TicketProps = {}) {
  const [localSelectedFile, setLocalSelectedFile] = useState<File | null>(null);
  const [isCreatingOperation, setIsCreatingOperation] = useState(false);
  const [operationError, setOperationError] = useState<string | null>(null);

  const selectedFile = propSelectedFile ?? localSelectedFile;

  // Checkout store
  const { items, getTotalPrice, clearCheckout } = useCheckoutStore();

  const handleLocalFileUpload = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    if (handleFileUpload) {
      handleFileUpload(event);
    } else {
      const file = event.target.files?.[0] || null;
      setLocalSelectedFile(file);
    }
  };

  // Create operation from checkout store data
  const handleCreateOperation = async () => {
    if (items.length === 0) {
      setOperationError("No hay unidades en el carrito");
      return;
    }

    setIsCreatingOperation(true);
    setOperationError(null);

    try {
      // Transform checkout items to operation input
      const unitIds = items.map((item) => item.unitId);

      const operationInput = {
        unitIds,
        notes: `Operación creada desde checkout con ${items.length} unidades`,
      };

      const result = await createOperationSimpleAction(operationInput);

      if (result.success) {
        // Clear checkout store after successful operation creation
        clearCheckout();
        setOperationError(null);
        // Redirect to success page
        window.location.href = "/checkout/success";
      } else {
        setOperationError(result.error || "Error creando operación");
      }
    } catch (error) {
      setOperationError("Error interno creando operación");
      console.error("Error creating operation:", error);
    } finally {
      setIsCreatingOperation(false);
    }
  };
  return (
    <div className="mb-20 flex w-full gap-20">
      <div className="max-w-[900px] flex-1">
        <h2 className="mb-8 text-3xl font-bold text-black">
          Descargar boleto de reserva
        </h2>
        <p className="mb-8 text-gray-700">
          Firmá el boleto de reserva con tu firma digital (Abitab o Agesic) y
          generá un documento con validez legal. Al hacerlo, aceptás las
          condiciones y responsabilidades establecidas.
        </p>

        <Link
          href="#"
          className="text-primaryColor mb-8 inline-flex items-center gap-2 hover:text-blue-800"
        >
          <DownloadIcon className="h-4 w-4" />
          Descargar boleto de reserva
        </Link>

        <p className="mb-8 text-gray-700">
          Una vez firmado, subilo a la plataforma y en minutos vas a recibir al
          mail registrado una copia del mismo. Podes revisarlo con tu escribano
          y subirlo cuando quieras.
        </p>
        <p className="mb-8 text-gray-700">
          Una vez subido al sistema tendrás 2 días hábiles para hacer el
          depósito de la seña para mantener la reserva.
        </p>

        {/* Operation Error Display */}
        {operationError && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-4">
            <p className="text-red-700">❌ {operationError}</p>
          </div>
        )}

        {/* Bank Information */}
        <div className="mb-8 grid grid-cols-2 gap-6">
          <div>
            <p className="text-gray-700">
              Banco: Santander
              <br />
              Titular: Dahiana mendez
              <br />
              Cuenta: 123456
              <br />
              Moneda: USD
            </p>
          </div>
          <div>
            <p className="text-gray-700">
              Banco: BROU
              <br />
              Titular: Dahiana mendez
              <br />
              Cuenta: 0000123456 00002
              <br />
              Moneda: USD
            </p>
          </div>
        </div>

        {/* File Upload */}
        <div className="mb-8 max-w-[400px]">
          <div className="mb-2 flex gap-1">
            <span className="text-sm text-gray-600">Archivo</span>
            <span className="text-sm text-red-600">*</span>
          </div>
          <div className="rounded border border-dashed border-gray-300 p-8 text-center">
            <p className="mb-4 text-sm text-black">
              Arrastra el archivo o selecciona desde tu dispositivo
            </p>
            <input
              type="file"
              onChange={handleLocalFileUpload}
              className="hidden"
              id="file-upload"
              accept=".pdf,.doc,.docx"
            />
            <label
              htmlFor="file-upload"
              className="border-primaryColor text-primaryColor hover:bg-primaryColor cursor-pointer rounded-full border bg-white px-6 py-2 transition-colors hover:text-white"
            >
              Cargar archivo
            </label>
          </div>
        </div>

        {/* Submit Button */}
        <button
          onClick={handleCreateOperation}
          className={`flex w-fit cursor-pointer items-center justify-center rounded-full px-8 py-3 text-white transition-colors duration-300 ${
            selectedFile && !isCreatingOperation
              ? "bg-primaryColor hover:bg-blue-700"
              : "cursor-not-allowed bg-gray-300"
          }`}
          disabled={!selectedFile || isCreatingOperation}
        >
          {isCreatingOperation
            ? "Creando operación..."
            : "Proceder a la reserva"}
          <ArrowRightIcon className="ml-4 h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
