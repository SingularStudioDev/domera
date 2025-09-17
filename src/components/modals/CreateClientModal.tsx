"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

import {
  checkEmailAction,
  getAvailableUnitsAction,
  validateUnitsAction,
  createClientAction,
} from "@/lib/actions/clients";

// =============================================================================
// TYPES AND SCHEMAS
// =============================================================================

const createClientSchema = z.object({
  firstName: z.string().min(1, "Nombre es requerido").max(100),
  lastName: z.string().min(1, "Apellido es requerido").max(100),
  email: z.string().email("Email inválido"),
  phone: z.string().optional(),
  documentType: z.string().optional(),
  documentNumber: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  operationType: z.enum(["reservation", "purchase"]),
  unitIds: z.array(z.string()).min(1, "Debe seleccionar al menos una unidad").max(2, "Máximo 2 unidades"),
  totalAmount: z.number().positive("Monto debe ser positivo"),
  notes: z.string().optional(),
  installments: z.number().min(1).optional(),
  firstDueDate: z.date().optional(),
});

type CreateClientFormData = z.infer<typeof createClientSchema>;

interface AvailableUnit {
  id: string;
  unitNumber: string;
  floor?: number;
  unitType: string;
  price: number;
  bedrooms: number;
  bathrooms: number;
  totalArea?: number;
  project: {
    id: string;
    name: string;
    slug: string;
  };
}

interface CreateClientModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  organizationId: string;
  createdBy: string;
  onSuccess?: () => void;
  defaultOperationType?: "reservation" | "purchase";
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export function CreateClientModal({
  open,
  onOpenChange,
  organizationId,
  createdBy,
  onSuccess,
  defaultOperationType = "reservation",
}: CreateClientModalProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [emailChecked, setEmailChecked] = useState(false);
  const [availableUnits, setAvailableUnits] = useState<Record<string, AvailableUnit[]>>({});
  const [selectedUnits, setSelectedUnits] = useState<AvailableUnit[]>([]);

  const form = useForm<CreateClientFormData>({
    resolver: zodResolver(createClientSchema),
    defaultValues: {
      operationType: defaultOperationType,
      unitIds: [],
      installments: 12,
    },
  });

  const { watch, setValue, getValues } = form;
  const operationType = watch("operationType");
  const email = watch("email");

  // =============================================================================
  // EFFECTS
  // =============================================================================

  useEffect(() => {
    if (open && Object.keys(availableUnits).length === 0) {
      loadAvailableUnits();
    }
  }, [open]);

  useEffect(() => {
    if (email && email.includes("@")) {
      checkEmailAvailability();
    }
  }, [email]);

  useEffect(() => {
    if (selectedUnits.length > 0) {
      const total = selectedUnits.reduce((sum, unit) => sum + unit.price, 0);
      setValue("totalAmount", total);
      setValue("unitIds", selectedUnits.map(u => u.id));
    }
  }, [selectedUnits, setValue]);

  // =============================================================================
  // HANDLERS
  // =============================================================================

  const loadAvailableUnits = async () => {
    try {
      const units = await getAvailableUnitsAction({ organizationId });
      setAvailableUnits(units);
    } catch (error) {
      toast.error("Error al cargar unidades disponibles");
    }
  };

  const checkEmailAvailability = async () => {
    try {
      const result = await checkEmailAction({ email, organizationId });
      setEmailChecked(true);

      if (!result.available && result.existingUser) {
        toast.info(`El email pertenece a: ${result.existingUser.firstName} ${result.existingUser.lastName}. ¿Desea enviar la invitación a este usuario?`);
      }
    } catch (error) {
      setEmailChecked(false);
    }
  };

  const handleUnitToggle = (unit: AvailableUnit) => {
    setSelectedUnits(prev => {
      const isSelected = prev.some(u => u.id === unit.id);
      if (isSelected) {
        return prev.filter(u => u.id !== unit.id);
      } else if (prev.length < 2) {
        const sameProject = prev.length === 0 || prev[0].project.id === unit.project.id;
        if (sameProject) {
          return [...prev, unit];
        } else {
          toast.error("Todas las unidades deben pertenecer al mismo proyecto");
          return prev;
        }
      } else {
        toast.error("Máximo 2 unidades por cliente");
        return prev;
      }
    });
  };

  const handleNext = async () => {
    if (currentStep === 1) {
      const isValid = await form.trigger(["firstName", "lastName", "email", "phone"]);
      if (isValid && emailChecked) {
        setCurrentStep(2);
      }
    } else if (currentStep === 2) {
      if (selectedUnits.length > 0) {
        setCurrentStep(3);
      } else {
        toast.error("Debe seleccionar al menos una unidad");
      }
    } else if (currentStep === 3) {
      const isValid = await form.trigger(["operationType"]);
      if (isValid) {
        setCurrentStep(4);
      }
    }
  };

  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(1, prev - 1));
  };

  const handleSubmit = async (data: CreateClientFormData) => {
    try {
      setIsLoading(true);

      await createClientAction({
        ...data,
        organizationId,
        createdBy,
        unitIds: selectedUnits.map(u => u.id),
        totalAmount: data.totalAmount,
        firstDueDate: data.operationType === "purchase" && data.firstDueDate ? data.firstDueDate : undefined,
        installments: data.operationType === "purchase" ? data.installments : undefined,
      });

      toast.success("Cliente creado exitosamente. Se ha enviado un email de invitación.");
      onOpenChange(false);
      onSuccess?.();
      resetForm();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Error al crear cliente");
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    form.reset();
    setCurrentStep(1);
    setEmailChecked(false);
    setSelectedUnits([]);
  };

  // =============================================================================
  // RENDER STEPS
  // =============================================================================

  const renderStep1 = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium">Nombre *</label>
          <Input
            {...form.register("firstName")}
            placeholder="Ingrese nombre"
          />
          {form.formState.errors.firstName && (
            <p className="text-sm text-red-500 mt-1">{form.formState.errors.firstName.message}</p>
          )}
        </div>
        <div>
          <label className="text-sm font-medium">Apellido *</label>
          <Input
            {...form.register("lastName")}
            placeholder="Ingrese apellido"
          />
          {form.formState.errors.lastName && (
            <p className="text-sm text-red-500 mt-1">{form.formState.errors.lastName.message}</p>
          )}
        </div>
      </div>

      <div>
        <label className="text-sm font-medium">Email *</label>
        <Input
          {...form.register("email")}
          type="email"
          placeholder="correo@ejemplo.com"
        />
        {form.formState.errors.email && (
          <p className="text-sm text-red-500 mt-1">{form.formState.errors.email.message}</p>
        )}
        {emailChecked && (
          <p className="text-sm text-green-600 mt-1">✓ Email verificado</p>
        )}
      </div>

      <div>
        <label className="text-sm font-medium">Teléfono</label>
        <Input
          {...form.register("phone")}
          placeholder="+598 99 123 456"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium">Tipo de documento</label>
          <Input
            {...form.register("documentType")}
            placeholder="CI, Pasaporte"
          />
        </div>
        <div>
          <label className="text-sm font-medium">Número de documento</label>
          <Input
            {...form.register("documentNumber")}
            placeholder="12345678"
          />
        </div>
      </div>

      <div>
        <label className="text-sm font-medium">Dirección</label>
        <Input
          {...form.register("address")}
          placeholder="Dirección completa"
        />
      </div>

      <div>
        <label className="text-sm font-medium">Ciudad</label>
        <Input
          {...form.register("city")}
          placeholder="Montevideo"
          defaultValue="Montevideo"
        />
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-4">
      <div>
        <h3 className="font-medium mb-3">Seleccione unidades (máximo 2)</h3>
        <p className="text-sm text-gray-500 mb-4">
          Las unidades deben pertenecer al mismo proyecto
        </p>
      </div>

      {Object.entries(availableUnits).map(([projectId, units]) => (
        <div key={projectId} className="space-y-2">
          <h4 className="font-medium text-sm">{units[0]?.project.name}</h4>
          <div className="grid grid-cols-1 gap-2 max-h-60 overflow-y-auto">
            {units.map((unit) => {
              const isSelected = selectedUnits.some(u => u.id === unit.id);
              return (
                <Card
                  key={unit.id}
                  className={`p-3 cursor-pointer transition-colors ${
                    isSelected ? "ring-2 ring-blue-500 bg-blue-50" : "hover:bg-gray-50"
                  }`}
                  onClick={() => handleUnitToggle(unit)}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{unit.unitNumber}</span>
                        <Badge variant="outline">{unit.unitType}</Badge>
                      </div>
                      <p className="text-sm text-gray-500">
                        {unit.bedrooms} hab • {unit.bathrooms} baños
                        {unit.totalArea && ` • ${unit.totalArea}m²`}
                        {unit.floor && ` • Piso ${unit.floor}`}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">USD ${unit.price.toLocaleString()}</p>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      ))}

      {selectedUnits.length > 0 && (
        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
          <h4 className="font-medium mb-2">Unidades seleccionadas:</h4>
          {selectedUnits.map((unit) => (
            <div key={unit.id} className="flex justify-between items-center">
              <span>{unit.unitNumber} - {unit.project.name}</span>
              <span>USD ${unit.price.toLocaleString()}</span>
            </div>
          ))}
          <Separator className="my-2" />
          <div className="flex justify-between font-semibold">
            <span>Total:</span>
            <span>USD ${selectedUnits.reduce((sum, u) => sum + u.price, 0).toLocaleString()}</span>
          </div>
        </div>
      )}
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-4">
      <div>
        <label className="text-sm font-medium">Tipo de operación *</label>
        <div className="grid grid-cols-2 gap-3 mt-2">
          <Card
            className={`p-4 cursor-pointer transition-colors ${
              operationType === "reservation" ? "ring-2 ring-blue-500 bg-blue-50" : "hover:bg-gray-50"
            }`}
            onClick={() => setValue("operationType", "reservation")}
          >
            <h4 className="font-medium">Reserva</h4>
            <p className="text-sm text-gray-500">
              Reserva temporal de la unidad
            </p>
          </Card>
          <Card
            className={`p-4 cursor-pointer transition-colors ${
              operationType === "purchase" ? "ring-2 ring-blue-500 bg-blue-50" : "hover:bg-gray-50"
            }`}
            onClick={() => setValue("operationType", "purchase")}
          >
            <h4 className="font-medium">Compra</h4>
            <p className="text-sm text-gray-500">
              Compra definitiva con plan de pagos
            </p>
          </Card>
        </div>
      </div>

      {operationType === "purchase" && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Número de cuotas</label>
              <Input
                type="number"
                {...form.register("installments", { valueAsNumber: true })}
                min="1"
                max="60"
                placeholder="12"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Primera fecha de vencimiento</label>
              <Input
                type="date"
                {...form.register("firstDueDate", { valueAsDate: true })}
              />
            </div>
          </div>
        </div>
      )}

      <div>
        <label className="text-sm font-medium">Notas adicionales</label>
        <Textarea
          {...form.register("notes")}
          placeholder="Información adicional sobre la operación..."
          rows={3}
        />
      </div>
    </div>
  );

  const renderStep4 = () => {
    const data = getValues();
    const installmentAmount = data.operationType === "purchase" && data.installments
      ? data.totalAmount / data.installments
      : 0;

    return (
      <div className="space-y-4">
        <h3 className="font-medium">Resumen de la operación</h3>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-500">Cliente:</span>
            <p className="font-medium">{data.firstName} {data.lastName}</p>
          </div>
          <div>
            <span className="text-gray-500">Email:</span>
            <p className="font-medium">{data.email}</p>
          </div>
          <div>
            <span className="text-gray-500">Tipo:</span>
            <p className="font-medium">{data.operationType === "reservation" ? "Reserva" : "Compra"}</p>
          </div>
          <div>
            <span className="text-gray-500">Total:</span>
            <p className="font-medium">USD ${data.totalAmount.toLocaleString()}</p>
          </div>
        </div>

        <div>
          <span className="text-gray-500 text-sm">Unidades:</span>
          {selectedUnits.map((unit) => (
            <div key={unit.id} className="flex justify-between items-center p-2 bg-gray-50 rounded mt-1">
              <span>{unit.unitNumber} - {unit.project.name}</span>
              <span>USD ${unit.price.toLocaleString()}</span>
            </div>
          ))}
        </div>

        {data.operationType === "purchase" && data.installments && (
          <div className="p-3 bg-blue-50 rounded-lg">
            <h4 className="font-medium mb-2">Plan de pagos:</h4>
            <p className="text-sm">
              {data.installments} cuotas de USD ${installmentAmount.toLocaleString()}
            </p>
            {data.firstDueDate && (
              <p className="text-sm text-gray-500">
                Primera cuota: {new Date(data.firstDueDate).toLocaleDateString()}
              </p>
            )}
          </div>
        )}

        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-sm">
            <strong>Importante:</strong> Se enviará un email de invitación al cliente con credenciales temporales
            para que pueda acceder y confirmar esta operación.
          </p>
        </div>
      </div>
    );
  };

  // =============================================================================
  // MAIN RENDER
  // =============================================================================

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Crear nuevo cliente</DialogTitle>
        </DialogHeader>

        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-2">
            {[1, 2, 3, 4].map((step) => (
              <div key={step} className="flex items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    step <= currentStep
                      ? "bg-blue-500 text-white"
                      : "bg-gray-200 text-gray-500"
                  }`}
                >
                  {step}
                </div>
                {step < 4 && (
                  <div
                    className={`w-12 h-0.5 ${
                      step < currentStep ? "bg-blue-500" : "bg-gray-200"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
          <span className="text-sm text-gray-500">
            Paso {currentStep} de 4
          </span>
        </div>

        <form onSubmit={form.handleSubmit(handleSubmit)}>
          {currentStep === 1 && renderStep1()}
          {currentStep === 2 && renderStep2()}
          {currentStep === 3 && renderStep3()}
          {currentStep === 4 && renderStep4()}

          <div className="flex justify-between mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={handlePrevious}
              disabled={currentStep === 1}
            >
              Anterior
            </Button>

            {currentStep < 4 ? (
              <Button
                type="button"
                onClick={handleNext}
                disabled={currentStep === 1 && !emailChecked}
              >
                Siguiente
              </Button>
            ) : (
              <Button
                type="submit"
                disabled={isLoading}
              >
                {isLoading ? "Creando..." : "Crear Cliente"}
              </Button>
            )}
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}