import { Dispatch, SetStateAction, useState } from "react";

import { BedDoubleIcon, CarFrontIcon, FileText } from "lucide-react";

import { cancelOperation } from "@/lib/actions/operations";
import { Sheet, SheetContent } from "@/components/ui/sheet";

// Define operation interface based on the useActiveOperation hook structure
interface Operation {
  id: string;
  status: string;
  totalAmount: number;
  currency: string;
  startedAt: Date;
  notes?: string;
  operationUnits: Array<{
    unit: {
      id: string;
      unitNumber: string;
      price: number;
      project: { name: string; slug: string };
    };
    priceAtReservation: number;
  }>;
  steps: Array<{
    id: string;
    stepName: string;
    stepOrder: number;
    status: string;
    startedAt?: Date;
    completedAt?: Date;
  }>;
}

interface ShoppingSheetProps {
  isSheetOpen: boolean;
  setIsSheetOpen: Dispatch<SetStateAction<boolean>>;
  operation: Operation | null;
  onOperationUpdate: () => Promise<void>;
}

export function ShoppingSheet({
  isSheetOpen,
  setIsSheetOpen,
  operation,
  onOperationUpdate,
}: ShoppingSheetProps) {
  const [isCancelling, setIsCancelling] = useState(false);
  const [cancelError, setCancelError] = useState<string | null>(null);

  // Handle cancel operation
  const handleCancelOperation = async () => {
    if (!operation) return;

    setIsCancelling(true);
    setCancelError(null);

    try {
      const result = await cancelOperation(
        operation.id,
        "Cancelada por el usuario desde dashboard de compras",
      );

      if (result.success) {
        await onOperationUpdate();
        setIsSheetOpen(false);
      } else {
        setCancelError(result.error || "Error al cancelar operación");
      }
    } catch {
      setCancelError("Error interno del servidor");
    } finally {
      setIsCancelling(false);
    }
  };

  // Helper functions
  const calculateProgress = (): number => {
    if (!operation?.steps) return 0;
    const completedSteps = operation.steps.filter(
      (step) => step.status === "completed",
    ).length;
    return Math.round((completedSteps / operation.steps.length) * 100);
  };

  const getStepStatusLabel = (status: string): string => {
    switch (status) {
      case "completed":
        return "Completado";
      case "in_progress":
        return "En progreso";
      case "pending":
        return "Pendiente";
      default:
        return status;
    }
  };

  const getStepStatusColor = (status: string): string => {
    switch (status) {
      case "completed":
        return "text-green-700 bg-green-50 border-green-200";
      case "in_progress":
        return "text-orange-700 bg-orange-50 border-orange-200";
      case "pending":
        return "text-red-700 bg-red-50 border-red-200";
      default:
        return "text-gray-700 bg-gray-50 border-gray-200";
    }
  };

  // If no operation, show empty state
  if (!operation) {
    return (
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent
          side="right"
          className="w-[80vw] overflow-y-auto rounded-l-xl p-3 sm:max-w-[80vw]"
        >
          <div className="h-full bg-white">
            <div className="space-y-8 p-8">
              <div className="py-12 text-center">
                <p className="text-gray-600">
                  No hay información de operación disponible
                </p>
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  // Get primary operation unit (first one) for display
  const primaryUnit = operation.operationUnits[0];
  const projectName = primaryUnit?.unit.project.name || "Proyecto";
  const unitInfo = `Unidad ${primaryUnit?.unit.unitNumber}`;
  const totalAmount = `${operation.currency} $${operation.totalAmount.toLocaleString()}`;
  const progressPercentage = calculateProgress();
  return (
    <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
      <SheetContent
        side="right"
        className="w-[80vw] overflow-y-auto rounded-l-xl p-3 sm:max-w-[80vw]"
      >
        <div className="h-full bg-white">
          <div className="space-y-8 p-8">
            {/* Error Display */}
            {cancelError && (
              <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-4">
                <p className="text-red-700">❌ {cancelError}</p>
              </div>
            )}

            {/* Sección superior */}
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-gray-900">
                  {projectName}
                </h1>
                <p className="mt-1 text-gray-800">{unitInfo}</p>
                <p className="mt-1 text-sm text-gray-600">
                  Operación #{operation.id.slice(0, 8)} - {operation.status}
                </p>
              </div>

              <div className="flex flex-col items-end space-y-2">
                <div className="w-64">
                  <div className="mb-1 flex items-center justify-between">
                    <span className="text-sm text-black">
                      {progressPercentage}% completado
                    </span>
                    <a
                      href={`/projects/${primaryUnit?.unit.project.slug || "#"}`}
                      className="text-primaryColor text-sm hover:underline"
                    >
                      Ver proyecto
                    </a>
                  </div>
                  <div className="h-2 w-full rounded-full bg-gray-200">
                    <div
                      className="bg-primaryColor h-2 rounded-full transition-all duration-300"
                      style={{ width: `${progressPercentage}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Detalles de operación y unidades */}
            <div className="overflow-hidden rounded-lg bg-white">
              <div className="flex w-full items-center justify-between">
                <div className="mb-3 flex flex-col">
                  <h3 className="text-lg font-bold text-gray-900">
                    {operation.operationUnits
                      .map(
                        (ou) =>
                          `${ou.unit.project.name} - Unidad ${ou.unit.unitNumber}`,
                      )
                      .join(", ")}
                  </h3>
                  <div className="flex items-center gap-7 text-sm">
                    <p>Total: {totalAmount}</p>
                    {/* TODO: Add unit specifications when available */}
                    <div className="flex items-center gap-0.5">
                      <BedDoubleIcon className="h-4 w-4" />-
                    </div>
                    <div className="flex items-center gap-0.5">
                      <CarFrontIcon className="h-4 w-4" />-
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <FileText className="h-5 w-5 text-blue-600" />
                    <a
                      href="/operations/documents"
                      className="text-sm text-blue-600 hover:underline"
                    >
                      Documentos
                    </a>
                  </div>

                  {operation.status !== "completed" &&
                    operation.status !== "cancelled" && (
                      <button
                        onClick={handleCancelOperation}
                        disabled={isCancelling}
                        className="text-sm text-red-600 hover:text-red-700 disabled:opacity-50"
                      >
                        {isCancelling ? "Cancelando..." : "Cancelar Operación"}
                      </button>
                    )}
                </div>
              </div>

              <div className="overflow-x-auto rounded-2xl border">
                <table className="w-full rounded-xl">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-bold tracking-wider text-black uppercase">
                        Paso
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-bold tracking-wider text-black uppercase">
                        Orden
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-bold tracking-wider text-black uppercase">
                        Fecha iniciado
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-bold tracking-wider text-black uppercase">
                        Estado
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {operation.steps
                      .sort((a, b) => a.stepOrder - b.stepOrder)
                      .map((step) => (
                        <tr key={step.id} className="hover:bg-gray-50">
                          <td className="px-6 py-2 text-sm font-medium whitespace-nowrap text-gray-900">
                            {step.stepName}
                          </td>
                          <td className="px-6 py-2 text-sm whitespace-nowrap text-gray-900">
                            {step.stepOrder}
                          </td>
                          <td className="px-6 py-2 text-sm whitespace-nowrap text-gray-900">
                            {step.startedAt
                              ? new Date(step.startedAt).toLocaleDateString()
                              : "-"}
                          </td>
                          <td className="px-6 py-2 whitespace-nowrap">
                            <span
                              className={`inline-flex rounded-full border px-2 py-1 text-xs font-medium ${getStepStatusColor(step.status)}`}
                            >
                              {getStepStatusLabel(step.status)}
                            </span>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Sección de documentos y acciones */}
            <div>
              <h3 className="mb-4 text-lg font-bold text-gray-900">
                Documentos y Acciones
              </h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <FileText className="text-primaryColor h-5 w-5" />
                  <a
                    href="/operations/documents"
                    className="text-primaryColor text-sm hover:underline"
                  >
                    Gestionar documentos de la operación
                  </a>
                </div>

                {/* TODO: Add blueprint/document links when document management is implemented */}
                <div className="text-sm text-gray-500">
                  Los planos y documentos específicos del proyecto estarán
                  disponibles una vez que se implemente el sistema de gestión de
                  documentos.
                </div>

                {/* Operation status specific actions */}
                {operation.status === "documents_pending" && (
                  <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
                    <p className="text-sm text-blue-700">
                      📄 Necesitas subir los documentos requeridos para
                      continuar con la operación.
                    </p>
                  </div>
                )}

                {operation.status === "waiting_signature" && (
                  <div className="rounded-lg border border-orange-200 bg-orange-50 p-4">
                    <p className="text-sm text-orange-700">
                      ✍️ Tu operación está esperando firma. Revisa tu email para
                      el enlace de firma digital.
                    </p>
                  </div>
                )}

                {operation.status === "completed" && (
                  <div className="rounded-lg border border-green-200 bg-green-50 p-4">
                    <p className="text-sm text-green-700">
                      ✅ Operación completada exitosamente. Todos los documentos
                      están finalizados.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
