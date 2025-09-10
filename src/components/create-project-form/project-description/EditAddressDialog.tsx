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

interface EditAddressDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  address: string;
  onAddressChange: (address: string) => void;
  disabled?: boolean;
}

export function EditAddressDialog({
  isOpen,
  onOpenChange,
  address,
  onAddressChange,
  disabled = false,
}: EditAddressDialogProps) {
  const handleSave = () => {
    onOpenChange(false);
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="w-full max-w-md">
        <DialogHeader>
          <DialogTitle>Editar Dirección</DialogTitle>
        </DialogHeader>
        
        <input
          type="text"
          value={address}
          onChange={(e) => {
            const newValue = e.target.value.substring(0, 500);
            onAddressChange(newValue);
          }}
          placeholder="Dirección completa del proyecto"
          disabled={disabled}
          maxLength={500}
          className="focus:ring-primaryColor w-full rounded-lg border border-gray-300 p-3 outline-none focus:border-transparent focus:ring-2"
        />
        <div className="mt-1 text-right text-xs text-gray-500">
          {address.length}/500 caracteres
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