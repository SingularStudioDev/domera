"use client";

import { useState } from "react";
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

import {
  checkEmailAction,
  createClientOnlyAction,
} from "@/lib/actions/clients";

// =============================================================================
// TYPES AND SCHEMAS
// =============================================================================

const createClientOnlySchema = z.object({
  firstName: z.string().min(1, "Nombre es requerido").max(100),
  lastName: z.string().min(1, "Apellido es requerido").max(100),
  email: z.string().email("Email inválido"),
  phone: z.string().optional(),
  documentType: z.string().optional(),
  documentNumber: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
});

type CreateClientOnlyFormData = z.infer<typeof createClientOnlySchema>;

interface CreateClientOnlyModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  organizationId: string;
  createdBy: string;
  onSuccess?: () => void;
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export function CreateClientOnlyModal({
  open,
  onOpenChange,
  organizationId,
  createdBy,
  onSuccess,
}: CreateClientOnlyModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [emailChecked, setEmailChecked] = useState(false);

  const form = useForm<CreateClientOnlyFormData>({
    resolver: zodResolver(createClientOnlySchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      documentType: "",
      documentNumber: "",
      address: "",
      city: "",
    },
  });

  const { watch, reset } = form;
  const email = watch("email");

  // Check email availability when email changes
  const handleEmailCheck = async () => {
    try {
      if (!email || !z.string().email().safeParse(email).success) {
        setEmailChecked(false);
        return;
      }

      const result = await checkEmailAction({
        email,
        organizationId,
      });

      if (!result.available) {
        form.setError("email", {
          type: "manual",
          message: `Este email ya está registrado para ${result.existingUser?.firstName} ${result.existingUser?.lastName}`,
        });
        setEmailChecked(false);
      } else {
        form.clearErrors("email");
        setEmailChecked(true);
        toast.success("Email disponible");
      }
    } catch (error) {
      form.setError("email", {
        type: "manual",
        message: "Error al verificar email",
      });
      setEmailChecked(false);
    }
  };

  const onSubmit = async (data: CreateClientOnlyFormData) => {
    try {
      setIsLoading(true);

      // Final email check
      if (!emailChecked) {
        await handleEmailCheck();
        if (!emailChecked) {
          return;
        }
      }

      const result = await createClientOnlyAction({
        ...data,
        organizationId,
        createdBy,
      });

      toast.success(`Cliente ${data.firstName} ${data.lastName} creado exitosamente`);

      // Reset form and close modal
      reset();
      setEmailChecked(false);
      onOpenChange(false);

      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error("Error creating client:", error);
      toast.error(error instanceof Error ? error.message : "Error al crear cliente");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    reset();
    setEmailChecked(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Crear Nuevo Cliente</DialogTitle>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Personal Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Información Personal</h3>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre *
                </label>
                <Input
                  {...form.register("firstName")}
                  placeholder="Nombre"
                  disabled={isLoading}
                />
                {form.formState.errors.firstName && (
                  <p className="text-red-600 text-sm mt-1">
                    {form.formState.errors.firstName.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Apellido *
                </label>
                <Input
                  {...form.register("lastName")}
                  placeholder="Apellido"
                  disabled={isLoading}
                />
                {form.formState.errors.lastName && (
                  <p className="text-red-600 text-sm mt-1">
                    {form.formState.errors.lastName.message}
                  </p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email *
              </label>
              <div className="flex gap-2">
                <Input
                  {...form.register("email")}
                  type="email"
                  placeholder="cliente@ejemplo.com"
                  disabled={isLoading}
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleEmailCheck}
                  disabled={isLoading || !email}
                  className="shrink-0"
                >
                  Verificar
                </Button>
              </div>
              {form.formState.errors.email && (
                <p className="text-red-600 text-sm mt-1">
                  {form.formState.errors.email.message}
                </p>
              )}
              {emailChecked && (
                <p className="text-green-600 text-sm mt-1">
                  ✓ Email disponible
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Teléfono
              </label>
              <Input
                {...form.register("phone")}
                placeholder="+598 99 123 456"
                disabled={isLoading}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tipo de Documento
                </label>
                <select
                  {...form.register("documentType")}
                  disabled={isLoading}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="">Seleccionar</option>
                  <option value="cedula">Cédula</option>
                  <option value="pasaporte">Pasaporte</option>
                  <option value="rut">RUT</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Número de Documento
                </label>
                <Input
                  {...form.register("documentNumber")}
                  placeholder="12345678"
                  disabled={isLoading}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Dirección
              </label>
              <Input
                {...form.register("address")}
                placeholder="Dirección completa"
                disabled={isLoading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ciudad
              </label>
              <Input
                {...form.register("city")}
                placeholder="Ciudad"
                disabled={isLoading}
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isLoading || !emailChecked}
            >
              {isLoading ? "Creando..." : "Crear Cliente"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}