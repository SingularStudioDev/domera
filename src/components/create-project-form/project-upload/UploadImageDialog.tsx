import React, { useState } from "react";
import { useProjectImages } from "@/hooks/useProjectImages";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { OptimizedImageUpload } from "@/components/image-upload";
import { ProjectImage, ImageType } from "@/types/project-images";

interface ProjectMainImageDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  value: {
    images: string[] | ProjectImage[];
    name: string;
  };
  onChange: (data: { images: string[] | ProjectImage[] }) => void;
  onCardImageChange?: (files: File[]) => void;
  disabled?: boolean;
  projectId?: string;
}

export function ProjectMainImageDialog({
  isOpen,
  onOpenChange,
  value,
  onChange,
  onCardImageChange,
  disabled = false,
  projectId,
}: ProjectMainImageDialogProps) {
  const { cardImage } = useProjectImages(value.images);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const handleImagesChange = (imageUrls: string[]) => {
    // Update the preview if there's a new image
    if (imageUrls.length > 0) {
      setPreviewImage(imageUrls[0]);
    } else {
      setPreviewImage(null);
    }

    // Don't call onChange here - let the file handling be done by parent
    // through onCardImageChange only
  };

  const handleSave = () => {
    // If there's a preview image, create a ProjectImage object for card type
    if (previewImage) {
      const newCardImage: ProjectImage = {
        url: previewImage,
        type: ImageType.CARD,
        order: 0,
        metadata: {
          uploadedAt: new Date().toISOString(),
          isMain: true,
          altText: value.name || 'Imagen principal'
        }
      };
      
      // Filter out existing card images and add the new one
      const currentImages = Array.isArray(value.images) ? value.images : [];
      const existingImages = typeof currentImages[0] === 'string' ? 
        [] : // If legacy format, start fresh with new format
        (currentImages as ProjectImage[]).filter(img => img.type !== ImageType.CARD);
      
      const updatedImages = [...existingImages, newCardImage];
      
      onChange({ images: updatedImages });
    }
    onOpenChange(false);
  };

  const handleCancel = () => {
    setPreviewImage(null);
    onOpenChange(false);
  };

  // Reset preview when modal opens
  React.useEffect(() => {
    if (isOpen) {
      setPreviewImage(null);
    }
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] w-full max-w-4xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Imagen Principal del Proyecto</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div>
            <h4 className="text-md mb-3 font-medium">
              Seleccionar Imagen Principal
            </h4>
            <OptimizedImageUpload
              value={cardImage ? [cardImage.url] : []}
              onChange={handleImagesChange}
              onFilesChange={onCardImageChange}
              entityType="project"
              maxImages={1}
              placeholder="Seleccionar imagen principal"
              aspectRatio="aspect-video"
              disabled={disabled}
              showUploadButton={true}
              entityId={projectId}
              deferUpload={true}
            />
            <p className="mt-2 text-xs text-gray-500">
              Esta imagen aparecerá en las tarjetas de proyecto y será la imagen
              principal.
            </p>
          </div>

          <div>
            <h4 className="text-md mb-3 font-medium">
              Vista Previa en ProjectCard
            </h4>
            <div className="relative block overflow-hidden rounded-3xl border bg-white transition-shadow duration-300">
              <div className="group relative h-[300px] overflow-hidden">
                {previewImage || cardImage ? (
                  <img
                    src={previewImage || cardImage?.url || ""}
                    alt={value.name || "Vista previa"}
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
                          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 002 2z"
                        />
                      </svg>
                      <p className="text-sm">No hay imagen seleccionada</p>
                    </div>
                  </div>
                )}

                <div className="absolute top-3 left-3 flex gap-2 text-black">
                  <span className="rounded-2xl bg-white px-4 py-1 text-lg shadow-sm">
                    Pre-venta
                  </span>
                  <span className="rounded-2xl bg-white px-4 py-1 text-lg shadow-sm">
                    2024
                  </span>
                </div>

                <div className="absolute bottom-0 flex w-full items-end gap-5">
                  <div className="relative flex w-full flex-col gap-2 bg-white py-3 pr-4 pl-6 text-black">
                    <h3 className="w-full bg-white text-2xl font-medium">
                      {value.name || "Nombre del Proyecto"}
                    </h3>
                    <p className="w-full bg-white text-lg">Desde: $XXX.XXX</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={handleCancel}
          >
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
