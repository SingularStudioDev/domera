"use client";

import React from "react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface EditLocationDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  latitude: number | null;
  longitude: number | null;
  onLatitudeChange: (latitude: number | null) => void;
  onLongitudeChange: (longitude: number | null) => void;
  disabled?: boolean;
}

export function EditLocationDialog({
  isOpen,
  onOpenChange,
  latitude,
  longitude,
  onLatitudeChange,
  onLongitudeChange,
  disabled = false,
}: EditLocationDialogProps) {
  const handleSave = () => {
    onOpenChange(false);
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Editar Ubicación</DialogTitle>
          <DialogDescription>
            Modifica las coordenadas de latitud y longitud del proyecto
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Latitud
            </label>
            <input
              type="number"
              step="any"
              value={latitude || ""}
              onChange={(e) =>
                onLatitudeChange(
                  e.target.value ? Number(e.target.value) : null,
                )
              }
              placeholder="-34.9011"
              disabled={disabled}
              className="focus:ring-primaryColor w-full rounded-lg border border-gray-300 p-3 outline-none focus:border-transparent focus:ring-2"
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Longitud
            </label>
            <input
              type="number"
              step="any"
              value={longitude || ""}
              onChange={(e) =>
                onLongitudeChange(
                  e.target.value ? Number(e.target.value) : null,
                )
              }
              placeholder="-56.1645"
              disabled={disabled}
              className="focus:ring-primaryColor w-full rounded-lg border border-gray-300 p-3 outline-none focus:border-transparent focus:ring-2"
            />
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={handleCancel}>
            Cancelar
          </Button>
          <Button
            type="button"
            onClick={handleSave}
            className="bg-primaryColor hover:bg-primaryColor/90"
          >
            Guardar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}