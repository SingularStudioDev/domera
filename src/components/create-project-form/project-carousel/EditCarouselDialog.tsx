"use client";

import React from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { OptimizedImageUpload } from "@/components/image-upload";

interface EditCarouselDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  value: string[];
  onChange: (imageUrls: string[]) => void;
  onFilesChange?: (files: File[]) => void;
  projectId?: string;
  disabled?: boolean;
}

export function EditCarouselDialog({
  isOpen,
  onOpenChange,
  value,
  onChange,
  onFilesChange,
  projectId,
  disabled = false,
}: EditCarouselDialogProps) {
  const handleSave = () => {
    onOpenChange(false);
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[80vh] w-full max-w-4xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Carrusel de Imágenes</DialogTitle>
        </DialogHeader>

        <OptimizedImageUpload
          value={value || []}
          onChange={onChange}
          onFilesChange={onFilesChange}
          entityType="project"
          entityId={projectId}
          maxImages={10}
          placeholder="Seleccionar imágenes CAROUSEL del proyecto"
          aspectRatio="aspect-[16/10]"
          disabled={disabled}
          showUploadButton={true}
          deferUpload={true}
        />

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
