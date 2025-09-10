"use client";

import React, { useState } from "react";

import { formatCurrency } from "@/utils/utils";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { OptimizedImageUpload } from "@/components/image-upload";

interface HeroImageEditDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  value: {
    name: string;
    basePrice: number | null;
    neighborhood: string;
    city: string;
    estimatedCompletion: Date | null;
    images: string[];
  };
  currency: string;
  onImagesChange: (imageUrls: string[]) => void;
  onHeroImageChange?: (files: File[]) => void;
  disabled?: boolean;
}

export function HeroImageEditDialog({
  isOpen,
  onOpenChange,
  value,
  currency,
  onImagesChange,
  onHeroImageChange,
  disabled = false,
}: HeroImageEditDialogProps) {
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const handleImagesChange = (imageUrls: string[]) => {
    // Las URLs ya están procesadas por OptimizedImageUpload
    // Actualizar el preview si hay una imagen nueva
    if (imageUrls.length > 0) {
      setPreviewImage(imageUrls[0]);
    } else {
      setPreviewImage(null);
    }

    onImagesChange(imageUrls);
  };

  const handleSave = () => {
    // No resetear el preview aquí - mantener la imagen seleccionada
    // setPreviewImage(null);
    onOpenChange(false);
  };

  const handleCancel = () => {
    setPreviewImage(null);
    onOpenChange(false);
  };

  // Resetear preview cuando se abre el modal
  React.useEffect(() => {
    if (isOpen) {
      setPreviewImage(null);
    }
  }, [isOpen]);

  // Formatear precio para preview
  const formattedPrice = value.basePrice
    ? formatCurrency(value.basePrice)
    : "Consultar";

  const heroImage =
    value.images && value.images.length > 0 ? value.images[0] : null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] w-full max-w-6xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Imágenes del Proyecto</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Panel de selección de imágenes */}
          <div>
            <h4 className="text-md mb-3 font-medium">Seleccionar Imágenes</h4>
            <OptimizedImageUpload
              value={value.images || []}
              onChange={handleImagesChange}
              onFilesChange={onHeroImageChange}
              entityType="project"
              maxImages={1}
              placeholder="Seleccionar imagen HERO del proyecto"
              aspectRatio="aspect-video"
              disabled={disabled}
              showUploadButton={true}
              deferUpload={true}
            />
          </div>

          {/* Panel de preview */}
          <div>
            <h4 className="text-md mb-3 font-medium">Vista Previa del Hero</h4>
            <div className="relative h-64 overflow-hidden rounded-lg border">
              {previewImage || heroImage ? (
                <img
                  src={previewImage || heroImage || ""}
                  alt="Preview"
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-gray-200">
                  <div className="text-center text-gray-500">
                    <svg
                      className="mx-auto mb-2 h-12 w-12"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                    <p className="text-sm">No hay imagen seleccionada</p>
                  </div>
                </div>
              )}

              {/* Overlay del preview similar al hero real */}
              <div className="absolute inset-0 bg-gradient-to-b from-black/10 to-black/50"></div>
              <div className="absolute right-2 bottom-2 left-2">
                <div className="rounded-lg bg-white/90 p-2">
                  <h5 className="truncate text-sm font-semibold text-black">
                    {value.name || "Nombre del Proyecto"}
                  </h5>
                  <p className="text-xs text-gray-600">
                    Desde: {formattedPrice}
                  </p>
                </div>
              </div>
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
