"use client";

import React from "react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { OptimizedImageUpload } from "@/components/image-upload";

interface EditProgressDialogProps {
  isOpen: boolean;
  onClose: () => void;
  progressImages: string[];
  onProgressImagesChange: (files: File[]) => void;
  onChange?: (imageUrls: string[]) => void;
  disabled?: boolean;
  projectId?: string;
}

export function EditProgressDialog({
  isOpen,
  onClose,
  progressImages,
  onProgressImagesChange,
  onChange,
  disabled,
  projectId,
}: EditProgressDialogProps) {
  const handleImagesChange = (imageUrls: string[]) => {
    // Comunicar cambios al componente padre
    if (onChange) {
      onChange(imageUrls);
    }
  };

  const handleSave = () => {
    onClose();
  };

  const handleCancel = () => {
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-h-[80vh] w-full max-w-4xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Avances de Obra</DialogTitle>
          <DialogDescription>
            Selecciona y gestiona las imágenes de progreso del proyecto
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <OptimizedImageUpload
            value={progressImages || []}
            onChange={handleImagesChange}
            onFilesChange={onProgressImagesChange}
            entityType="project"
            entityId={projectId}
            maxImages={50}
            placeholder="Seleccionar imágenes de avance de obra del proyecto"
            disabled={disabled}
            showUploadButton={true}
            deferUpload={true}
          />
        </div>

        <DialogFooter>
          <button
            type="button"
            onClick={handleCancel}
            className="rounded border border-gray-300 px-4 py-2 hover:bg-gray-50"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="bg-primaryColor hover:bg-primaryColor/90 rounded px-4 py-2 text-white"
          >
            Guardar
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
