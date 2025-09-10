"use client";

import React from "react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface EditDescriptionDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  description: string;
  shortDescription: string;
  onDescriptionChange: (description: string) => void;
  onShortDescriptionChange: (shortDescription: string) => void;
  disabled?: boolean;
}

export function EditDescriptionDialog({
  isOpen,
  onOpenChange,
  description,
  shortDescription,
  onDescriptionChange,
  onShortDescriptionChange,
  disabled = false,
}: EditDescriptionDialogProps) {
  const handleSave = () => {
    onOpenChange(false);
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[80vh] w-full max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Descripción</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Descripción principal
            </label>
            <textarea
              value={description}
              onChange={(e) => {
                const newValue = e.target.value.substring(0, 5000);
                onDescriptionChange(newValue);
              }}
              placeholder="Descripción detallada del proyecto..."
              disabled={disabled}
              rows={8}
              maxLength={5000}
              className="focus:ring-primaryColor w-full resize-none rounded-lg border border-gray-300 p-3 outline-none focus:border-transparent focus:ring-2"
            />
            <div className="mt-1 text-right text-xs text-gray-500">
              {description.length}/5000 caracteres
            </div>
          </div>
          
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Descripción corta
            </label>
            <textarea
              value={shortDescription}
              onChange={(e) => {
                const newValue = e.target.value.substring(0, 500);
                onShortDescriptionChange(newValue);
              }}
              placeholder="Resumen breve del proyecto..."
              disabled={disabled}
              rows={3}
              maxLength={500}
              className="focus:ring-primaryColor w-full resize-none rounded-lg border border-gray-300 p-3 outline-none focus:border-transparent focus:ring-2"
            />
            <div className="mt-1 text-right text-xs text-gray-500">
              {shortDescription.length}/500 caracteres
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={handleCancel}>
            Cancelar
          </Button>
          <Button type="button" onClick={handleSave}>
            Guardar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}