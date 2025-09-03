"use client";

import { useState } from "react";

import { useSession } from "next-auth/react";

import { useActiveOperation } from "@/hooks/useActiveOperation";
import PropertyCard from "@/components/custom-ui/PropertyCard";

import { ShoppingSheet } from "./_components/ShoppingSheet";

export default function ShoppingDashboardPage() {
  const { data: session, status } = useSession();
  const {
    activeOperation,
    hasActiveOperation,
    canStartNewOperation,
    loading,
    error,
    refreshActiveOperation,
  } = useActiveOperation();

  const [isSheetOpen, setIsSheetOpen] = useState(false);

  // Helper function to get action label based on operation status
  const getOperationActionLabel = (status: string): string => {
    switch (status) {
      case "initiated":
      case "documents_pending":
        return "Subir documentos";
      case "documents_uploaded":
      case "under_validation":
        return "En validación";
      case "professional_assigned":
        return "Profesional asignado";
      case "waiting_signature":
        return "Firma pendiente";
      case "signature_completed":
        return "Firma completada";
      case "payment_pending":
        return "Pago pendiente";
      case "payment_confirmed":
        return "Pago confirmado";
      case "completed":
        return "Completada";
      case "cancelled":
        return "Cancelada";
      default:
        return "Ver detalles";
    }
  };

  // Helper function to calculate progress from operation steps
  const calculateOperationProgress = () => {
    if (!activeOperation?.steps) return 0;
    const completedSteps = activeOperation.steps.filter(
      (step) => step.status === "completed",
    ).length;
    return Math.round((completedSteps / activeOperation.steps.length) * 100);
  };

  // Handle loading and authentication states
  if (status === "loading" || loading) {
    return (
      <div className="container mx-auto pt-26">
        <div className="mb-4 flex items-center justify-between">
          <h1 className="dashboard-title">Compras</h1>
        </div>
        <div className="flex items-center justify-center py-8">
          <p className="text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="container mx-auto pt-26">
        <div className="mb-4 flex items-center justify-between">
          <h1 className="dashboard-title">Compras</h1>
        </div>
        <div className="flex items-center justify-center py-8">
          <div className="text-center">
            <p className="mb-2 text-gray-600">
              Debes iniciar sesión para ver tus compras.
            </p>
            <a href="/login" className="text-blue-600 hover:underline">
              Iniciar Sesión
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="container mx-auto pt-26">
        {/* Header */}
        <div className="mb-4 flex items-center justify-between">
          <h1 className="dashboard-title">Compras</h1>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-4">
            <p className="text-red-700">❌ {error}</p>
          </div>
        )}

        <div className="grid grid-cols-3 gap-5">
          {/* Show active operation or message */}
          {hasActiveOperation && activeOperation ? (
            // Display the first unit from the active operation
            activeOperation.operationUnits.map((operationUnit, index) => (
              <PropertyCard
                key={operationUnit.unit.id}
                imageUrl="/pro/pro-2.png" // TODO: Get from unit data when available
                location={operationUnit.unit.project.name} // Using project name as location
                deliveryDate="Ene 2027" // TODO: Get from project data when available
                progress={calculateOperationProgress()}
                title={`${operationUnit.unit.project.name} - Unidad ${operationUnit.unit.unitNumber}`}
                price={`${activeOperation.currency} $${operationUnit.priceAtReservation.toLocaleString()}`}
                address="Información disponible en documentos" // TODO: Get from project data when available
                bedrooms={2} // TODO: Get from unit specifications when available
                garages={1} // TODO: Get from unit specifications when available
                actionLabel={getOperationActionLabel(activeOperation.status)}
                onAction={() => setIsSheetOpen(true)}
              />
            ))
          ) : canStartNewOperation ? (
            // Show message when no active operation but can start new one
            <div className="col-span-3 flex items-center justify-center py-12 text-center">
              <div className="max-w-md">
                <p className="mb-2 text-gray-600">
                  No tienes ninguna compra activa.
                </p>
                <p className="text-sm text-gray-500">
                  Las operaciones que inicies aparecerán aquí para gestionar
                  documentos y seguimiento.
                </p>
                {/* TODO: Add button to browse available units when unit browser is implemented */}
              </div>
            </div>
          ) : (
            // Show message when cannot start new operation (likely has pending operation)
            <div className="col-span-3 flex items-center justify-center py-12 text-center">
              <div className="max-w-md">
                <p className="mb-2 text-gray-600">
                  No se pueden iniciar nuevas operaciones.
                </p>
                <p className="text-sm text-gray-500">
                  Tienes una operación pendiente de completar o cancelar.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {isSheetOpen && (
        <ShoppingSheet
          isSheetOpen={isSheetOpen}
          setIsSheetOpen={setIsSheetOpen}
          operation={activeOperation}
          onOperationUpdate={refreshActiveOperation}
        />
      )}
    </>
  );
}
